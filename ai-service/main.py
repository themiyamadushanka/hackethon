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
from services.agent_service import agent_service

app = FastAPI(
    title="AI Prescription & Computer Vision Service",
    description="FastAPI service for Azure Computer Vision prescription OCR and agentic humanization",
    version="1.0.0",
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
async def analyze_prescription(request: Request, file: Optional[UploadFile] = File(None)):
    """
    Uploads an image, extracts text via Azure Computer Vision,
    and runs the AI Agent to humanize instructions.
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

    ocr_result = azure_vision_service.extract_text_from_image_bytes(image_bytes)
    if not ocr_result.get("success"):
        raise HTTPException(status_code=502, detail=ocr_result.get("error", "Vision OCR failed"))

    raw_text = ocr_result.get("raw_text", "")
    agent_output = agent_service.humanize_prescription(raw_text)

    return {
        "success": True,
        "mode": ocr_result.get("mode"),
        "extracted_text": raw_text,
        "lines": ocr_result.get("lines", []),
        "humanized": agent_output,
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
