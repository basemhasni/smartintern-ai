from app.agents.offer_analysis_agent_v3 import OfferAnalysisAgentV3

_agent = OfferAnalysisAgentV3()


def detect_domain(text: str) -> str:
    return _agent.detect_domain(text)


def summarize_offer(domain: str) -> str:
    return _agent.summarize_offer(domain)


def analyze_offer(title: str, description: str, required_skills=None, optional_skills=None) -> dict:
    return _agent.run(
        {
            "title": title,
            "description": description,
            "requiredSkills": required_skills,
            "optionalSkills": optional_skills,
        }
    )
