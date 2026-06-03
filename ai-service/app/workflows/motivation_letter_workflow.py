from langgraph.graph import END, START, StateGraph

from app.agents.motivation_letter_agent import MotivationLetterAgent
from app.models.schemas import MotivationLetterRequest
from app.workflows.workflow_state import MotivationLetterWorkflowState

VALID_TONES = {"PROFESSIONAL", "DYNAMIC", "SIMPLE"}


def _as_list(value) -> list:
    return value if isinstance(value, list) else []


def _contains_text(content: str, text: str | None) -> bool:
    if not text:
        return True

    return text.lower() in content.lower()


def validate_input_node(state: MotivationLetterWorkflowState) -> dict:
    # Node 1: validate the minimum context required before preparing the letter.
    if not isinstance(state.get("student"), dict) or not state.get("student"):
        return {"error": "student is required"}

    if not isinstance(state.get("offer"), dict) or not state.get("offer"):
        return {"error": "offer is required"}

    if not isinstance(state.get("company"), dict) or not state.get("company"):
        return {"error": "company is required"}

    tone = state.get("tone") or "PROFESSIONAL"
    if tone not in VALID_TONES:
        return {"error": "tone must be PROFESSIONAL, DYNAMIC, or SIMPLE"}

    return {
        "tone": tone,
        "error": None,
    }


def prepare_student_profile_node(state: MotivationLetterWorkflowState) -> dict:
    # Node 2: keep only known student data; missing fields stay empty.
    if state.get("error"):
        return {}

    student = state.get("student", {})

    return {
        "preparedStudentProfile": {
            "firstName": student.get("firstName"),
            "lastName": student.get("lastName"),
            "educationLevel": student.get("educationLevel"),
            "targetJob": student.get("targetJob"),
            "bio": student.get("bio"),
            "candidateSkills": _as_list(state.get("candidateSkills")),
        }
    }


def prepare_offer_context_node(state: MotivationLetterWorkflowState) -> dict:
    # Node 3: keep the offer and company context needed by the letter agent.
    if state.get("error"):
        return {}

    offer = state.get("offer", {})
    company = state.get("company", {})

    return {
        "preparedOfferContext": {
            "title": offer.get("title"),
            "description": offer.get("description"),
            "location": offer.get("location"),
            "duration": offer.get("duration"),
            "requiredSkills": _as_list(offer.get("requiredSkills")),
            "companyName": company.get("companyName"),
            "sector": company.get("sector"),
        }
    }


def check_missing_skills_node(state: MotivationLetterWorkflowState) -> dict:
    # Node 4: preserve missing skills so quality control can ensure they are not claimed as mastered.
    if state.get("error"):
        return {}

    matching = state.get("matching") or {}

    return {
        "missingSkills": _as_list(matching.get("missingSkills")),
    }


def generate_letter_node(state: MotivationLetterWorkflowState) -> dict:
    # Node 5: delegate deterministic generation to the existing MotivationLetterAgent.
    if state.get("error"):
        return {}

    student_profile = state.get("preparedStudentProfile") or {}
    offer_context = state.get("preparedOfferContext") or {}
    matching = state.get("matching") or {}

    try:
        request = MotivationLetterRequest(
            student={
                "firstName": student_profile.get("firstName") or "",
                "lastName": student_profile.get("lastName") or "",
                "educationLevel": student_profile.get("educationLevel"),
                "targetJob": student_profile.get("targetJob"),
                "bio": student_profile.get("bio"),
            },
            candidateSkills=student_profile.get("candidateSkills") or [],
            offer={
                "title": offer_context.get("title") or "",
                "description": offer_context.get("description") or "",
                "location": offer_context.get("location"),
                "duration": offer_context.get("duration"),
                "requiredSkills": offer_context.get("requiredSkills") or [],
            },
            company={
                "companyName": offer_context.get("companyName") or "",
                "sector": offer_context.get("sector"),
            },
            matching={
                "score": matching.get("score"),
                "matchedSkills": _as_list(matching.get("matchedSkills")),
                "missingSkills": _as_list(matching.get("missingSkills")),
            },
            tone=state.get("tone") or "PROFESSIONAL",
        )
        generated = MotivationLetterAgent().run(request)
    except ValueError as error:
        return {"error": str(error)}

    return {
        "generatedLetter": generated["content"],
    }


def quality_control_node(state: MotivationLetterWorkflowState) -> dict:
    # Node 6: run simple deterministic checks without using an LLM.
    if state.get("error"):
        return {}

    content = state.get("generatedLetter") or ""
    offer_context = state.get("preparedOfferContext") or {}
    missing_skills = _as_list(state.get("missingSkills"))
    lower_content = content.lower()

    competency_sentences = [
        sentence.strip()
        for sentence in lower_content.replace("\n", " ").split(".")
        if "competence" in sentence or "compétence" in sentence or "maitrise" in sentence or "maîtrise" in sentence
    ]

    does_not_claim_missing_skills = True
    for skill in missing_skills:
        normalized_skill = str(skill).lower()
        if any(normalized_skill in sentence for sentence in competency_sentences):
            does_not_claim_missing_skills = False
            break

    return {
        "qualityChecks": {
            "mentionsCompany": _contains_text(content, offer_context.get("companyName")),
            "mentionsOffer": _contains_text(content, offer_context.get("title")),
            "doesNotClaimMissingSkills": does_not_claim_missing_skills,
            "hasConclusion": "salutations" in lower_content or "entretien" in lower_content,
        }
    }


def format_response_node(state: MotivationLetterWorkflowState) -> dict:
    # Node 7: assemble the public workflow response body.
    if state.get("error"):
        return {}

    return {
        "result": {
            "content": state.get("generatedLetter"),
            "qualityChecks": state.get("qualityChecks"),
        }
    }


def build_motivation_letter_workflow():
    workflow = StateGraph(MotivationLetterWorkflowState)

    workflow.add_node("validate_input", validate_input_node)
    workflow.add_node("prepare_student_profile", prepare_student_profile_node)
    workflow.add_node("prepare_offer_context", prepare_offer_context_node)
    workflow.add_node("check_missing_skills", check_missing_skills_node)
    workflow.add_node("generate_letter", generate_letter_node)
    workflow.add_node("quality_control", quality_control_node)
    workflow.add_node("format_response", format_response_node)

    workflow.add_edge(START, "validate_input")
    workflow.add_edge("validate_input", "prepare_student_profile")
    workflow.add_edge("prepare_student_profile", "prepare_offer_context")
    workflow.add_edge("prepare_offer_context", "check_missing_skills")
    workflow.add_edge("check_missing_skills", "generate_letter")
    workflow.add_edge("generate_letter", "quality_control")
    workflow.add_edge("quality_control", "format_response")
    workflow.add_edge("format_response", END)

    return workflow.compile()
