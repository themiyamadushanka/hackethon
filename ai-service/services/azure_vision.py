import os
import time
import requests
from pathlib import Path
from typing import Dict, Any, List
from dotenv import load_dotenv

# Explicitly load .env from ai-service directory or current directory
_ai_dir = Path(__file__).resolve().parent.parent
_env_path = _ai_dir / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()

class AzureVisionService:
    def __init__(self):
        # Refresh env vars on init in case dotenv was loaded
        self.endpoint = os.getenv("AZURE_VISION_ENDPOINT", "").rstrip("/")
        self.key = os.getenv("AZURE_VISION_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.endpoint and self.key and "your-resource" not in self.endpoint)

    def analyze_image_visuals(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Sends image bytes to Azure Computer Vision (Image Analysis 4.0 / 3.2)
        to extract visual features: Captions, Tags, Objects, Colors, and any detected Text.
        """
        if not self.is_configured():
            print("[Azure Vision] No valid API credentials found. Using mock leaf analysis response.")
            return self._get_mock_leaf_analysis()

        headers = {
            "Ocp-Apim-Subscription-Key": self.key,
            "Content-Type": "application/octet-stream",
        }

        # 1. Attempt Azure Image Analysis 3.2 (Confirmed working on themiyavision, responses in ~1-2s)
        v3_url = f"{self.endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Color,Tags,Objects"
        try:
            res_v3 = requests.post(v3_url, headers=headers, data=image_bytes, timeout=6)
            if res_v3.status_code == 200:
                data = res_v3.json()
                captions = data.get("description", {}).get("captions", [])
                caption = captions[0].get("text", "") if captions else ""
                confidence = captions[0].get("confidence", 0.0) if captions else 0.0

                tags = []
                for t in data.get("tags", []):
                    tags.append({"name": t.get("name"), "confidence": t.get("confidence")})

                objects = []
                for obj in data.get("objects", []):
                    obj_name = obj.get("object", "")
                    if obj_name:
                        objects.append({"name": obj_name, "confidence": obj.get("confidence", 0.0)})

                color_info = data.get("color", {})
                dominant_colors = color_info.get("dominantColors", [])

                return {
                    "success": True,
                    "engine": "azure_image_analysis_v3",
                    "caption": caption,
                    "caption_confidence": confidence,
                    "tags": tags,
                    "objects": objects,
                    "dominant_colors": dominant_colors,
                    "lines": [],
                    "raw_text": caption,
                }
        except Exception as e:
            print(f"[Azure Vision] v3 fast request error: {e}")

        # 2. Fallback to Image Analysis 4.0 if v3 fails
        v4_url = f"{self.endpoint}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=caption,tags,read"
        try:
            res_v4 = requests.post(v4_url, headers=headers, data=image_bytes, timeout=6)
            if res_v4.status_code == 200:
                data = res_v4.json()
                caption = data.get("captionResult", {}).get("text", "")
                confidence = data.get("captionResult", {}).get("confidence", 0.0)

                tags = []
                for t in data.get("tagsResult", {}).get("values", []):
                    tags.append({"name": t.get("name"), "confidence": t.get("confidence")})

                return {
                    "success": True,
                    "engine": "azure_image_analysis_v4",
                    "caption": caption,
                    "caption_confidence": confidence,
                    "tags": tags,
                    "lines": [],
                    "raw_text": caption,
                }
            else:
                return {
                    "success": False,
                    "error": f"Azure Image Analysis failed. Status: {res_v3.status_code}, Body: {res_v3.text[:200]}",
                    "tags": [],
                    "lines": [],
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Azure Vision exception: {str(e)}",
                "tags": [],
                "lines": [],
            }

    def extract_text_from_image_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Backward compatibility for OCR text reading if needed.
        """
        analysis = self.analyze_image_visuals(image_bytes)
        if analysis.get("success"):
            return {
                "success": True,
                "mode": analysis.get("engine", "azure_vision"),
                "lines": analysis.get("lines", []),
                "raw_text": analysis.get("raw_text", analysis.get("caption", "")),
                "tags": analysis.get("tags", []),
                "caption": analysis.get("caption", ""),
            }
        return self._get_mock_leaf_analysis()

    def _get_mock_leaf_analysis(self) -> Dict[str, Any]:
        """Realistic mock agricultural leaf analysis for offline development."""
        return {
            "success": True,
            "engine": "mock_agro_vision",
            "caption": "a close-up of a diseased plant leaf with circular brown spots and yellow halos",
            "caption_confidence": 0.94,
            "tags": [
                {"name": "leaf", "confidence": 0.99},
                {"name": "plant", "confidence": 0.98},
                {"name": "flora", "confidence": 0.95},
                {"name": "blight", "confidence": 0.89},
                {"name": "fungus", "confidence": 0.86},
                {"name": "spot", "confidence": 0.84},
                {"name": "yellow", "confidence": 0.81},
                {"name": "necrotic", "confidence": 0.78},
            ],
            "dense_captions": [
                "circular dark brown lesion with concentric rings",
                "chlorotic yellow ring surrounding infected tissue",
                "healthy green leaf margin",
            ],
            "dominant_colors": ["Green", "Yellow", "Brown"],
            "objects": [{"name": "leaf", "confidence": 0.95}],
            "lines": [],
            "raw_text": "",
        }

azure_vision_service = AzureVisionService()
