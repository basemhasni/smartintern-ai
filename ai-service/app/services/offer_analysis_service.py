from app.agents.offer_analysis_agent import OfferAnalysisAgent

_agent = OfferAnalysisAgent()


def detect_domain(text: str) -> str:
    return _agent.detect_domain(text)


def summarize_offer(domain: str) -> str:
    return _agent.summarize_offer(domain)


def analyze_offer(title: str, description: str) -> dict:
    return _agent.run(
        {
            "title": title,
            "description": description,
        }
    )
