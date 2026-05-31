from app.agents.agent_orchestrator import AgentOrchestrator

_agent = AgentOrchestrator()


def orchestrate(request) -> dict:
    return _agent.run(
        {
            "intent": request.intent,
            "payload": request.payload,
        }
    )
