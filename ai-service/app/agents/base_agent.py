class BaseAgent:
    name = "BaseAgent"
    description = "Base agent"

    def run(self, input_data):
        raise NotImplementedError("Each agent must implement run()")
