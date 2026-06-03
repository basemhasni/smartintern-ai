from langgraph.graph import END, START, StateGraph

from app.agents.matching_agent import MatchingAgent
from app.workflows.workflow_state import MatchingWorkflowState


def validate_input_node(state: MatchingWorkflowState) -> dict:
    # Node 1: validate that the workflow received skill lists before running matching.
    if not isinstance(state.get("candidateSkills"), list):
        return {"error": "candidateSkills must be a list"}

    if not isinstance(state.get("requiredSkills"), list):
        return {"error": "requiredSkills must be a list"}

    optional_skills = state.get("optionalSkills") or []
    if not isinstance(optional_skills, list):
        return {"error": "optionalSkills must be a list"}

    return {
        "optionalSkills": optional_skills,
        "error": None,
    }


def matching_node(state: MatchingWorkflowState) -> dict:
    # Node 2: delegate the actual deterministic scoring to the existing MatchingAgent.
    if state.get("error"):
        return {}

    try:
        result = MatchingAgent().run(
            {
                "candidateSkills": state.get("candidateSkills", []),
                "requiredSkills": state.get("requiredSkills", []),
                "optionalSkills": state.get("optionalSkills", []),
            }
        )
    except ValueError as error:
        return {
            "error": str(error),
        }

    return {
        "result": result,
    }


def format_response_node(state: MatchingWorkflowState) -> dict:
    # Node 3: final formatting hook kept explicit for future workflow extensions.
    if state.get("error"):
        return {}

    return {
        "result": state.get("result"),
    }


def build_matching_workflow():
    workflow = StateGraph(MatchingWorkflowState)

    workflow.add_node("validate_input", validate_input_node)
    workflow.add_node("matching", matching_node)
    workflow.add_node("format_response", format_response_node)

    workflow.add_edge(START, "validate_input")
    workflow.add_edge("validate_input", "matching")
    workflow.add_edge("matching", "format_response")
    workflow.add_edge("format_response", END)

    return workflow.compile()
