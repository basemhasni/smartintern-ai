from app.agents.base_agent import BaseAgent
from app.services.motivation_letter_v2_service import generate_motivation_letter_v2


class MotivationLetterAgentV2(BaseAgent):
    name = "MotivationLetterAgentV2"
    description = "Generates evidence-based motivation letters with claim controls"

    def run(self, input_data):
        return generate_motivation_letter_v2(input_data)
