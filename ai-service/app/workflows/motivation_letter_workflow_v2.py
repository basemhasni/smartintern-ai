from langgraph.graph import END, START, StateGraph

from app.services.motivation_letter_v2_service import (
    extract_letter_evidence,
    generate_motivation_letter_v2,
    normalize_tone,
    validate_letter_claims,
)
from app.workflows.workflow_state import MotivationLetterWorkflowState


def validate_input_node(state: MotivationLetterWorkflowState) -> dict:
    if not state.get("student"):
        return {"error": "student is required"}
    if not state.get("offer"):
        return {"error": "offer is required"}
    return {"error": None}


def normalize_tone_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    requested = state.get("tone") or "PROFESSIONAL"
    normalized = normalize_tone(requested)
    warnings = [] if str(requested).upper() == normalized else ["Unsupported tone replaced by PROFESSIONAL."]
    return {"normalizedTone": normalized, "workflowWarnings": warnings}


def extract_letter_evidence_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    matching = state.get("matchingResult") or state.get("matching") or {}
    evidence = extract_letter_evidence(state.get("cvAnalysis") or {}, matching, state.get("candidateSkills") or [])
    return {"letterEvidence": evidence}


def plan_letter_structure_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    return {"letterPlan": ["opening", "fitParagraph", "motivationParagraph", "growthParagraph", "closing"]}


def draft_opening_node(state: MotivationLetterWorkflowState) -> dict:
    return {} if state.get("error") else {"draftStage": "opening"}


def draft_fit_paragraph_node(state: MotivationLetterWorkflowState) -> dict:
    return {} if state.get("error") else {"draftStage": "fitParagraph"}


def draft_motivation_paragraph_node(state: MotivationLetterWorkflowState) -> dict:
    return {} if state.get("error") else {"draftStage": "motivationParagraph"}


def handle_missing_skills_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    evidence = state.get("letterEvidence") or {}
    return {"missingSkills": evidence.get("missingSkills") or [], "draftStage": "growthParagraph"}


def draft_closing_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = generate_motivation_letter_v2(
        {
            "student": state.get("student") or {},
            "candidateSkills": state.get("candidateSkills") or [],
            "cvAnalysis": state.get("cvAnalysis") or {},
            "offer": state.get("offer") or {},
            "offerAnalysis": state.get("offerAnalysis") or {},
            "company": state.get("company") or {},
            "matching": state.get("matching") or {},
            "matchingResult": state.get("matchingResult") or {},
            "careerAdvice": state.get("careerAdvice") or {},
            "applicationMessage": state.get("applicationMessage"),
            "ragContextDocuments": state.get("ragContextDocuments") or [],
            "tone": state.get("normalizedTone") or "PROFESSIONAL",
        }
    )
    return {"generatedLetter": result["content"], "letterResult": result, "draftStage": "closing"}


def validate_claims_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    matching = state.get("matchingResult") or state.get("matching") or {}
    report = validate_letter_claims(state.get("generatedLetter") or "", state.get("letterEvidence") or {}, matching)
    if not report["valid"]:
        return {"error": "Letter claim validation failed", "claimValidation": report}
    return {"claimValidation": report}


def quality_check_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = state.get("letterResult") or {}
    quality = ((result.get("v2") or {}).get("qualityChecks") or {})
    required = ("mentionsOffer", "usesOnlyVerifiedSkills", "doesNotClaimMissingSkills", "hasClearStructure")
    if not all(quality.get(key) for key in required):
        return {"error": "Letter quality control failed", "qualityChecks": quality}
    return {"qualityChecks": quality}


def format_response_node(state: MotivationLetterWorkflowState) -> dict:
    if state.get("error"):
        return {}
    return {"result": state.get("letterResult")}


def build_motivation_letter_workflow_v2():
    workflow = StateGraph(MotivationLetterWorkflowState)
    nodes = [
        ("validate_input", validate_input_node),
        ("normalize_tone", normalize_tone_node),
        ("extract_letter_evidence", extract_letter_evidence_node),
        ("plan_letter_structure", plan_letter_structure_node),
        ("draft_opening", draft_opening_node),
        ("draft_fit_paragraph", draft_fit_paragraph_node),
        ("draft_motivation_paragraph", draft_motivation_paragraph_node),
        ("handle_missing_skills", handle_missing_skills_node),
        ("draft_closing", draft_closing_node),
        ("validate_claims", validate_claims_node),
        ("quality_check", quality_check_node),
        ("format_response", format_response_node),
    ]
    for name, node in nodes:
        workflow.add_node(name, node)
    workflow.add_edge(START, nodes[0][0])
    for (current, _), (following, _) in zip(nodes, nodes[1:]):
        workflow.add_edge(current, following)
    workflow.add_edge(nodes[-1][0], END)
    return workflow.compile()
