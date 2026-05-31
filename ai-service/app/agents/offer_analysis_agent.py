from app.agents.base_agent import BaseAgent
from app.agents.cv_analysis_agent import CVAnalysisAgent


class OfferAnalysisAgent(BaseAgent):
    name = "OfferAnalysisAgent"
    description = "Extracts required skills and domain from internship offers"

    def __init__(self):
        self.cv_analysis_agent = CVAnalysisAgent()

    def detect_domain(self, text: str) -> str:
        normalized_text = text.lower()

        if any(keyword in normalized_text for keyword in ["flutter", "mobile", "android", "ios"]):
            return "Mobile"

        if any(keyword in normalized_text for keyword in ["docker", "jenkins", "aws", "devops", "ci/cd"]):
            return "DevOps"

        if any(keyword in normalized_text for keyword in ["data", "ia", "ai", "machine learning", "python"]):
            return "Data / IA"

        if any(keyword in normalized_text for keyword in ["react", "angular", "vue", "node", "fullstack", "web"]):
            return "DÃ©veloppement web"

        return "GÃ©nÃ©ral"

    def summarize_offer(self, domain: str) -> str:
        summaries = {
            "DÃ©veloppement web": "Offre orientÃ©e dÃ©veloppement web fullstack.",
            "Mobile": "Offre orientÃ©e dÃ©veloppement mobile.",
            "DevOps": "Offre orientÃ©e DevOps et infrastructure.",
            "Data / IA": "Offre orientÃ©e data et intelligence artificielle.",
            "GÃ©nÃ©ral": "Offre gÃ©nÃ©raliste.",
        }

        return summaries[domain]

    def run(self, input_data):
        cleaned_title = input_data["title"].strip()
        cleaned_description = input_data["description"].strip()

        if not cleaned_title or not cleaned_description:
            raise ValueError("Offer title and description must not be empty")

        combined_text = f"{cleaned_title} {cleaned_description}"
        required_skills = self.cv_analysis_agent.extract_skills(combined_text)
        domain = self.detect_domain(combined_text)

        return {
            "requiredSkills": required_skills,
            "optionalSkills": [],
            "domain": domain,
            "summary": self.summarize_offer(domain),
        }
