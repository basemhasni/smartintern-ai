from app.agents.career_assistant_agent import CareerAssistantAgent

_agent = CareerAssistantAgent()


def generate_career_advice(payload) -> dict:
    return _agent.run(payload)
