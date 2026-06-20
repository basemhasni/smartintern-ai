from app.agents.base_agent import BaseAgent
from app.services.offer_analysis_v2 import analyze_offer_v2


class OfferAnalysisAgentV2(BaseAgent):
    name = "OfferAnalysisAgent"
    description = "Extracts structured requirements and domain signals from offers"

    def detect_domain(self, text: str) -> str:
        return analyze_offer_v2("Offer analysis", text)["domain"]

    def summarize_offer(self, domain: str) -> str:
        return f"Offre orientee {domain.lower()}."

    def run(self, input_data):
        return analyze_offer_v2(
            input_data.get("title", ""),
            input_data.get("description", ""),
            input_data.get("requiredSkills"),
            input_data.get("optionalSkills"),
        )

