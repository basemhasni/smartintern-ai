from app.workflows.matching_workflow_v3 import build_matching_workflow_v3
from app.workflows.motivation_letter_workflow_v2 import build_motivation_letter_workflow_v2
from app.workflows.orchestrator_v2_workflow import build_orchestrator_v2_workflow

_matching_workflow = build_matching_workflow_v3()
_motivation_letter_workflow = build_motivation_letter_workflow_v2()
_orchestrator_v2_workflow = build_orchestrator_v2_workflow()


def run_matching_workflow(payload) -> dict:
    initial_state = {
        "candidateSkills": payload.candidateSkills,
        "requiredSkills": payload.requiredSkills,
        "optionalSkills": payload.optionalSkills or [],
        "candidateAnalysis": payload.candidateAnalysis or {},
        "offerAnalysis": payload.offerAnalysis or {},
        "candidateText": payload.candidateText,
        "offerText": payload.offerText,
        "debug": payload.debug,
        "preparedCandidateProfile": None,
        "preparedOfferRequirements": None,
        "evidenceProfile": None,
        "coverageMatrix": None,
        "hybridScore": None,
        "qualityChecks": None,
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


def run_motivation_letter_workflow(payload) -> dict:
    initial_state = {
        "student": payload.student.model_dump(),
        "candidateSkills": payload.candidateSkills or [],
        "offer": payload.offer.model_dump(),
        "company": payload.company.model_dump(),
        "matching": payload.matching.model_dump() if payload.matching else {},
        "tone": payload.tone or "PROFESSIONAL",
        "cvAnalysis": payload.cvAnalysis or {},
        "offerAnalysis": payload.offerAnalysis or {},
        "matchingResult": payload.matchingResult or {},
        "careerAdvice": payload.careerAdvice or {},
        "applicationMessage": payload.applicationMessage,
        "ragContextDocuments": payload.ragContextDocuments or [],
        "normalizedTone": None,
        "workflowWarnings": [],
        "letterEvidence": None,
        "letterPlan": [],
        "draftStage": None,
        "letterResult": None,
        "claimValidation": None,
        "preparedStudentProfile": None,
        "preparedOfferContext": None,
        "missingSkills": [],
        "generatedLetter": None,
        "qualityChecks": None,
        "result": None,
        "error": None,
    }

    final_state = _motivation_letter_workflow.invoke(initial_state)

    if final_state.get("error"):
        raise ValueError(final_state["error"])

    return {
        "workflow": "motivation_letter_workflow",
        "result": final_state["result"],
    }


def run_orchestrator_v2_workflow(payload) -> dict:
    request = payload.model_dump() if hasattr(payload, "model_dump") else dict(payload or {})
    final_state = _orchestrator_v2_workflow.invoke(
        {
            "request": request,
            "intent": None,
            "executionPlan": [],
            "result": None,
            "error": None,
        }
    )

    if final_state.get("error"):
        raise ValueError(final_state["error"])

    return {
        "workflow": "orchestrator_v2_workflow",
        "intent": final_state.get("intent"),
        "executionPlan": final_state.get("executionPlan") or [],
        "result": final_state.get("result"),
    }
