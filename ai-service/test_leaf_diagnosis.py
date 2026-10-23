"""
Quick Test Script for AgroVision AI - Plant Leaf Disease Detection.
Usage:
    python ai-service/test_leaf_diagnosis.py
    python ai-service/test_leaf_diagnosis.py path/to/leaf_photo.jpg
"""
import sys
import os
import io

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.azure_vision import azure_vision_service
from services.agent_service import agricultural_agent_service

def test_leaf(image_path: str = None):
    print("==================================================")
    print("   AgroVision AI - Leaf Disease & Crop Health")
    print("==================================================")
    print(f"Azure Endpoint: {azure_vision_service.endpoint}")
    print(f"Is Configured:  {azure_vision_service.is_configured()}\n")

    if image_path and os.path.exists(image_path):
        print(f"Loading leaf image from: {image_path}")
        with open(image_path, "rb") as f:
            image_bytes = f.read()
    else:
        print("Generating a test sample diseased leaf with PIL...")
        from PIL import Image, ImageDraw
        img = Image.new("RGB", (400, 400), color=(34, 139, 34)) # Forest green leaf
        draw = ImageDraw.Draw(img)
        # Draw necrotic blight spots
        draw.ellipse([80, 80, 160, 160], fill=(139, 69, 19), outline=(255, 215, 0), width=4)
        draw.ellipse([200, 180, 290, 270], fill=(101, 67, 33), outline=(255, 215, 0), width=4)
        draw.ellipse([140, 260, 200, 320], fill=(160, 82, 45), outline=(255, 255, 0), width=3)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        image_bytes = buf.getvalue()
        
        sample_path = os.path.join(os.path.dirname(__file__), "sample_leaf.png")
        img.save(sample_path)
        print(f"Sample diseased leaf created at: {sample_path}")

    print("\nAnalyzing leaf visual features with Azure Computer Vision...")
    vision_res = azure_vision_service.analyze_image_visuals(image_bytes)
    
    print("\nRunning Agricultural AI Agent...")
    diagnosis = agricultural_agent_service.diagnose_leaf(vision_res)

    print("\n--- [AGROVISION DIAGNOSTIC REPORT] ---")
    print(f"Item Name:          {diagnosis.get('item_name')}")
    print(f"Engine:             {vision_res.get('engine')}")
    print(f"Crop / Object:      {diagnosis.get('crop_type')}")
    print(f"Diagnosis / State:  {diagnosis.get('disease_name')}")
    print(f"Causative Agent:    {diagnosis.get('causative_agent')}")
    print(f"Severity:           {diagnosis.get('severity')}")
    print(f"Visual Symptoms:    {diagnosis.get('visual_symptoms')}")
    print(f"Detected Tags:      {', '.join(t.get('name') if isinstance(t, dict) else str(t) for t in vision_res.get('tags', [])[:6])}")
    print("\nOrganic Treatments:")
    for t in diagnosis.get("organic_treatment", []):
        print(f"  * {t}")
    print("\nChemical Treatments:")
    for t in diagnosis.get("chemical_treatment", []):
        print(f"  * {t}")
    print("\nPrevention:")
    for p in diagnosis.get("prevention", []):
        print(f"  * {p}")

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    test_leaf(path)
