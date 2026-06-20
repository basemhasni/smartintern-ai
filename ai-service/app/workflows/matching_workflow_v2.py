from langgraph.graph import END, START, StateGraph

from app.agents.matching_agent_v2 import MatchingAgentV2
from app.services.skill_extraction_service import canonicalize_skill_list
from app.workflows.workflow_state import MatchingWorkflowState


def validate_input_node(state: MatchingWorkflowState) -> dict:
    for field in ("candidateSkills", "requiredSkills", "optionalSkills"):
        value = state.get(field) or []
        if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
            return {"error": f"{field} must be a list of strings"}
    return {"optionalSkills": state.get("optionalSkills") or [], "error": None}


def prepare_cv_analysis_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    analysis = dict(state.get("candidateAnalysis") or {})
    analysis.setdefault("skills", state.get("candidateSkills") or [])
    analysis.setdefault("detectedSkills", state.get("candidateSkills") or [])
    return {"candidateAnalysis": analysis}


def prepare_offer_analysis_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    analysis = dict(state.get("offerAnalysis") or {})
    analysis.setdefault("requiredSkills", state.get("requiredSkills") or [])
    analysis.setdefault("optionalSkills", state.get("optionalSkills") or [])
    analysis.setdefault("criticalSkills", state.get("requiredSkills") or [])
    return {"offerAnalysis": analysis}


def extract_skill_signals_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    candidate = canonicalize_skill_list(state.get("candidateSkills") or [])
    required = canonicalize_skill_list(state.get("requiredSkills") or [])
    optional = [skill for skill in canonicalize_skill_list(state.get("optionalSkills") or []) if skill not in required]
    return {"candidateSkills": candidate, "requiredSkills": required, "optionalSkills": optional}


def compute_matching_score_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    try:
        result = MatchingAgentV2().run(
            {
                "candidateSkills": state.get("candidateSkills") or [],
                "requiredSkills": state.get("requiredSkills") or [],
                "optionalSkills": state.get("optionalSkills") or [],
                "candidateAnalysis": state.get("candidateAnalysis") or {},
                "offerAnalysis": state.get("offerAnalysis") or {},
            }
        )
    except ValueError as error:
        return {"error": str(error)}
    return {"result": result}


def generate_explanation_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = dict(state.get("result") or {})
    if not result.get("explanation"):
        result["explanation"] = "Le matching a ete calcule, mais les donnees ne permettent pas une explication detaillee."
    return {"result": result}


def quality_check_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = dict(state.get("result") or {})
    score = result.get("score")
    if not isinstance(score, int) or not 0 <= score <= 100:
        return {"error": "Matching quality check failed: score must be between 0 and 100"}
    required = state.get("requiredSkills") or []
    matched = list(dict.fromkeys(result.get("matchedSkills") or []))
    missing = list(dict.fromkeys(result.get("missingRequiredSkills") or result.get("missingSkills") or []))
    if set(matched) & set(missing):
        return {"error": "Matching quality check failed: a skill cannot be matched and missing"}
    if not required and result.get("decisionLabel") != "INSUFFICIENT_DATA":
        result["decisionLabel"] = "INSUFFICIENT_DATA"
        result["confidence"] = "LOW"
    if not result.get("confidence") or not result.get("explanation"):
        return {"error": "Matching quality check failed: confidence and explanation are required"}
    result["matchedSkills"] = matched
    result["missingSkills"] = missing
    result["missingRequiredSkills"] = missing
    return {"result": result, "qualityChecks": {"scoreBounds": True, "skillsConsistent": True, "explanationPresent": True}}


def format_response_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    return {"result": state.get("result")}


def build_matching_workflow_v2():
    workflow = StateGraph(MatchingWorkflowState)
    workflow.add_node("validate_input", validate_input_node)
    workflow.add_node("prepare_cv_analysis", prepare_cv_analysis_node)
    workflow.add_node("prepare_offer_analysis", prepare_offer_analysis_node)
    workflow.add_node("extract_skill_signals", extract_skill_signals_node)
    workflow.add_node("compute_matching_score", compute_matching_score_node)
    workflow.add_node("generate_explanation", generate_explanation_node)
    workflow.add_node("quality_check", quality_check_node)
    workflow.add_node("format_response", format_response_node)

    workflow.add_edge(START, "validate_input")
    workflow.add_edge("validate_input", "prepare_cv_analysis")
    workflow.add_edge("prepare_cv_analysis", "prepare_offer_analysis")
    workflow.add_edge("prepare_offer_analysis", "extract_skill_signals")
    workflow.add_edge("extract_skill_signals", "compute_matching_score")
    workflow.add_edge("compute_matching_score", "generate_explanation")
    workflow.add_edge("generate_explanation", "quality_check")
    workflow.add_edge("quality_check", "format_response")
    workflow.add_edge("format_response", END)
    return workflow.compile()

