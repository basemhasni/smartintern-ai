from app.agents.cv_analysis_agent import CVAnalysisAgent

_agent = CVAnalysisAgent()


def extract_skills(text: str) -> list[str]:
    return _agent.extract_skills(text)


def detect_experience_level(text: str) -> str:
    return _agent.detect_experience_level(text)


def analyze_cv(text: str) -> dict:
    return _agent.run(text)
