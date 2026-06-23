"""SmartIntern AI Orchestrator V2.

This service coordinates specialized deterministic agents without replacing
their business logic. Matching V3 remains the central source of truth; RAG V2
is optional enrichment.
"""

from __future__ import annotations

from typing import Any

from app.agents.cv_analysis_agent_v3 import CVAnalysisAgentV3
from app.agents.matching_agent_v3 import MatchingAgentV3
from app.agents.offer_analysis_agent_v3 import OfferAnalysisAgentV3
from app.orchestration.context import OrchestrationContext
from app.orchestration.execution_plan import is_step_required
from app.orchestration.intent_router import build_execution_plan, resolve_intent
from app.orchestration.quality_control_v2 import run_global_quality_control
from app.rag.grounded_answer_service_v2 import generate_grounded_answer
from app.services.career_assistant_v2_service import generate_career_advice_v2
from app.services.motivation_letter_v2_service import generate_motivation_letter_v2
from app.services.skill_gap_simulator_service import simulate_skill_gap_impact


def _as_dict(value: Any) -> dict:
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _clean(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def _unique_strings(values: list[Any]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if not isinstance(value, str):
            continue
        cleaned = value.strip()
        key = cleaned.lower()
        if cleaned and key not in seen:
            seen.add(key)
            result.append(cleaned)
    return result


class OrchestratorV2:
    def __init__(self):
        self.cv_agent = CVAnalysisAgentV3()
        self.offer_agent = OfferAnalysisAgentV3()
        self.matching_agent = MatchingAgentV3()

    def orchestrate(self, request: Any) -> dict[str, Any]:
        payload = self._normalize_request(request)
        intent = resolve_intent(payload.get("intent"), payload.get("question"))
        options = _as_dict(payload.get("options"))
        plan = build_execution_plan(intent, options)
        context = OrchestrationContext(intent=intent, input=payload)
        context.normalizedInput = payload
        context.debugInfo["executionPlan"] = plan

        if intent == "UNKNOWN":
            return self._unknown_response(context)

        for item in plan:
            step = item["step"]
            try:
                self._run_step(step, context, item)
            except Exception as error:  # noqa: BLE001 - step errors are reported in structured output.
                message = str(error)
                context.add_step(step, "FAILED", False, [], message)
                if item.get("required"):
                    break

        quality = run_global_quality_control(context)
        status = self._status_from_context(context, quality, plan)
        return self._format_response(context, status, quality, plan)

    def _normalize_request(self, request: Any) -> dict[str, Any]:
        payload = _as_dict(request)
        if "payload" in payload and isinstance(payload.get("payload"), dict):
            nested = dict(payload["payload"])
            nested.setdefault("intent", payload.get("intent"))
            return nested
        payload.setdefault("options", {})
        return payload

    def _run_step(self, step: str, context: OrchestrationContext, item: dict[str, Any]) -> None:
        if step == "ANALYZE_CV":
            self._run_cv_analysis(context, item)
        elif step == "ANALYZE_OFFER":
            self._run_offer_analysis(context, item)
        elif step == "MATCH_V3":
            self._run_matching(context, item)
        elif step == "SKILL_GAP_SIMULATOR":
            self._run_skill_gap_simulation(context, item)
        elif step == "RAG_V2":
            self._run_rag(context, item)
        elif step == "CAREER_ASSISTANT_V2":
            self._run_career_advice(context, item)
        elif step == "MOTIVATION_LETTER_V2":
            self._run_motivation_letter(context, item)
        elif step == "QUALITY_CONTROL":
            context.add_step("QUALITY_CONTROL", "PENDING", False, [])

    def _run_cv_analysis(self, context: OrchestrationContext, item: dict[str, Any]) -> None:
        provided = _as_dict(context.input.get("cvAnalysis"))
        if provided and item.get("canUseCache", True):
            context.cvAnalysis = provided
            context.add_step("CV_ANALYSIS", "SUCCESS", True, [])
            return

        text = _clean(context.input.get("cvText") or context.input.get("candidateText") or context.input.get("text"))
        if not text:
            if _as_dict(context.input.get("matchingResult")) or _as_dict(context.input.get("matching")):
                context.add_step("CV_ANALYSIS", "SKIPPED", False, [])
                return
            warning = "Aucun texte CV fourni; l'analyse CV n'a pas ete relancee."
            if item.get("required"):
                raise ValueError("cvText or cvAnalysis is required")
            context.add_step("CV_ANALYSIS", "SKIPPED", False, [warning])
            return

        context.cvAnalysis = self.cv_agent.run(text)
        context.add_step("CV_ANALYSIS", "SUCCESS", False, [])

    def _run_offer_analysis(self, context: OrchestrationContext, item: dict[str, Any]) -> None:
        provided = _as_dict(context.input.get("offerAnalysis"))
        if provided and item.get("canUseCache", True):
            context.offerAnalysis = provided
            context.add_step("OFFER_ANALYSIS", "SUCCESS", True, [])
            return

        offer = _as_dict(context.input.get("offer"))
        title = _clean(offer.get("title") or context.input.get("title"))
        description = _clean(offer.get("description") or context.input.get("offerText") or context.input.get("description"))
        required = _as_list(offer.get("requiredSkills") or context.input.get("requiredSkills"))
        optional = _as_list(offer.get("optionalSkills") or context.input.get("optionalSkills"))

        if not title and not description and not required:
            if _as_dict(context.input.get("matchingResult")) or _as_dict(context.input.get("matching")):
                context.add_step("OFFER_ANALYSIS", "SKIPPED", False, [])
                return
            warning = "Aucune offre assez detaillee fournie; l'analyse offre n'a pas ete relancee."
            if item.get("required"):
                raise ValueError("offer, offerText or offerAnalysis is required")
            context.add_step("OFFER_ANALYSIS", "SKIPPED", False, [warning])
            return

        context.offerAnalysis = self.offer_agent.run(
            {
                "title": title or "Offre de stage",
                "description": description or "Exigences de l'offre",
                "requiredSkills": required,
                "optionalSkills": optional,
            }
        )
        context.add_step("OFFER_ANALYSIS", "SUCCESS", False, [])

    def _candidate_skills(self, context: OrchestrationContext) -> list[str]:
        explicit = _as_list(context.input.get("candidateSkills"))
        cv = context.cvAnalysis or _as_dict(context.input.get("cvAnalysis"))
        return _unique_strings(explicit + _as_list(cv.get("detectedSkills")) + _as_list(cv.get("skills")) + _as_list(cv.get("technicalSkills")))

    def _offer_skills(self, context: OrchestrationContext) -> tuple[list[str], list[str]]:
        offer = _as_dict(context.input.get("offer"))
        analysis = context.offerAnalysis or _as_dict(context.input.get("offerAnalysis"))
        required = _unique_strings(
            _as_list(context.input.get("requiredSkills"))
            + _as_list(offer.get("requiredSkills"))
            + _as_list(analysis.get("requiredSkills"))
        )
        optional = _unique_strings(
            _as_list(context.input.get("optionalSkills"))
            + _as_list(offer.get("optionalSkills"))
            + _as_list(analysis.get("optionalSkills"))
        )
        return required, optional

    def _run_matching(self, context: OrchestrationContext, item: dict[str, Any]) -> None:
        provided = _as_dict(context.input.get("matchingResult")) or _as_dict(context.input.get("matching"))
        force = bool(_as_dict(context.input.get("options")).get("forceRecompute"))
        if provided and not force and item.get("canUseCache", True):
            context.matchingResult = provided
            context.add_step("MATCH_V3", "SUCCESS", True, [])
            return

        candidate_skills = self._candidate_skills(context)
        required, optional = self._offer_skills(context)
        if not required and item.get("required"):
            raise ValueError("requiredSkills or offerAnalysis requiredSkills are required for matching")

        context.matchingResult = self.matching_agent.run(
            {
                "candidateSkills": candidate_skills,
                "requiredSkills": required,
                "optionalSkills": optional,
                "candidateAnalysis": context.cvAnalysis or _as_dict(context.input.get("cvAnalysis")),
                "offerAnalysis": context.offerAnalysis or _as_dict(context.input.get("offerAnalysis")),
                "candidateText": context.input.get("cvText") or context.input.get("candidateText"),
                "offerText": context.input.get("offerText") or _as_dict(context.input.get("offer")).get("description"),
                "debug": bool(_as_dict(context.input.get("options")).get("debug") or context.input.get("debug")),
            }
        )
        context.add_step("MATCH_V3", "SUCCESS", False, [])

    def _run_skill_gap_simulation(self, context: OrchestrationContext, item: dict[str, Any]) -> None:
        provided = _as_dict(context.input.get("skillGapSimulation"))
        if provided and item.get("canUseCache", True):
            context.skillGapSimulation = provided
            context.add_step("SKILL_GAP_SIMULATOR", "SUCCESS", True, [])
            return
        if not context.matchingResult:
            raise ValueError("matchingResult is required for Skill Gap Simulator")
        options = _as_dict(context.input.get("options"))
        context.skillGapSimulation = simulate_skill_gap_impact(
            context.matchingResult,
            _as_list(context.input.get("selectedSkills")),
            {
                "maxCombinations": options.get("maxCombinations", 3),
                "includeProjects": options.get("includeProjects", True),
                "includeDecisionTrace": options.get("includeDecisionTrace", True),
                "simulationMode": options.get("simulationMode", "REALISTIC"),
                "forceMode": options.get("forceSimulationMode", False),
            },
        )
        context.add_step(
            "SKILL_GAP_SIMULATOR",
            "SUCCESS",
            False,
            _as_list(context.skillGapSimulation.get("warnings")),
        )

    def _rag_documents(self, context: OrchestrationContext) -> list[dict[str, Any]]:
        docs = _as_list(context.input.get("ragContextDocuments"))
        docs += _as_list(context.input.get("ragContexts"))
        docs += _as_list(context.input.get("contexts"))
        return [doc for doc in docs if isinstance(doc, dict)]

    def _run_rag(self, context: OrchestrationContext, item: dict[str, Any]) -> None:
        docs = self._rag_documents(context)
        question = _clean(context.input.get("question")) or "Synthese du contexte de candidature"
        if not docs:
            context.ragContext = {
                "used": False,
                "retrievedContextCount": 0,
                "citations": [],
                "confidence": "LOW",
                "warnings": ["Aucun contexte RAG fourni a l'orchestrateur; l'etape reste optionnelle."],
                "contexts": [],
            }
            context.add_step("RAG_V2", "SKIPPED", False, context.ragContext["warnings"])
            return
        answer = generate_grounded_answer(question, docs, _clean(context.input.get("answerMode")) or context.intent)
        context.ragContext = {
            "used": True,
            "answer": answer.get("answer"),
            "retrievedContextCount": answer.get("usedContextCount", 0),
            "citations": answer.get("citations") or [],
            "confidence": answer.get("confidence") or "LOW",
            "warnings": answer.get("warnings") or [],
            "contexts": docs,
        }
        context.add_step("RAG_V2", "SUCCESS", False, context.ragContext["warnings"])

    def _student_payload(self, context: OrchestrationContext) -> dict[str, Any]:
        student = _as_dict(context.input.get("studentProfile")) or _as_dict(context.input.get("student"))
        return {
            "firstName": _clean(student.get("firstName")) or "Etudiant",
            "lastName": _clean(student.get("lastName")) or "",
            "educationLevel": student.get("educationLevel") or context.cvAnalysis.get("educationLevel"),
            "targetJob": student.get("targetJob"),
            "bio": student.get("bio"),
            "location": student.get("location"),
        }

    def _offer_payload(self, context: OrchestrationContext) -> dict[str, Any]:
        offer = _as_dict(context.input.get("offer"))
        analysis = context.offerAnalysis or _as_dict(context.input.get("offerAnalysis"))
        company = _as_dict(context.input.get("company"))
        required, optional = self._offer_skills(context)
        return {
            "id": str(offer.get("id") or context.input.get("offerId") or "offer"),
            "title": _clean(offer.get("title") or analysis.get("title")) or "Offre de stage",
            "description": _clean(offer.get("description") or analysis.get("description")) or "Description non fournie",
            "location": offer.get("location"),
            "duration": offer.get("duration"),
            "requiredSkills": required,
            "optionalSkills": optional,
            "companyName": _clean(offer.get("companyName") or company.get("companyName")) or "Entreprise",
        }

    def _company_payload(self, context: OrchestrationContext) -> dict[str, Any]:
        company = _as_dict(context.input.get("company"))
        offer = _as_dict(context.input.get("offer"))
        return {
            "companyName": _clean(company.get("companyName") or offer.get("companyName")),
            "sector": company.get("sector") or offer.get("sector"),
        }

    def _run_career_advice(self, context: OrchestrationContext, item: dict[str, Any]) -> None:
        provided = _as_dict(context.input.get("careerAdvice"))
        if provided and item.get("canUseCache", True):
            context.careerAdvice = provided
            context.add_step("CAREER_ASSISTANT_V2", "SUCCESS", True, [])
            return
        if not context.matchingResult:
            raise ValueError("matchingResult is required for Career Assistant V2")
        docs = _as_list(context.ragContext.get("contexts")) if context.ragContext else self._rag_documents(context)
        context.careerAdvice = generate_career_advice_v2(
            {
                "student": self._student_payload(context),
                "candidateSkills": self._candidate_skills(context),
                "offer": self._offer_payload(context),
                "matching": context.matchingResult,
                "question": context.input.get("question"),
                "ragContextDocuments": docs,
                "skillGapSimulation": context.skillGapSimulation,
            }
        )
        context.add_step("CAREER_ASSISTANT_V2", "SUCCESS", False, _as_list(_as_dict(context.careerAdvice.get("v2")).get("warnings")))

    def _run_motivation_letter(self, context: OrchestrationContext, item: dict[str, Any]) -> None:
        if not context.matchingResult:
            raise ValueError("matchingResult is required for Motivation Letter V2")
        docs = _as_list(context.ragContext.get("contexts")) if context.ragContext else self._rag_documents(context)
        context.motivationLetter = generate_motivation_letter_v2(
            {
                "student": self._student_payload(context),
                "studentProfile": self._student_payload(context),
                "candidateSkills": self._candidate_skills(context),
                "offer": self._offer_payload(context),
                "company": self._company_payload(context),
                "matching": context.matchingResult,
                "matchingResult": context.matchingResult,
                "cvAnalysis": context.cvAnalysis,
                "offerAnalysis": context.offerAnalysis,
                "careerAdvice": context.careerAdvice,
                "applicationMessage": context.input.get("applicationMessage"),
                "ragContextDocuments": docs,
                "tone": context.input.get("tone") or "PROFESSIONAL",
            }
        )
        warnings = _as_list(_as_dict(context.motivationLetter.get("v2")).get("warnings"))
        context.add_step("MOTIVATION_LETTER_V2", "SUCCESS", False, warnings)

    def _status_from_context(self, context: OrchestrationContext, quality: dict[str, Any], plan: list[dict[str, Any]]) -> str:
        if quality.get("blockingIssues"):
            return "FAILED"
        required_failures = [
            step
            for step in context.stepResults
            if step.get("status") == "FAILED" and is_step_required(plan, str(step.get("name")).replace("CV_ANALYSIS", "ANALYZE_CV").replace("OFFER_ANALYSIS", "ANALYZE_OFFER"))
        ]
        if required_failures:
            return "FAILED"
        if any(
            step.get("status") == "FAILED" or (step.get("status") == "SKIPPED" and step.get("warnings"))
            for step in context.stepResults
            if step.get("name") != "QUALITY_CONTROL"
        ):
            return "PARTIAL_SUCCESS"
        if quality.get("warnings"):
            return "PARTIAL_SUCCESS"
        return "SUCCESS"

    def _summary(self, context: OrchestrationContext, status: str) -> str:
        if context.intent == "MATCH" and context.matchingResult:
            return f"Matching V3 calcule avec un score de {context.matchingResult.get('score')}/100 et une confiance {context.matchingResult.get('confidence', 'LOW')}."
        if context.intent == "SKILL_GAP_SIMULATION" and context.skillGapSimulation:
            return (
                f"Simulation terminee: score actuel {context.skillGapSimulation.get('currentScore')}/100, "
                f"potentiel estime {context.skillGapSimulation.get('potentialBestScore')}/100."
            )
        if context.intent == "CAREER_ADVICE" and context.careerAdvice:
            readiness = _as_dict(context.careerAdvice.get("v2")).get("readinessLevel")
            return f"Conseil carriere V2 genere avec un niveau de preparation {readiness or 'UNKNOWN'}."
        if context.intent == "GENERATE_LETTER" and context.motivationLetter:
            score = _as_dict(context.motivationLetter.get("v2")).get("personalizationScore")
            return f"Lettre de motivation V2 generee avec un score de personnalisation {score}."
        if context.intent == "FULL_APPLICATION_ASSISTANCE":
            score = context.matchingResult.get("score") if context.matchingResult else "non calcule"
            return f"Assistance complete terminee avec statut {status}; score matching: {score}."
        if context.intent == "RAG_QUESTION":
            return "Question RAG traitee a partir du contexte fourni."
        return f"Orchestration {context.intent} terminee avec statut {status}."

    def _format_response(self, context: OrchestrationContext, status: str, quality: dict[str, Any], plan: list[dict[str, Any]]) -> dict[str, Any]:
        steps = [
            {**step, **({"status": "SUCCESS"} if step["name"] == "QUALITY_CONTROL" and quality.get("passed") else {})}
            for step in context.stepResults
        ]
        response = {
            "intent": context.intent,
            "status": status,
            "summary": self._summary(context, status),
            "steps": steps,
            "results": {
                "cvAnalysis": context.cvAnalysis,
                "offerAnalysis": context.offerAnalysis,
                "matching": context.matchingResult,
                "skillGapSimulation": context.skillGapSimulation,
                "rag": {
                    "used": bool(context.ragContext.get("used")),
                    "retrievedContextCount": context.ragContext.get("retrievedContextCount", 0),
                    "citations": context.ragContext.get("citations", []),
                    "confidence": context.ragContext.get("confidence", "LOW"),
                    "warnings": context.ragContext.get("warnings", []),
                    "answer": context.ragContext.get("answer"),
                },
                "careerAdvice": context.careerAdvice,
                "motivationLetter": context.motivationLetter,
            },
            "qualityControl": quality,
            "recommendations": self._recommendations(context),
            "warnings": list(dict.fromkeys(context.warnings + quality.get("warnings", []))),
        }
        if _as_dict(context.input.get("options")).get("debug") or context.input.get("debug"):
            response["debug"] = {"requestId": context.requestId, "executionPlan": plan, "errors": context.errors}
        return response

    def _recommendations(self, context: OrchestrationContext) -> list[str]:
        if context.careerAdvice:
            direct = _as_dict(context.careerAdvice.get("v2")).get("directAnswer")
            final = context.careerAdvice.get("finalAdvice")
            return [item for item in [direct, final] if item][:2]
        if context.skillGapSimulation:
            return [
                context.skillGapSimulation.get("summary"),
                *[
                    f"Prioriser {item.get('skill')}: gain estime {item.get('expectedGain')} point(s)."
                    for item in _as_list(context.skillGapSimulation.get("recommendedPath"))[:2]
                ],
            ][:3]
        if context.matchingResult:
            return _as_list(context.matchingResult.get("recommendations"))[:3]
        return []

    def _unknown_response(self, context: OrchestrationContext) -> dict[str, Any]:
        quality = {
            "passed": False,
            "checks": [],
            "warnings": ["Intent non reconnu; aucun agent n'a ete execute."],
            "blockingIssues": [],
        }
        return {
            "intent": "UNKNOWN",
            "status": "FAILED",
            "summary": "L'orchestrateur n'a pas pu determiner l'action a executer.",
            "steps": [],
            "results": {},
            "qualityControl": quality,
            "recommendations": [
                "Precisez intent=MATCH pour calculer un score.",
                "Precisez intent=SKILL_GAP_SIMULATION pour estimer l'impact de competences a renforcer.",
                "Precisez intent=CAREER_ADVICE pour obtenir un plan d'action.",
                "Precisez intent=FULL_APPLICATION_ASSISTANCE pour coordonner matching, conseils et lettre.",
            ],
            "warnings": quality["warnings"],
        }


_orchestrator = OrchestratorV2()


def orchestrate_v2(request: Any) -> dict[str, Any]:
    return _orchestrator.orchestrate(request)
