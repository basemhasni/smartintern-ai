from app.workflows.matching_workflow import build_matching_workflow

_matching_workflow = build_matching_workflow()


def run_matching_workflow(payload) -> dict:
    initial_state = {
        "candidateSkills": payload.candidateSkills,
        "requiredSkills": payload.requiredSkills,
        "optionalSkills": payload.optionalSkills or [],
        "result": None,
        "error": None,
    }

    final_state = _matching_workflow.invoke(initial_state)

    if final_state.get("error"):
        raise ValueError(final_state["error"])

    return {
        "workflow": "matching_workflow",
        "result": final_state["result"],
    }
