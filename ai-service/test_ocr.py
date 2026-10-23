"""
Quick Test Script for Azure Computer Vision Text Extraction.
Usage:
    python ai-service/test_ocr.py
    python ai-service/test_ocr.py path/to/your/image.jpg
"""
import sys
import os
import io

# Ensure ai-service directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.azure_vision import azure_vision_service

def test_image(image_path: str = None):
    print("==================================================")
    print("   Azure Computer Vision - Image Text Extraction")
    print("==================================================")
    print(f"Azure Endpoint: {azure_vision_service.endpoint}")
    print(f"Is Configured:  {azure_vision_service.is_configured()}\n")

    if image_path and os.path.exists(image_path):
        print(f"Reading user image: {image_path}")
        with open(image_path, "rb") as f:
            image_bytes = f.read()
    else:
        print("Generating a test prescription image with PIL...")
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (500, 220), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.text((25, 25), "Dr. K. Silva (MBBS, MD)", fill=(0, 0, 0))
        draw.text((25, 60), "Rx:", fill=(0, 0, 0))
        draw.text((25, 95), "1. Amoxicillin 500mg - 1 capsule TDS x 5 days", fill=(0, 0, 0))
        draw.text((25, 130), "2. Paracetamol 500mg - 2 tablets QDS PRN", fill=(0, 0, 0))
        draw.text((25, 165), "3. Cetirizine 10mg - 1 tablet at night", fill=(0, 0, 0))

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        image_bytes = buf.getvalue()
        
        # Save sample for user to view if they want
        sample_path = os.path.join(os.path.dirname(__file__), "sample_prescription.png")
        img.save(sample_path)
        print(f"Sample image generated at: {sample_path}")

    print("\nSending image bytes to Azure Computer Vision...")
    result = azure_vision_service.extract_text_from_image_bytes(image_bytes)

    print("\n--- [RESULT] ---")
    print(f"Success:    {result.get('success')}")
    print(f"Engine Mode:{result.get('mode')}")
    print(f"Line Count: {len(result.get('lines', []))}")
    print("\nExtracted Text Lines:")
    for idx, line in enumerate(result.get("lines", []), 1):
        print(f"  {idx}. {line}")

    if not result.get("success"):
        print(f"\nError: {result.get('error')}")

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    test_image(path)
