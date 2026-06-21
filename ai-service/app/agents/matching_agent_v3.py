from app.agents.base_agent import BaseAgent
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3


class MatchingAgentV3(BaseAgent):
    name = "MatchingAgent"
    description = "Computes hybrid evidence-aware compatibility with strict caps"

    def __init__(self):
        self.engine = HybridMatchingEngineV3()

    @staticmethod
    def _validate_skills(skills, field_name: str) -> list[str]:
        if not isinstance(skills, list) or any(not isinstance(skill, str) for skill in skills):
            raise ValueError(f"{field_name} must be a list of strings")
        return [skill.strip() for skill in skills if skill.strip()]

    def normalize_skills(self, skills: list[str], field_name: str) -> list[str]:
        return self._validate_skills(skills, field_name)

    def run(self, input_data):
        candidate = self._validate_skills(input_data.get("candidateSkills", []), "candidateSkills")
        required = self._validate_skills(input_data.get("requiredSkills", []), "requiredSkills")
        optional = self._validate_skills(input_data.get("optionalSkills") or [], "optionalSkills")
        return self.engine.match(
            candidate_skills=candidate,
            required_skills=required,
            optional_skills=optional,
            candidate_analysis=input_data.get("candidateAnalysis") or {},
            offer_analysis=input_data.get("offerAnalysis") or {},
            candidate_text=input_data.get("candidateText"),
            offer_text=input_data.get("offerText"),
            debug=bool(input_data.get("debug", False)),
        )

