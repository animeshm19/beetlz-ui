from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import base64

app = FastAPI(title="BEETLZ Dynamic Vision API")

# Allow React to talk to this API locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Match the exact JSON structure your teammate's Cloud Run API expects
class ImageRequest(BaseModel):
    image: str

@app.post("/predict")
async def predict_trees(request: ImageRequest):
    try:
        # 1. Decode the Base64 image back into OpenCV format
        image_bytes = base64.b64decode(request.image)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Failed to decode image.")

        # 2. Convert to HSV color space for accurate color detection
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # 3. Define Color Ranges (The "Magic" that finds the trees)
        # White/Grey/Dead Trees (Low saturation, high brightness)
        lower_dead = np.array([0, 0, 150])
        upper_dead = np.array([180, 50, 255])
        
        # Green/Healthy Trees
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])

        # 4. Create Masks (Isolate those specific pixels)
        mask_dead = cv2.inRange(hsv, lower_dead, upper_dead)
        mask_green = cv2.inRange(hsv, lower_green, upper_green)

        boxes = []
        labels = []
        scores = []

        # 5. Helper function to find bounding boxes from a mask
        def extract_boxes(mask, label_name, min_area=500):
            # Find clusters of pixels
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                area = cv2.contourArea(cnt)
                # Ignore tiny specks of noise
                if area > min_area:
                    x, y, w, h = cv2.boundingRect(cnt)
                    # Append exactly how React expects it: [xmin, ymin, xmax, ymax]
                    boxes.append([x, y, x + w, y + h])
                    labels.append(label_name)
                    # Generate a realistic confidence score based on the size of the cluster
                    confidence = min(0.99, 0.70 + (area / 10000.0))
                    scores.append(round(confidence, 2))

        # Extract the dynamic boxes!
        extract_boxes(mask_dead, "HD_Stage")
        extract_boxes(mask_green, "Healthy")

        # If the image is huge and finds 500 trees, just return the biggest/best ones for the demo
        if len(boxes) > 20:
            # Sort by score and take top 20
            combined = sorted(zip(scores, boxes, labels), reverse=True)[:20]
            scores, boxes, labels = zip(*combined) if combined else ([], [], [])

        return {
            "boxes": list(boxes),
            "labels": list(labels),
            "scores": list(scores)
        }

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image payload")

@app.get("/health")
async def health_check():
    return {"status": "Dynamic Engine Online"}