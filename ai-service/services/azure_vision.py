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

    def extract_text_from_image_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Sends image bytes to Azure Computer Vision (Read API) to extract printed and handwritten text.
        Falls back to a realistic mock result if Azure keys are not yet configured.
        """
        if not self.is_configured():
            print("[Azure Vision] No valid API credentials found. Using mock prescription response for development.")
            return self._get_mock_prescription()

        # Try Azure Vision Read v3.2 (standard for OCR/handwriting)
        analyze_url_v3 = f"{self.endpoint}/vision/v3.2/read/analyze"
        headers = {
            "Ocp-Apim-Subscription-Key": self.key,
            "Content-Type": "application/octet-stream",
        }

        try:
            # 1. Attempt Read API v3.2
            response = requests.post(analyze_url_v3, headers=headers, data=image_bytes, timeout=15)
            
            # If v3.2 is accepted (202), poll for results
            if response.status_code == 202:
                operation_url = response.headers.get("Operation-Location")
                if not operation_url:
                    return {
                        "success": False,
                        "error": "Missing Operation-Location header from Azure Read API response.",
                        "lines": [],
                        "raw_text": "",
                    }

                poll_headers = {"Ocp-Apim-Subscription-Key": self.key}
                for _ in range(12):
                    time.sleep(1)
                    poll_res = requests.get(operation_url, headers=poll_headers, timeout=10)
                    poll_json = poll_res.json()
                    status = poll_json.get("status")

                    if status == "succeeded":
                        lines = []
                        for read_result in poll_json.get("analyzeResult", {}).get("readResults", []):
                            for line in read_result.get("lines", []):
                                text = line.get("text", "").strip()
                                if text:
                                    lines.append(text)

                        return {
                            "success": True,
                            "lines": lines,
                            "raw_text": "\n".join(lines),
                            "mode": "azure_read_v3",
                        }
                    elif status == "failed":
                        return {
                            "success": False,
                            "error": "Azure Read API processing failed.",
                            "lines": [],
                            "raw_text": "",
                        }

                return {
                    "success": False,
                    "error": "Azure Read API timed out polling result.",
                    "lines": [],
                    "raw_text": "",
                }

            # 2. If v3.2 endpoint not found or returns 404, try Azure Image Analysis 4.0 (synchronous)
            analyze_url_v4 = f"{self.endpoint}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=read"
            v4_response = requests.post(analyze_url_v4, headers=headers, data=image_bytes, timeout=20)
            if v4_response.status_code == 200:
                v4_data = v4_response.json()
                lines = []
                read_blocks = v4_data.get("readResult", {}).get("blocks", [])
                for block in read_blocks:
                    for line in block.get("lines", []):
                        text = line.get("text", "").strip()
                        if text:
                            lines.append(text)
                return {
                    "success": True,
                    "lines": lines,
                    "raw_text": "\n".join(lines),
                    "mode": "azure_vision_v4",
                }

            return {
                "success": False,
                "error": f"Azure Vision request failed. Status: {response.status_code}, Body: {response.text[:250]}",
                "lines": [],
                "raw_text": "",
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Exception connecting to Azure: {str(e)}",
                "lines": [],
                "raw_text": "",
            }

    def _get_mock_prescription(self) -> Dict[str, Any]:
        """Realistic mock prescription response for development and testing."""
        lines = [
            "Dr. K. Silva (MBBS, MD)",
            "Date: 23/10/2026",
            "Rx:",
            "1. Amoxicillin 500mg - 1 capsule TDS x 5 days (After meals)",
            "2. Paracetamol 500mg - 2 tablets QDS PRN (For fever)",
            "3. Cetirizine 10mg - 1 tablet Nocte x 5 days (At night)",
        ]
        return {
            "success": True,
            "lines": lines,
            "raw_text": "\n".join(lines),
            "mode": "mock_development",
        }

azure_vision_service = AzureVisionService()
