import os
from typing import Optional
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv

_ai_dir = Path(__file__).resolve().parent
_env_path = _ai_dir / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()

from services.azure_vision import azure_vision_service
from services.agent_service import agent_service, agricultural_agent_service

app = FastAPI(
    title="AgroVision AI - Plant Leaf Disease & Crop Health Doctor",
    description="FastAPI service for Azure Computer Vision plant leaf disease detection and agricultural AI agent guidance",
    version="2.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HumanizeRequest(BaseModel):
    raw_text: str

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "FastAPI AI Vision Service",
        "azure_configured": azure_vision_service.is_configured(),
    }


@app.post("/api/v1/vision/extract-text")
async def extract_text(request: Request, file: Optional[UploadFile] = File(None)):
    """
    Directly uploads an image to Azure Computer Vision,
    extracts all printed and handwritten text, and returns the extracted text.
    Supports both multipart/form-data (file upload) and raw binary image streams.
    """
    image_bytes = None

    if file is not None:
        image_bytes = await file.read()
    else:
        # Check if raw binary was posted
        content_type = request.headers.get("content-type", "")
        if content_type.startswith("image/") or "octet-stream" in content_type:
            image_bytes = await request.body()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image provided. Upload a file via multipart form-data ('file') or send image binary.")

    ocr_result = azure_vision_service.extract_text_from_image_bytes(image_bytes)
    if not ocr_result.get("success"):
        raise HTTPException(status_code=502, detail=ocr_result.get("error", "Vision OCR failed"))

    lines = ocr_result.get("lines", [])
    raw_text = ocr_result.get("raw_text", "")

    return {
        "success": True,
        "mode": ocr_result.get("mode"),
        "extracted_text": raw_text,
        "lines": lines,
        "line_count": len(lines),
    }

@app.post("/api/v1/vision/analyze")
async def analyze_crop_leaf(request: Request, file: Optional[UploadFile] = File(None)):
    """
    Uploads a plant leaf image, extracts visual features (captions, tags, colors)
    via Azure Computer Vision Image Analysis, and generates an Agricultural Diagnosis Report.
    Supports multipart form-data ('file') and raw binary image streams.
    """
    image_bytes = None

    if file is not None:
        image_bytes = await file.read()
    else:
        content_type = request.headers.get("content-type", "")
        if content_type.startswith("image/") or "octet-stream" in content_type:
            image_bytes = await request.body()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image provided. Upload a file via multipart form-data ('file') or send image binary.")

    # 1. Azure Computer Vision Image Analysis (visual features, tags, captions)
    vision_result = azure_vision_service.analyze_image_visuals(image_bytes)
    if not vision_result.get("success"):
        raise HTTPException(status_code=502, detail=vision_result.get("error", "Azure Computer Vision analysis failed"))

    # 2. Agricultural AI Agent Diagnosis
    diagnosis = agricultural_agent_service.diagnose_leaf(vision_result)

    caption = vision_result.get("caption", "")
    lines = vision_result.get("lines", [])
    raw_text = vision_result.get("raw_text", "") or caption

    item_name = diagnosis.get("item_name", "Unknown Item")

    return {
        "success": True,
        "mode": vision_result.get("engine", "azure_vision"),
        "item_name": item_name,
        "caption": caption,
        "tags": vision_result.get("tags", []),
        "objects": vision_result.get("objects", []),
        "dense_captions": vision_result.get("dense_captions", []),
        "lines": lines,
        "extracted_text": raw_text,
        "diagnosis": diagnosis,
        # Backward compatibility for existing UI hooks
        "humanized": {
            "agent_status": "ready",
            "item_name": item_name,
            "crop_type": diagnosis.get("crop_type"),
            "disease_name": diagnosis.get("disease_name"),
            "severity": diagnosis.get("severity"),
            "patient_guidance": diagnosis.get("organic_treatment", []),
            "empathetic_note": diagnosis.get("empathetic_note", ""),
            "sinhala_summary": diagnosis.get("sinhala_summary", ""),
        },
    }

@app.post("/api/v1/agent/humanize")
def humanize_text(payload: HumanizeRequest):
    """
    Direct endpoint for the AI Agent layer to humanize any raw text.
    """
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty.")

    output = agent_service.humanize_prescription(payload.raw_text)
    return {
        "success": True,
        "humanized": output,
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 [AI Service] FastAPI running on http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
