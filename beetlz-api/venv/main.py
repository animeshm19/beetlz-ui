from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
import random

app = FastAPI(title="BEETLZ Engine API")

# Configure CORS to allow your local React app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_canopy(file: UploadFile = File(...)):
    # 1. Basic Validation
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    # 2. Read the image bytes 
    image_bytes = await file.read()
    
    # ---------------------------------------------------------
    # 🧠 ML INFERENCE ZONE (Your Future Code Goes Here)
    # ---------------------------------------------------------
    # import cv2
    # import numpy as np
    # image_array = np.frombuffer(image_bytes, np.uint8)
    # image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    # 
    # # Calculate features
    # laplacian_var = cv2.Laplacian(image, cv2.CV_64F).var()
    # mean_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).mean()
    #
    # # Run Model
    # model_outputs = my_pytorch_model(image)
    # parsed_boxes = convert_to_json_format(model_outputs)
    # ---------------------------------------------------------

    # Simulating processing time for the UI effect
    time.sleep(2) 

    # 3. Return the exact JSON structure the React dashboard expects
    # Generating slightly randomized data so you can see it change on every upload
    return {
        "hdCount": random.randint(4, 15),
        "otherCount": random.randint(20, 45),
        "meanGray": f"{random.uniform(105.0, 125.0):.1f}",
        "laplacian": f"{random.uniform(750.0, 950.0):.1f}",
        "boxes": [
            # Randomizing box positions to simulate different image geometries
            {"x": random.randint(10, 30), "y": random.randint(20, 40), "w": 12, "h": 18, "class": "HD", "conf": random.randint(88, 98)},
            {"x": random.randint(40, 60), "y": random.randint(40, 60), "w": 9, "h": 14, "class": "HD", "conf": random.randint(85, 95)},
            {"x": random.randint(65, 85), "y": random.randint(15, 30), "w": 10, "h": 16, "class": "Other", "conf": random.randint(90, 99)},
            {"x": random.randint(5, 20), "y": random.randint(65, 85), "w": 11, "h": 15, "class": "HD", "conf": random.randint(75, 89)},
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "BEETLZ Engine Online"}