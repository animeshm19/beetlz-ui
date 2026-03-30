# BEETLZ 

BEETLZ is a high-fidelity spatial analysis engine designed to detect and map forest canopy damage caused by the Spruce Bark Beetle.

By utilizing advanced computer vision techniques, BEETLZ provides land managers and forestry companies with rapid, actionable intelligence.

## The Problem

Manual inspection of forest canopies for beetle damage is time-consuming, expensive, and often reactive. The Spruce Bark Beetle causes devastating financial and ecological losses. Early detection is critical, but analyzing vast amounts of aerial or drone imagery requires specialized tools.

## The BEETLZ Solution

BEETLZ automates this process through a two-part system:

1.  **Dynamic Computer Vision Backend:** A FastAPI service that uses OpenCV to analyze image textures (Laplacian Variance), chlorophyll indices (Mean Gray), and color histograms to identify damaged versus healthy canopies.
2.  **Interactive Telemetry Dashboard:** A React-based frontend that renders the extracted data into the interface. It visualizes the detections with dynamic bounding boxes and calculates the estimated financial impact in real-time.

-----

## System Architecture

The BEETLZ platform is built on a modern, decoupled architecture:

  * **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons.
  * **Backend:** Python, FastAPI, OpenCV, Uvicorn.
  * **Deployment Integration:** Designed to interface seamlessly with cloud-hosted PyTorch inference models (e.g., Google Cloud Run).

### Core Features

  * **Aerial Feed Ingestion:** Drag-and-drop interface for mounting high-resolution canopy imagery (JPG/PNG/TIFF).
  * **Dynamic Spatial Rendering:** Real-time generation of bounding boxes over detected targets, complete with interactive confidence scoring.
  * **Texture & Reflectance Analysis:** Automated extraction of Laplacian variance and Green-Band reflectance histograms to quantify canopy health.
  * **Canopy Intervention Cost Matrix:** An interactive decision-support tool that calculates the "Infection Lock Savings" versus "Preventative Revenue Loss" based on user-defined harvest premiums and quarantine radii.
  * **Cross-Dataset Domain Analysis (Nexus View):** A module designed to compare feature distributions between training sets (e.g., LILA Science Larch Casebearer data) and inference targets (Kaggle Spruce Bark Beetle data).
  * **Live Telemetry Stream:** A raw JSON terminal outputting the live data payload from the API.

-----

## Getting Started

Follow these instructions to run the BEETLZ engine locally on your machine.

### Prerequisites

  * Node.js (v16+)
  * Python (3.9+)
  * npm or yarn

### 1\. Backend Setup (FastAPI & OpenCV)

The backend handles the image processing and computer vision algorithms.

1.  Navigate to the API directory:

    ```bash
    cd beetlz-api
    ```

2.  Create a virtual environment (Recommended):

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use: venv\Scripts\activate
    ```

3.  Install the required Python packages:

    ```bash
    pip install fastapi uvicorn opencv-python-headless numpy python-multipart pydantic
    ```

4.  Start the Uvicorn server:

    ```bash
    uvicorn main:app --reload --port 8000
    ```

    *The API will now be running at `http://localhost:8000`.*

### 2\. Frontend Setup (React & Vite)

The frontend provides the interactive dashboard and visualizations.

1.  Open a **new** terminal window and navigate to the root of the project (where `package.json` is located).

2.  Install the Node dependencies:

    ```bash
    npm install
    ```

    *(Ensure you have installed `framer-motion` and `lucide-react` as they are required for the UI).*

3.  Start the Vite development server:

    ```bash
    npm run dev
    ```

    *The application will typically be available at `http://localhost:5173`.*

-----

## Usage Guide for Demonstrations

1.  **Launch both servers:** Ensure both the FastAPI backend and the Vite frontend are running.
2.  **Mount Telemetry:** Open the React app in your browser. Drag and drop a sample aerial image of a forest canopy into the dropzone.
3.  **Execute Inference:** Click the "Execute Inference Analysis" button.
4.  **Explore the Dashboard:**
      * Hover over the bounding boxes on the image to see the detection labels and confidence scores.
      * Adjust the sliders in the **Financial Cost Matrix** to simulate different economic scenarios.
      * Observe the live data stream in the terminal window at the bottom right.

## Future Roadmap & Real-World Integration

This repository currently utilizes a dynamic OpenCV algorithm to simulate the backend processing for demonstration purposes.

The architecture is fully prepared to integrate with a trained PyTorch or TensorFlow model. To transition to a production ML model:

1.  Deploy the trained model to a service like Google Cloud Run.
2.  Update the `fetch` URL in `src/App.jsx` (`runAnalysis` function) to point to the new cloud endpoint (e.g., `https://my-model-service...run.app/predict`).
3.  The frontend will automatically parse the returned `boxes`, `labels`, and `scores` arrays and render the UI accordingly.