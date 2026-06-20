from app.agents.base_agent import BaseAgent
from app.services.cv_analysis_v2 import analyze_cv_v2
from app.services.skill_extraction_service import extract_skills_from_text


class CVAnalysisAgentV2(BaseAgent):
    name = "CVAnalysisAgent"
    description = "Extracts explainable CV skills and profile signals"

    def extract_skills(self, text: str) -> list[str]:
        return extract_skills_from_text(text)

    def detect_experience_level(self, text: str) -> str:
        return analyze_cv_v2(text)["experienceLevel"]

    def run(self, input_data):
        return analyze_cv_v2(input_data)

