from pydantic import ValidationError

from app.agents.base_agent import BaseAgent
from app.agents.career_assistant_agent import CareerAssistantAgent
from app.agents.cv_analysis_agent_v3 import CVAnalysisAgentV3
from app.agents.matching_agent_v3 import MatchingAgentV3
from app.agents.motivation_letter_agent_v2 import MotivationLetterAgentV2
from app.agents.offer_analysis_agent_v3 import OfferAnalysisAgentV3
from app.models.schemas import CareerAdviceRequest, MotivationLetterRequest


class AgentOrchestrator(BaseAgent):
    name = "AgentOrchestrator"
    description = "Routes simple AI intents to specialized agents"

    def __init__(self):
        self.cv_analysis_agent = CVAnalysisAgentV3()
        self.offer_analysis_agent = OfferAnalysisAgentV3()
        self.matching_agent = MatchingAgentV3()
        self.motivation_letter_agent = MotivationLetterAgentV2()
        self.career_assistant_agent = CareerAssistantAgent()

    def detect_intent(self, input_data):
        intent = input_data.get("intent") if isinstance(input_data, dict) else None

        if intent not in self._intent_handlers():
            raise ValueError("Unsupported or missing intent.")

        return intent

    def _intent_handlers(self):
        return {
            "analyze_cv": self._run_cv_analysis,
            "analyze_offer": self._run_offer_analysis,
            "match": self._run_matching,
            "generate_letter": self._run_motivation_letter,
            "career_advice": self._run_career_advice,
        }

    def _run_cv_analysis(self, payload):
        return self.cv_analysis_agent.run(payload.get("text", ""))

    def _run_offer_analysis(self, payload):
        return self.offer_analysis_agent.run(
            {
                "title": payload.get("title", ""),
                "description": payload.get("description", ""),
                "requiredSkills": payload.get("requiredSkills", []),
                "optionalSkills": payload.get("optionalSkills", []),
            }
        )

    def _run_matching(self, payload):
        return self.matching_agent.run(
            {
                "candidateSkills": payload.get("candidateSkills", []),
                "requiredSkills": payload.get("requiredSkills", []),
                "optionalSkills": payload.get("optionalSkills", []),
                "candidateAnalysis": payload.get("candidateAnalysis", {}),
                "offerAnalysis": payload.get("offerAnalysis", {}),
                "candidateText": payload.get("candidateText"),
                "offerText": payload.get("offerText"),
                "debug": payload.get("debug", False),
            }
        )

    def _run_motivation_letter(self, payload):
        request = MotivationLetterRequest(**payload)
        return self.motivation_letter_agent.run(request)

    def _run_career_advice(self, payload):
        request = CareerAdviceRequest(**payload)
        return self.career_assistant_agent.run(request)

    def run(self, input_data):
        try:
            intent = self.detect_intent(input_data)
            payload = input_data.get("payload") or {}
            result = self._intent_handlers()[intent](payload)
        except ValidationError as error:
            raise ValueError(str(error)) from error

        agent_name = {
            "analyze_cv": self.cv_analysis_agent.name,
            "analyze_offer": self.offer_analysis_agent.name,
            "match": self.matching_agent.name,
            "generate_letter": self.motivation_letter_agent.name,
            "career_advice": self.career_assistant_agent.name,
        }[intent]

        return {
            "intent": intent,
            "agent": agent_name,
            "result": result,
        }
