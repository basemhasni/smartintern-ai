from app.agents.base_agent import BaseAgent
from app.services.matching_engine_v2 import MatchingEngineV2
from app.services.skill_extraction_service import canonicalize_skill_list


class MatchingAgentV2(BaseAgent):
    name = "MatchingAgent"
    description = "Computes an explainable deterministic compatibility score"

    def __init__(self):
        self.engine = MatchingEngineV2()

    def normalize_skills(self, skills: list[str], field_name: str) -> list[str]:
        if not isinstance(skills, list) or any(not isinstance(skill, str) for skill in skills):
            raise ValueError(f"{field_name} must be a list of strings")
        return canonicalize_skill_list(skills)

    def run(self, input_data):
        candidate = self.normalize_skills(input_data["candidateSkills"], "candidateSkills")
        required = self.normalize_skills(input_data["requiredSkills"], "requiredSkills")
        optional = self.normalize_skills(input_data.get("optionalSkills") or [], "optionalSkills")
        candidate_analysis = dict(input_data.get("candidateAnalysis") or {})
        offer_analysis = dict(input_data.get("offerAnalysis") or {})
        candidate_analysis.setdefault("skills", candidate)
        candidate_analysis.setdefault("detectedSkills", candidate)
        offer_analysis.setdefault("requiredSkills", required)
        offer_analysis.setdefault("optionalSkills", optional)
        offer_analysis.setdefault("criticalSkills", required)
        return self.engine.match(candidate_analysis, offer_analysis)

