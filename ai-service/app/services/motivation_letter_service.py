from app.agents.motivation_letter_agent_v2 import MotivationLetterAgentV2

_agent = MotivationLetterAgentV2()


def generate_motivation_letter(payload) -> dict:
    return _agent.run(payload)
