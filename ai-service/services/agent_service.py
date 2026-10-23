import re
from typing import Dict, Any

class AgriculturalAgentService:
    """
    Simplified Computer Vision Item Recognition Service.
    Recognizes whatever item is uploaded (e.g., Table, Car, Phone, Leaf, Chair, etc.)
    and returns a clean, direct item response.
    """

    def extract_item_name(self, vision_data: Dict[str, Any]) -> str:
        """
        Extracts the simple item name from Azure Computer Vision objects, captions, and tags.
        """
        objects = vision_data.get("objects", [])
        caption = (vision_data.get("caption") or "").strip().lower()
        tags = vision_data.get("tags", [])

        # 1. Direct detected objects (Car, Table, Person, Chair, Laptop, etc.)
        if objects:
            for obj in objects:
                name = obj.get("name", "").strip().lower()
                if name and name not in ["land", "circle", "sky"]:
                    return name.title()

        # 2. Match common item names in caption or tags
        common_items = [
            "table", "car", "chair", "sofa", "bed", "desk", "laptop", "computer",
            "phone", "smartphone", "mobile phone", "bottle", "cup", "mug", "book",
            "clock", "watch", "shoe", "bag", "backpack", "bicycle", "bike", "motorcycle",
            "bus", "truck", "airplane", "dog", "cat", "bird", "horse", "leaf", "plant",
            "flower", "tree", "apple", "banana", "orange", "food", "plate", "person"
        ]

        # Check caption for whole words
        for item in common_items:
            if re.search(r'\b' + re.escape(item) + r'\b', caption):
                return item.title()

        # Check tags for direct item match
        tag_names = [(t.get("name") if isinstance(t, dict) else str(t)).lower() for t in tags]
        for item in common_items:
            if item in tag_names:
                return item.title()

        # 3. Clean caption if no exact keyword matched
        if caption:
            clean = caption
            prefixes = [
                "a close up of a ", "a close up of an ", "a close up of ",
                "a close-up of a ", "a close-up of an ", "a close-up of ",
                "a photo of a ", "a photo of an ", "a photo of ",
                "a picture of a ", "a picture of an ", "a picture of ",
                "an image of a ", "an image of an ", "an image of ",
                "a view of a ", "a view of an ", "a view of ",
                "a ", "an ", "the "
            ]
            for p in prefixes:
                if clean.startswith(p):
                    clean = clean[len(p):]
                    break

            for sep in [" on ", " in ", " with ", " sitting ", " standing ", " parked ", " next to ", " and "]:
                if sep in clean:
                    clean = clean.split(sep)[0].strip()

            if clean and len(clean) > 1 and clean not in ["chart", "bubble chart"]:
                return clean.title()

        # 4. Fallback to top non-generic tag
        ignored = {
            "screenshot", "circle", "colorfulness", "indoor", "outdoor", "background",
            "close-up", "macro photography", "surface", "design", "pattern", "text"
        }
        for name in tag_names:
            if name not in ignored and len(name) > 2:
                return name.title()

        if caption:
            return caption.capitalize()

        return "Unknown Item"

    def diagnose_leaf(self, vision_data: Dict[str, Any], user_prompt: str = "") -> Dict[str, Any]:
        """
        Simple, direct response: returns the recognized item name and visual description.
        """
        item_name = self.extract_item_name(vision_data)
        raw_caption = vision_data.get("caption") or ""
        caption = raw_caption.capitalize() if raw_caption else f"A photo of {item_name.lower()}"
        tags = [t.get("name") if isinstance(t, dict) else str(t) for t in vision_data.get("tags", [])]

        return {
            "item_name": item_name,
            "crop_type": f"Item: {item_name}",
            "disease_name": item_name,
            "causative_agent": f"Identified as {item_name}",
            "severity": "Detected",
            "visual_symptoms": f"Item detected: {item_name}. Description: {caption}.",
            "detected_tags": tags[:8],
            "organic_treatment": [
                f"Identified Item: {item_name}",
                f"Visual Description: {caption}",
                f"Detected Tags: {', '.join(tags[:5]) if tags else item_name}",
            ],
            "chemical_treatment": [
                f"Object Recognized: {item_name}",
                "Successfully analyzed via Computer Vision.",
            ],
            "prevention": [
                f"Item Recognized: {item_name}",
                "For highest recognition accuracy, ensure clear focus on the subject.",
            ],
            "sinhala_summary": f"හඳුනාගත් අයිතමය (Item): {item_name}",
            "empathetic_note": f"Successfully recognized: {item_name}",
        }

    def humanize_prescription(self, raw_text: str) -> Dict[str, Any]:
        return {
            "agent_status": "ready",
            "summary": raw_text.strip(),
            "guidance": ["Item recognition ready."],
        }

agricultural_agent_service = AgriculturalAgentService()
agent_service = agricultural_agent_service
