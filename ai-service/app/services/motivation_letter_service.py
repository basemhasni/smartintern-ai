from app.agents.motivation_letter_agent import MotivationLetterAgent

_agent = MotivationLetterAgent()


def generate_motivation_letter(payload) -> dict:
    return _agent.run(payload)
