from langgraph.graph import END, START, StateGraph

from app.agents.matching_agent_v3 import MatchingAgentV3
from app.services.evidence_extraction_service import build_candidate_evidence_profile
from app.services.hybrid_matching_engine_v3 import build_requirement_coverage_matrix, calculate_hybrid_score
from app.services.offer_analysis_v3 import analyze_offer_v3
from app.services.skill_extraction_service import canonicalize_skill_list
from app.workflows.workflow_state import MatchingWorkflowState


def validate_input_node(state: MatchingWorkflowState) -> dict:
    for field in ("candidateSkills", "requiredSkills", "optionalSkills"):
        value = state.get(field) or []
        if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
            return {"error": f"{field} must be a list of strings"}
    return {"error": None, "optionalSkills": state.get("optionalSkills") or []}


def build_candidate_profile_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    profile = dict(state.get("candidateAnalysis") or {})
    skills = canonicalize_skill_list(profile.get("skills") or state.get("candidateSkills") or [])
    profile["skills"] = skills
    profile["detectedSkills"] = skills
    profile["rawSkills"] = state.get("candidateSkills") or []
    profile.setdefault("rawTextQuality", {"quality": "MEDIUM" if len(skills) >= 4 else "LOW", "length": len(state.get("candidateText") or "")})
    profile.setdefault("domainSignals", [])
    profile.setdefault("experienceLevelV2", "UNKNOWN")
    return {"preparedCandidateProfile": profile}


def build_offer_requirements_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    source = dict(state.get("offerAnalysis") or {})
    title = source.get("title") or "Internship offer"
    description = state.get("offerText") or source.get("description") or "Internship requirements"
    analysis = analyze_offer_v3(title, description, state.get("requiredSkills") or [], state.get("optionalSkills") or [])
    analysis.update({key: value for key, value in source.items() if value not in (None, [], {})})
    return {"preparedOfferRequirements": analysis}


def extract_candidate_evidence_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    profile = dict(state.get("preparedCandidateProfile") or {})
    evidence = profile.get("evidenceProfile") or build_candidate_evidence_profile(profile, state.get("candidateText"))
    profile["evidenceProfile"] = evidence
    profile["allEvidence"] = [
        item
        for item in evidence.get("evidenceSentences", [])
        if not item.get("negated")
    ] or [
        item
        for values in evidence.get("skillEvidence", {}).values()
        for item in values
        if not item.get("negated")
    ]
    return {"preparedCandidateProfile": profile, "evidenceProfile": evidence}


def compute_requirement_coverage_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    matrix = build_requirement_coverage_matrix(
        state.get("preparedCandidateProfile") or {},
        state.get("preparedOfferRequirements") or {},
        bool(state.get("debug")),
    )
    return {"coverageMatrix": matrix}


def calculate_hybrid_score_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    score = calculate_hybrid_score(
        state.get("coverageMatrix") or [],
        state.get("preparedCandidateProfile") or {},
        state.get("preparedOfferRequirements") or {},
    )
    return {"hybridScore": score}


def generate_detailed_explanation_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = MatchingAgentV3().run(
        {
            "candidateSkills": state.get("candidateSkills") or [],
            "requiredSkills": state.get("requiredSkills") or [],
            "optionalSkills": state.get("optionalSkills") or [],
            "candidateAnalysis": state.get("preparedCandidateProfile") or {},
            "offerAnalysis": state.get("preparedOfferRequirements") or {},
            "candidateText": state.get("candidateText"),
            "offerText": state.get("offerText"),
            "debug": bool(state.get("debug")),
        }
    )
    return {"result": result}


def quality_control_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = dict(state.get("result") or {})
    matrix = result.get("v3", {}).get("coverageMatrix") or []
    score = result.get("score")
    if not isinstance(score, int) or not 0 <= score <= 100:
        return {"error": "V3 quality control failed: score must be between 0 and 100"}
    if state.get("requiredSkills") and not matrix:
        return {"error": "V3 quality control failed: coverageMatrix is required"}
    requirements = [row.get("requirement") for row in matrix]
    if len(requirements) != len(set(requirements)):
        return {"error": "V3 quality control failed: duplicate requirements"}
    critical_missing = result.get("v3", {}).get("criticalMissingSkills") or []
    if critical_missing and score > 72:
        return {"error": "V3 quality control failed: missing critical skill cap not applied"}
    if len(result.get("explanation") or "") < 80:
        return {"error": "V3 quality control failed: explanation is too generic"}
    return {
        "qualityChecks": {
            "scoreBounds": True,
            "coveragePresent": True,
            "requirementsUnique": True,
            "criticalCapApplied": True,
            "detailedExplanation": True,
        }
    }


def format_response_node(state: MatchingWorkflowState) -> dict:
    if state.get("error"):
        return {}
    return {"result": state.get("result")}


def build_matching_workflow_v3():
    workflow = StateGraph(MatchingWorkflowState)
    workflow.add_node("validate_input", validate_input_node)
    workflow.add_node("build_candidate_profile", build_candidate_profile_node)
    workflow.add_node("build_offer_requirements", build_offer_requirements_node)
    workflow.add_node("extract_candidate_evidence", extract_candidate_evidence_node)
    workflow.add_node("compute_requirement_coverage", compute_requirement_coverage_node)
    workflow.add_node("calculate_hybrid_score", calculate_hybrid_score_node)
    workflow.add_node("generate_detailed_explanation", generate_detailed_explanation_node)
    workflow.add_node("quality_control", quality_control_node)
    workflow.add_node("format_response", format_response_node)

    workflow.add_edge(START, "validate_input")
    workflow.add_edge("validate_input", "build_candidate_profile")
    workflow.add_edge("build_candidate_profile", "build_offer_requirements")
    workflow.add_edge("build_offer_requirements", "extract_candidate_evidence")
    workflow.add_edge("extract_candidate_evidence", "compute_requirement_coverage")
    workflow.add_edge("compute_requirement_coverage", "calculate_hybrid_score")
    workflow.add_edge("calculate_hybrid_score", "generate_detailed_explanation")
    workflow.add_edge("generate_detailed_explanation", "quality_control")
    workflow.add_edge("quality_control", "format_response")
    workflow.add_edge("format_response", END)
    return workflow.compile()
