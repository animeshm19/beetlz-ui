import base64
import logging
import os
import threading

import cv2
import numpy as np
import torch
from torchvision.models.detection import retinanet_resnet50_fpn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("beetlz-api")

# ---------------------------------------------------------------------------
# Class mapping — confirmed from model weights analysis:
# cls_logits.bias = 18 elements, 18 / 9 anchors = 2 foreground classes
# RetinaNet uses 1-indexed foreground labels (0 = background, never returned)
# ---------------------------------------------------------------------------
LABEL_MAP = {0: "HD", 1: "LD"}
NUM_CLASSES = 2  # foreground only (HD, LD); background handled internally by RetinaNet

# ---------------------------------------------------------------------------
# Model path — .pth file must sit next to main.py inside beetlz-api/
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phase3_spruce_full_best.pth")

app = FastAPI(title="BEETLZ CV Engine", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://beetlz-ui.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Model state — loaded in a background thread so uvicorn starts instantly
# and passes Cloud Run's health check before the model finishes loading
# ---------------------------------------------------------------------------
model = None
model_ready = threading.Event()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _load_model_background():
    global model
    logger.info("Loading model in background thread from %s on device=%s", MODEL_PATH, device)
    try:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(
                f"Model weights not found at {MODEL_PATH}. "
                "Make sure phase3_spruce_full_best.pth is in the beetlz-api/ directory."
            )

        m = retinanet_resnet50_fpn(
            num_classes=NUM_CLASSES,
            pretrained=False,
            pretrained_backbone=False,
        )

        state = torch.load(MODEL_PATH, map_location=device)

        # Handle both raw state_dict saves and checkpoint dicts
        if isinstance(state, dict) and "model_state_dict" in state:
            state = state["model_state_dict"]
        elif isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]

        m.load_state_dict(state)
        m.to(device)
        m.eval()
        model = m
        logger.info("Model loaded successfully.")

    except Exception as e:
        logger.error("Model loading failed: %s", e)

    finally:
        # Always unblock — even on failure, so /predict returns a clean 503
        model_ready.set()


@app.on_event("startup")
def startup():
    # Spin up background thread — uvicorn is free to accept requests immediately
    thread = threading.Thread(target=_load_model_background, daemon=True)
    thread.start()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    image: str  # base64-encoded image (data-URI prefix optional)


class PredictResponse(BaseModel):
    boxes: list[list[float]]
    labels: list[str]
    scores: list[float]
    processed_image: str  # base64 JPEG of the annotated image


# ---------------------------------------------------------------------------
# Health check — returns instantly so Cloud Run doesn't kill the container
# ---------------------------------------------------------------------------
@app.get("/")
def health():
    return {
        "status": "ok" if model is not None else "loading",
        "engine": "BEETLZ Real-Model Inference v4.0",
        "device": str(device),
        "model_loaded": model is not None,
    }


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------
def decode_image(b64: str) -> np.ndarray:
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image — ensure it is a valid JPG/PNG/TIFF.")
    return img


def preprocess(bgr: np.ndarray) -> torch.Tensor:
    """
    BGR uint8 → RGB float32 tensor in [0, 1].
    torchvision RetinaNet handles its own ImageNet normalisation internally.
    """
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    tensor = torch.from_numpy(rgb).permute(2, 0, 1).float() / 255.0
    return tensor.to(device)


def draw_detections(img: np.ndarray, boxes, labels, scores) -> np.ndarray:
    out = img.copy()
    h, w = out.shape[:2]
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = max(0.45, w / 1600)
    thickness = max(1, w // 500)

    for box, label, score in zip(boxes, labels, scores):
        x1, y1, x2, y2 = int(box[0]), int(box[1]), int(box[2]), int(box[3])
        is_hd = label.upper() == "HD"
        color = (50, 50, 235) if is_hd else (50, 185, 50)  # BGR: red / green

        cv2.rectangle(out, (x1, y1), (x2, y2), color, thickness)

        # Corner reticles
        cl = max(8, (x2 - x1) // 6)
        cw = thickness + 1
        cv2.line(out, (x1, y1), (x1 + cl, y1), color, cw)
        cv2.line(out, (x1, y1), (x1, y1 + cl), color, cw)
        cv2.line(out, (x2, y2), (x2 - cl, y2), color, cw)
        cv2.line(out, (x2, y2), (x2, y2 - cl), color, cw)

        text = f"[{label}] {score * 100:.1f}%"
        (tw, th), bl = cv2.getTextSize(text, font, font_scale, thickness)
        lx = max(0, min(x1, w - tw - 6))
        ly = max(th + bl + 4, y1 - 4)
        cv2.rectangle(out, (lx, ly - th - bl - 4), (lx + tw + 6, ly), (10, 10, 10), -1)
        cv2.rectangle(out, (lx, ly - th - bl - 4), (lx + tw + 6, ly), color, thickness)
        cv2.putText(out, text, (lx + 3, ly - bl - 2), font, font_scale, color, thickness, cv2.LINE_AA)

    return out


def encode_b64(img: np.ndarray, quality: int = 90) -> str:
    _, buf = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    return base64.b64encode(buf.tobytes()).decode("utf-8")


# ---------------------------------------------------------------------------
# Prediction endpoint
# ---------------------------------------------------------------------------
@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    # Wait up to 120s for model to finish loading before giving up
    if not model_ready.wait(timeout=120):
        raise HTTPException(status_code=503, detail="Model is still loading, please try again in a moment.")
    if model is None:
        raise HTTPException(status_code=503, detail="Model failed to load. Check server logs.")

    try:
        img_bgr = decode_image(req.image)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Image decode failed: {exc}")

    logger.info("Image received — shape %s", img_bgr.shape)

    tensor = preprocess(img_bgr)

    with torch.no_grad():
        outputs = model([tensor])

    output = outputs[0]
    boxes_t  = output["boxes"].cpu().numpy()
    labels_t = output["labels"].cpu().numpy()
    scores_t = output["scores"].cpu().numpy()

    conf_threshold = 0.45
    keep = scores_t >= conf_threshold
    boxes_t  = boxes_t[keep]
    labels_t = labels_t[keep]
    scores_t = scores_t[keep]

    label_names = [LABEL_MAP.get(int(l), f"class_{l}") for l in labels_t]

    logger.info(
        "Detections after threshold=%.2f: %d boxes — %s",
        conf_threshold, len(boxes_t), label_names,
    )

    annotated = draw_detections(img_bgr, boxes_t, label_names, scores_t)

    return PredictResponse(
        boxes=[b.tolist() for b in boxes_t],
        labels=label_names,
        scores=[float(s) for s in scores_t],
        processed_image=encode_b64(annotated),
    )
