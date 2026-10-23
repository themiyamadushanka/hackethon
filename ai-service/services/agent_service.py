import re
from typing import Dict, Any, List

class AgentService:
    """
    Agentic layer for humanizing medical data and structuring instructions.
    Designed to easily plug in LangChain, LangGraph, or LLM agents (Azure OpenAI / Gemini).
    """

    def humanize_prescription(self, raw_text: str) -> Dict[str, Any]:
        """
        Processes raw OCR text extracted from prescriptions and transforms it
        into empathetic, plain-language patient guidance.
        """
        # Medical abbreviation dictionary for grounding
        shorthand_map = {
            r"\bTDS\b": "3 times a day",
            r"\bBD\b": "2 times a day",
            r"\bOD\b": "once a day",
            r"\bQDS\b": "4 times a day",
            r"\bPC\b": "after meals",
            r"\bAC\b": "before meals",
            r"\bPRN\b": "as needed when required",
            r"\bNOCTE\b": "at night before bed",
            r"\bSTAT\b": "immediately",
        }

        # Humanize shorthand in text
        processed_text = raw_text
        for pattern, replacement in shorthand_map.items():
            processed_text = re.sub(pattern, replacement, processed_text, flags=re.IGNORECASE)

        # Basic structured extraction (expandable by LangChain/Agent later)
        medications: List[Dict[str, str]] = []
        for line in raw_text.split("\n"):
            line = line.strip()
            if any(term in line.lower() for term in ["amoxicillin", "paracetamol", "cetirizine", "tablet", "capsule", "mg"]):
                medications.append({
                    "raw_line": line,
                    "humanized": self._explain_medication(line),
                })

        return {
            "agent_status": "ready",
            "medications": medications,
            "patient_guidance": [
                "Always take antibiotics at evenly spaced intervals and finish the entire course.",
                "Drink plenty of clean water throughout the day.",
                "If symptoms persist or you experience side effects, consult your doctor or pharmacist.",
            ],
            "empathetic_note": "Wishing you a smooth and speedy recovery. Take your medications on time!",
        }

    def _explain_medication(self, line: str) -> str:
        lower = line.lower()
        if "amoxicillin" in lower:
            return "Amoxicillin fights bacterial infections. Take after meals to avoid stomach upset."
        elif "paracetamol" in lower:
            return "Paracetamol relieves pain and reduces fever. Do not exceed the prescribed dose."
        elif "cetirizine" in lower:
            return "Cetirizine relieves allergies, runny nose, or itching. It may make you sleepy, best taken at night."
        return "Take this medication strictly according to your doctor's instructions."

agent_service = AgentService()
