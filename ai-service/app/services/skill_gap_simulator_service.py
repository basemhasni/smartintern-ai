"""Evidence-aware potential score simulations built on Matching V3 outputs."""

from __future__ import annotations

from itertools import combinations
from typing import Any

from app.knowledge.skill_taxonomy import get_skill
from app.services.hybrid_matching_engine_v3 import calculate_hybrid_score, resolve_decision_label
from app.utils.text_normalization import normalize_text


MODE_FACTORS = {"CONSERVATIVE": 0.72, "REALISTIC": 1.0, "OPTIMISTIC": 1.12}
MODE_ASSUMPTIONS = {
    "CONSERVATIVE": {"coverage": 0.55, "confidence": 0.55, "evidenceType": "SKILL_LIST", "evidenceLevel": "WEAK"},
    "REALISTIC": {"coverage": 0.72, "confidence": 0.75, "evidenceType": "EDUCATION", "evidenceLevel": "MEDIUM"},
    "OPTIMISTIC": {"coverage": 0.95, "confidence": 0.92, "evidenceType": "PROJECT", "evidenceLevel": "STRONG"},
}
TARGET_COVERAGE = {mode: values["coverage"] for mode, values in MODE_ASSUMPTIONS.items()}
PRIORITY_ORDER = {"CRITICAL": 0, "REQUIRED": 1, "PARTIAL": 2, "WEAK_EVIDENCE": 3, "OPTIONAL": 4}


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _skill_key(value: Any) -> str:
    return normalize_text(str(value or ""))


def _unique_skills(values: list[Any]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if not isinstance(value, str) or not value.strip():
            continue
        key = _skill_key(value)
        if key not in seen:
            seen.add(key)
            result.append(value.strip())
    return result


def _decision_label(score: int, confidence: str = "MEDIUM", critical_missing_count: int = 0) -> str:
    return resolve_decision_label(score, True, True, confidence, critical_missing_count)


def _find_row(matrix: list[dict], skill: str) -> dict:
    key = _skill_key(skill)
    return next((_as_dict(row) for row in matrix if _skill_key(_as_dict(row).get("requirement")) == key), {})


def _find_evidence(skill_map: dict, skill: str) -> dict:
    key = _skill_key(skill)
    for name, value in skill_map.items():
        if _skill_key(name) == key:
            return _as_dict(value)
    return {}


def _partial_names(v3: dict) -> list[str]:
    return _unique_skills([
        item.get("skill") if isinstance(item, dict) else item
        for item in _as_list(v3.get("partialMatchedSkills"))
    ])


def _category(skill: str, row: dict | None = None) -> str:
    row_category = _as_dict(row).get("category")
    definition = get_skill(skill)
    raw = row_category or (definition.category if definition else "Other")
    if raw == "DevOps / Cloud":
        return "DevOps"
    if raw == "Testing / QA":
        return "QA / Testing"
    return str(raw)


def _gap_reason(skill: str, gap_type: str, evidence_level: str) -> str:
    if gap_type == "CRITICAL":
        return f"{skill} est critique pour l'offre et aucune couverture suffisamment forte n'est disponible."
    if gap_type == "REQUIRED":
        return f"{skill} est obligatoire dans l'offre et reste insuffisamment couverte."
    if gap_type == "OPTIONAL":
        return f"{skill} est optionnelle; elle peut renforcer le dossier sans remplacer les exigences obligatoires."
    if gap_type == "PARTIAL":
        return f"{skill} est seulement couverte de maniere partielle; une utilisation directe est necessaire."
    return f"{skill} est detectee, mais la preuve actuelle est {evidence_level.lower()} et manque de contexte concret."


def _impact_text(gap_type: str, category: str) -> str:
    if gap_type == "CRITICAL":
        return f"La simulation couvre une exigence critique et peut lever un plafond, tout en renforcant {category}."
    if gap_type == "REQUIRED":
        return f"La simulation augmente directement la couverture des competences obligatoires et renforce {category}."
    if gap_type == "OPTIONAL":
        return f"La simulation apporte un bonus modere dans {category}, apres les exigences principales."
    if gap_type == "PARTIAL":
        return f"La simulation transforme un signal partiel en preuve explicite dans {category}."
    return f"La simulation renforce surtout la qualite de preuve dans {category}, sans inventer une nouvelle competence."


def identify_high_impact_gaps(matching_result: dict) -> list[dict]:
    matching = _as_dict(matching_result)
    v3 = _as_dict(matching.get("v3"))
    explainability = _as_dict(matching.get("explainability"))
    skill_map = _as_dict(explainability.get("skillEvidenceMap"))
    matrix = [_as_dict(row) for row in _as_list(v3.get("coverageMatrix"))]
    critical_skills = _unique_skills(v3.get("criticalMissingSkills") or [])
    critical = {_skill_key(skill) for skill in critical_skills}
    required = _unique_skills(v3.get("missingRequiredSkills") or matching.get("missingSkills") or [])
    optional = _unique_skills(v3.get("missingOptionalSkills") or [])
    partial = _partial_names(v3)
    candidates = _unique_skills(critical_skills + required + optional + partial)

    for skill, evidence in skill_map.items():
        level = str(_as_dict(evidence).get("evidenceLevel") or "").upper()
        if level in {"WEAK", "MEDIUM"} and _find_row(matrix, skill):
            candidates = _unique_skills(candidates + [skill])

    gaps: list[dict] = []
    for skill in candidates:
        row = _find_row(matrix, skill)
        evidence = _find_evidence(skill_map, skill)
        evidence_level = str(evidence.get("evidenceLevel") or ("MISSING" if not row.get("evidence") else "WEAK")).upper()
        coverage = float(row.get("coverage") or 0)
        importance = str(row.get("importance") or "").upper()
        key = _skill_key(skill)
        if key in critical or importance == "CRITICAL" and coverage < 0.75:
            gap_type = "CRITICAL"
        elif any(_skill_key(item) == key for item in required) or importance == "REQUIRED" and coverage < 0.75:
            gap_type = "REQUIRED"
        elif any(_skill_key(item) == key for item in partial) or 0 < coverage < 0.75:
            gap_type = "PARTIAL"
        elif evidence_level in {"WEAK", "MEDIUM"} and coverage >= 0.75:
            gap_type = "WEAK_EVIDENCE"
        else:
            gap_type = "OPTIONAL"
        if evidence_level == "STRONG" and coverage >= 0.75:
            continue
        category = _category(skill, row)
        gaps.append(
            {
                "skill": skill,
                "gapType": gap_type,
                "currentEvidenceLevel": evidence_level,
                "targetEvidenceLevel": "STRONG",
                "currentCoverage": round(coverage, 3),
                "estimatedScoreGain": 0,
                "priority": "HIGH" if gap_type in {"CRITICAL", "REQUIRED"} else "MEDIUM" if gap_type in {"PARTIAL", "WEAK_EVIDENCE"} else "LOW",
                "reason": _gap_reason(skill, gap_type, evidence_level),
                "category": category,
            }
        )
    return sorted(gaps, key=lambda item: (PRIORITY_ORDER.get(item["gapType"], 9), item["skill"].lower()))


def _component_delta(matrix: list[dict], skill: str, mode: str) -> float:
    row = _find_row(matrix, skill)
    if not row:
        return {"CONSERVATIVE": 0.5, "REALISTIC": 1.0, "OPTIMISTIC": 1.5}[mode]
    current = float(row.get("coverage") or 0)
    target = max(current, TARGET_COVERAGE[mode])
    coverage_delta = target - current
    importance = str(row.get("importance") or "REQUIRED").upper()
    required_rows = [item for item in matrix if str(item.get("importance") or "").upper() in {"CRITICAL", "REQUIRED"}]
    critical_rows = [item for item in matrix if str(item.get("importance") or "").upper() == "CRITICAL"]
    optional_rows = [item for item in matrix if str(item.get("importance") or "").upper() == "OPTIONAL"]
    gain = 0.0
    if importance == "CRITICAL":
        gain += 35.0 / max(1, len(critical_rows)) * coverage_delta
        gain += 30.0 / max(1, len(required_rows)) * coverage_delta
    elif importance == "REQUIRED":
        gain += 30.0 / max(1, len(required_rows)) * coverage_delta
    else:
        gain += 10.0 / max(1, len(optional_rows)) * coverage_delta * 0.45
    evidence_type = str(row.get("evidenceType") or "NONE").upper()
    evidence_current = {"PROJECT": 1.0, "EXPERIENCE": 1.0, "EDUCATION": 0.72, "SKILL_LIST": 0.62, "SUMMARY": 0.45}.get(evidence_type, 0.25)
    evidence_gain = max(0.0, 0.95 - evidence_current)
    gain += 10.0 / max(1, len(required_rows)) * evidence_gain if importance != "OPTIONAL" else 0.8 * evidence_gain
    adjusted = max(0.0, gain * MODE_FACTORS[mode])
    gain_caps = {
        "CRITICAL": {"CONSERVATIVE": 12.0, "REALISTIC": 18.0, "OPTIMISTIC": 22.0},
        "REQUIRED": {"CONSERVATIVE": 7.0, "REALISTIC": 10.0, "OPTIMISTIC": 13.0},
        "OPTIONAL": {"CONSERVATIVE": 2.0, "REALISTIC": 4.0, "OPTIMISTIC": 5.0},
    }
    return min(adjusted, gain_caps.get(importance, gain_caps["REQUIRED"])[mode])


def _simulated_matrix(matching_result: dict, skills: list[str], mode: str) -> list[dict]:
    matrix = [dict(_as_dict(row)) for row in _as_list(_as_dict(matching_result.get("v3")).get("coverageMatrix"))]
    keys = {_skill_key(skill) for skill in skills}
    assumption = MODE_ASSUMPTIONS[mode]
    for row in matrix:
        if _skill_key(row.get("requirement")) in keys:
            row["coverage"] = max(float(row.get("coverage") or 0), float(assumption["coverage"]))
            row["confidence"] = max(float(row.get("confidence") or 0), float(assumption["confidence"]))
            row["matchType"] = "SIMULATED_EVIDENCE"
            row["evidenceType"] = assumption["evidenceType"]
            row["evidence"] = [f"Hypothese {mode.lower()}: niveau de preuve {str(assumption['evidenceLevel']).lower()}."]
            row["declaredSkill"] = assumption["evidenceLevel"] == "WEAK"
    return matrix


def _matching_v3_context(matching_result: dict) -> tuple[dict, dict] | None:
    context = _as_dict(_as_dict(matching_result.get("v3")).get("scoringContext"))
    candidate_profile = _as_dict(context.get("candidateProfile"))
    offer_analysis = _as_dict(context.get("offerAnalysis"))
    if not candidate_profile or not offer_analysis:
        return None
    return candidate_profile, offer_analysis


def _score_caps_from_warnings(warnings: list[str], final_score: int) -> list[dict]:
    known_caps = (35, 55, 60, 72, 90, 95, 98)
    caps = []
    for warning in warnings:
        cap = next((value for value in known_caps if str(value) in warning), final_score)
        caps.append({"cap": cap, "reason": warning})
    return caps


def _cv_quality_is_low(matching_result: dict) -> bool:
    v3 = _as_dict(matching_result.get("v3"))
    breakdown = _as_dict(v3.get("scoreBreakdown") or matching_result.get("scoreBreakdown"))
    evidence = _as_dict(v3.get("evidenceSummary"))
    return (
        str(matching_result.get("confidence") or "LOW").upper() == "LOW"
        and float(breakdown.get("cvQuality") or 0) <= 0.5
    ) or (not _as_list(v3.get("coverageMatrix")) and not evidence)


def _apply_score_caps(raw_score: float, matrix: list[dict], matching_result: dict) -> tuple[int, list[dict]]:
    caps: list[dict] = []
    critical_rows = [row for row in matrix if str(row.get("importance") or "").upper() == "CRITICAL"]
    required_rows = [row for row in matrix if str(row.get("importance") or "").upper() in {"CRITICAL", "REQUIRED"}]
    critical_missing = [row for row in critical_rows if float(row.get("coverage") or 0) < 0.75]
    missing_required = [row for row in required_rows if float(row.get("coverage") or 0) < 0.45]
    covered_required = [row for row in required_rows if float(row.get("coverage") or 0) >= 0.45]
    cap = 95
    if critical_missing:
        cap = min(cap, 72)
        caps.append({"cap": 72, "reason": "Une competence critique reste manquante apres simulation."})
    if required_rows and len(missing_required) / len(required_rows) > 0.5:
        cap = min(cap, 55)
        caps.append({"cap": 55, "reason": "Plus de la moitie des competences obligatoires restent manquantes."})
    if required_rows and not covered_required:
        cap = min(cap, 35)
        caps.append({"cap": 35, "reason": "Aucune competence obligatoire ne reste suffisamment couverte."})
    if _cv_quality_is_low(matching_result):
        cap = min(cap, 60)
        caps.append({"cap": 60, "reason": "La qualite du CV reste faible; ajouter une competence ne remplace pas un CV suffisamment documente."})
    caps.append({"cap": 95, "reason": "Le simulateur reste prudent et ne projette pas de score superieur a 95."})
    return max(0, min(95, round(min(raw_score, cap)))), caps


def estimate_potential_score(matching_result: dict, simulated_changes: list[str], mode: str = "REALISTIC") -> dict:
    matching = _as_dict(matching_result)
    mode = str(mode or "REALISTIC").upper()
    if mode not in MODE_FACTORS:
        mode = "REALISTIC"
    current = max(0, min(100, int(float(matching.get("score") or 0))))
    v3 = _as_dict(matching.get("v3"))
    matrix = [_as_dict(row) for row in _as_list(v3.get("coverageMatrix"))]
    breakdown = _as_dict(v3.get("scoreBreakdown") or matching.get("scoreBreakdown"))
    simulated = _simulated_matrix(matching, simulated_changes, mode)
    scoring_context = _matching_v3_context(matching)
    if scoring_context and matrix:
        candidate_profile, offer_analysis = scoring_context
        scoring = calculate_hybrid_score(simulated, candidate_profile, offer_analysis)
        potential = min(95, scoring["score"])
        caps = _score_caps_from_warnings(scoring.get("warnings") or [], potential)
        if _cv_quality_is_low(matching) and not any(item.get("cap") == 60 for item in caps):
            caps.append({"cap": 60, "reason": "La qualite du CV limite tout scenario a 60 tant que les preuves restent insuffisantes."})
        if scoring["score"] > 95:
            caps.append({"cap": 95, "reason": "Le simulateur conserve un plafond prudent de 95."})
        component_gains = {}
        for skill in simulated_changes:
            single_scoring = calculate_hybrid_score(
                _simulated_matrix(matching, [skill], mode),
                candidate_profile,
                offer_analysis,
            )
            component_gains[skill] = max(0, min(95, single_scoring["score"]) - current)
    else:
        raw_base = float(breakdown.get("rawTotal") or current)
        component_gains = {skill: round(_component_delta(matrix, skill, mode), 2) for skill in simulated_changes}
        synergy = min(3.0, max(0, len(simulated_changes) - 1) * (0.8 if mode == "CONSERVATIVE" else 1.3))
        potential, caps = _apply_score_caps(raw_base + sum(component_gains.values()) + synergy, simulated, matching)
    potential = max(current, potential)
    return {
        "score": potential,
        "gain": potential - current,
        "componentGains": component_gains,
        "scoreCapsApplied": caps,
        "simulatedMatrix": simulated,
        "mode": mode,
    }


def simulate_single_skill_improvement(matching_result: dict, skill: str, options: dict | None = None) -> dict:
    opts = _as_dict(options)
    mode = str(opts.get("simulationMode") or "REALISTIC").upper()
    estimate = estimate_potential_score(matching_result, [skill], mode)
    gap = next((item for item in identify_high_impact_gaps(matching_result) if _skill_key(item["skill"]) == _skill_key(skill)), {})
    current = int(float(_as_dict(matching_result).get("score") or 0))
    assumption = MODE_ASSUMPTIONS.get(mode, MODE_ASSUMPTIONS["REALISTIC"])
    return {
        "skill": skill,
        "beforeScore": current,
        "afterScore": estimate["score"],
        "gain": estimate["gain"],
        "beforeEvidenceLevel": gap.get("currentEvidenceLevel", "MISSING"),
        "afterEvidenceLevel": assumption["evidenceLevel"],
        "assumption": f"Simulation {mode.lower()} basee sur une preuve {str(assumption['evidenceLevel']).lower()} pour {skill}.",
        "impactExplanation": _impact_text(gap.get("gapType", "REQUIRED"), gap.get("category", _category(skill))),
        "confidence": "LOW" if str(_as_dict(matching_result).get("confidence") or "LOW").upper() == "LOW" else "MEDIUM",
        "scoreCapsApplied": estimate["scoreCapsApplied"],
    }


def simulate_skill_combination(matching_result: dict, skills: list[str], options: dict | None = None) -> dict:
    opts = _as_dict(options)
    mode = str(opts.get("simulationMode") or "REALISTIC").upper()
    selected = _unique_skills(skills)
    estimate = estimate_potential_score(matching_result, selected, mode)
    current = int(float(_as_dict(matching_result).get("score") or 0))
    confidence = str(_as_dict(matching_result).get("confidence") or "LOW").upper()
    simulated_matrix = estimate.get("simulatedMatrix") or []
    critical_missing_count = sum(
        1 for row in simulated_matrix
        if str(row.get("importance") or "").upper() == "CRITICAL" and float(row.get("coverage") or 0) < 0.75
    )
    categories = _unique_skills([_category(skill, _find_row(_as_list(_as_dict(matching_result.get("v3")).get("coverageMatrix")), skill)) for skill in selected])
    return {
        "skills": selected,
        "beforeScore": current,
        "afterScore": estimate["score"],
        "gain": estimate["gain"],
        "decisionLabelAfter": _decision_label(estimate["score"], confidence, critical_missing_count),
        "reason": f"Cette combinaison renforce {', '.join(categories[:3])} et couvre plusieurs ecarts complementaires avec des preuves reelles.",
        "confidence": "LOW" if str(_as_dict(matching_result).get("confidence") or "LOW").upper() == "LOW" else "MEDIUM",
        "scoreCapsApplied": estimate["scoreCapsApplied"],
    }


def generate_gap_projects(skill_gaps: list[dict], offer_domain: str) -> list[dict]:
    skills = _unique_skills([gap.get("skill") for gap in skill_gaps if gap.get("priority") in {"HIGH", "MEDIUM"}])[:3]
    if not skills:
        return []
    keys = {_skill_key(skill) for skill in skills}
    if keys & {_skill_key("Docker"), _skill_key("CI/CD"), _skill_key("GitHub Actions"), _skill_key("Kubernetes")}:
        project = {
            "title": "Dockeriser une API et ajouter une pipeline CI/CD",
            "description": "Creer une API simple, la dockeriser avec sa base de donnees et automatiser les controles avec GitHub Actions.",
            "deliverables": ["Dockerfile", "docker-compose.yml", "workflow GitHub Actions", "README de lancement"],
        }
    elif keys & {_skill_key("React"), _skill_key("Angular"), _skill_key("Vue"), _skill_key("TypeScript")}:
        project = {
            "title": "Construire une interface web connectee a une API REST",
            "description": "Realiser une interface avec filtres, pagination, formulaire, chargement et gestion des erreurs.",
            "deliverables": ["Interface responsive", "Integration API REST", "Tests principaux", "README illustre"],
        }
    elif keys & {_skill_key("PostgreSQL"), _skill_key("MySQL"), _skill_key("SQL"), _skill_key("Prisma")}:
        project = {
            "title": "Modeliser un mini-systeme de candidatures",
            "description": "Concevoir les relations, migrations et requetes d'un workflow simple d'offres et de candidatures.",
            "deliverables": ["Schema relationnel", "Migrations", "Jeu de donnees", "Requetes documentees"],
        }
    elif keys & {_skill_key("Postman"), _skill_key("Selenium"), _skill_key("Playwright"), _skill_key("Cypress")}:
        project = {
            "title": "Automatiser un parcours de tests API et web",
            "description": "Couvrir les parcours nominaux et les erreurs avec une collection API et quelques tests automatises.",
            "deliverables": ["Collection Postman", "Suite automatisee", "Donnees de test", "Rapport d'execution"],
        }
    elif keys & {_skill_key("RAG"), _skill_key("LangGraph"), _skill_key("Machine Learning"), _skill_key("NLP")}:
        project = {
            "title": "Creer un mini assistant documentaire contextualise",
            "description": "Indexer quelques documents, retrouver les passages pertinents et produire une reponse avec sources.",
            "deliverables": ["Pipeline d'indexation", "Recherche contextuelle", "Citations", "Evaluation sur quelques questions"],
        }
    else:
        project = {
            "title": f"Mini-projet cible autour de {', '.join(skills[:2])}",
            "description": "Construire une demonstration limitee mais terminee qui prouve l'utilisation des competences ciblees.",
            "deliverables": ["Code fonctionnel", "README", "Captures ou courte demonstration", "Bilan des choix techniques"],
        }
    return [
        {
            **project,
            "skillsCovered": skills,
            "difficulty": "INTERMEDIATE" if len(skills) > 1 else "BEGINNER",
            "estimatedTime": "1 semaine" if len(skills) > 1 else "2-4 jours",
            "portfolioValue": f"Fournit une preuve verifiable pour {', '.join(skills)} dans le domaine {offer_domain or 'cible'}, sans garantir le score final.",
        }
    ]


def _recommended_evidence(skill: str) -> str:
    key = _skill_key(skill)
    if key == _skill_key("Docker"):
        return "Creer un projet dockerise avec Docker Compose et documenter le lancement."
    if key in {_skill_key("CI/CD"), _skill_key("GitHub Actions"), _skill_key("Jenkins")}:
        return "Ajouter un pipeline simple qui execute tests et build."
    if key == _skill_key("React"):
        return "Construire une interface React consommant une API REST et documenter les composants realises."
    if key in {_skill_key("PostgreSQL"), _skill_key("SQL")}:
        return "Montrer un schema relationnel, des migrations et quelques requetes utiles."
    return f"Realiser un mini-projet utilisant reellement {skill} et documenter votre contribution."


def build_simulation_summary(current_score: int, simulations: list[dict]) -> str:
    if not simulations or max((item.get("gain", 0) for item in simulations), default=0) <= 1:
        return "Votre profil est deja bien aligne ou les donnees disponibles ne montrent pas de gain technique important. Consolidez surtout les preuves existantes."
    best = max(simulations, key=lambda item: item.get("gain", 0))
    label = best.get("skill") or " + ".join(best.get("skills") or [])
    return (
        f"Le score actuel est {current_score}/100. Le scenario le plus utile concerne {label} "
        f"et estime un gain potentiel de {best.get('gain', 0)} point(s), uniquement si une preuve reelle est ajoutee."
    )


def create_simulation_decision_trace(matching_result: dict, simulations: list[dict]) -> list[dict]:
    gaps = identify_high_impact_gaps(matching_result)
    best = max(simulations, key=lambda item: item.get("gain", 0), default={})
    return [
        {
            "step": "CURRENT_MATCHING",
            "title": "Point de depart",
            "status": "SUCCESS",
            "summary": f"Le matching actuel est de {int(float(_as_dict(matching_result).get('score') or 0))}/100.",
        },
        {
            "step": "GAP_PRIORITIZATION",
            "title": "Priorisation des ecarts",
            "status": "SUCCESS" if gaps else "LIMITED",
            "summary": f"{len(gaps)} ecart(s) exploitable(s) ont ete classes selon criticite, couverture et preuve.",
        },
        {
            "step": "POTENTIAL_SCORE",
            "title": "Estimation du potentiel",
            "status": "SUCCESS" if best else "LIMITED",
            "summary": (
                f"Le meilleur scenario estime un score de {best.get('afterScore')}/100 avec un gain de {best.get('gain')} point(s)."
                if best
                else "Aucun scenario fiable ne peut etre estime avec les donnees actuelles."
            ),
        },
        {
            "step": "LIMITATIONS",
            "title": "Limites de la simulation",
            "status": "INFO",
            "summary": "Le gain suppose un apprentissage reel et une preuve verifiable; il ne garantit ni le futur score ni une decision de recrutement.",
        },
    ]


def simulate_skill_gap_impact(matching_result: dict, selected_skills: list[str] | None = None, options: dict | None = None) -> dict:
    matching = _as_dict(matching_result)
    if not matching:
        raise ValueError("matchingResult is required")
    opts = _as_dict(options)
    requested_mode = str(opts.get("simulationMode") or "REALISTIC").upper()
    warnings: list[str] = []
    mode = requested_mode if requested_mode in MODE_FACTORS else "REALISTIC"
    if requested_mode not in MODE_FACTORS:
        warnings.append(f"Mode {requested_mode} inconnu; REALISTIC a ete utilise.")
    if str(matching.get("confidence") or "LOW").upper() == "LOW" and mode != "CONSERVATIVE":
        warnings.append("La confiance du matching est faible; les gains sont presentes avec prudence. Le mode CONSERVATIVE est recommande.")
        if not opts.get("forceMode"):
            mode = "CONSERVATIVE"

    v3 = _as_dict(matching.get("v3"))
    explainability = _as_dict(matching.get("explainability"))
    if not v3:
        warnings.append("Matching V3 absent; estimation simplifiee a partir des champs legacy.")
    if not explainability:
        warnings.append("Explainability absente; les niveaux de preuve utilisent des valeurs de repli.")

    gaps = identify_high_impact_gaps(matching)
    selected = _unique_skills(selected_skills or [])
    if selected:
        known = {_skill_key(gap["skill"]) for gap in gaps}
        for skill in selected:
            if _skill_key(skill) not in known:
                warnings.append(f"{skill} n'est pas identifiee comme gap prioritaire; son gain estime restera limite.")
                gaps.append(
                    {
                        "skill": skill,
                        "gapType": "OPTIONAL",
                        "currentEvidenceLevel": "MISSING",
                        "targetEvidenceLevel": "STRONG",
                        "currentCoverage": 0,
                        "estimatedScoreGain": 0,
                        "priority": "LOW",
                        "reason": f"{skill} a ete demandee explicitement pour la simulation.",
                        "category": _category(skill),
                    }
                )

    single_skills = selected or [gap["skill"] for gap in gaps[:6]]
    singles = [simulate_single_skill_improvement(matching, skill, {"simulationMode": mode}) for skill in single_skills]
    gains = {_skill_key(item["skill"]): item["gain"] for item in singles}
    for gap in gaps:
        gap["estimatedScoreGain"] = gains.get(_skill_key(gap["skill"]), 0)
    gaps.sort(key=lambda item: (-item["estimatedScoreGain"], PRIORITY_ORDER.get(item["gapType"], 9), item["skill"].lower()))

    combination_pool = selected or [gap["skill"] for gap in gaps[:5]]
    max_combinations = max(0, min(10, int(opts.get("maxCombinations") or 3)))
    candidates: list[dict] = []
    for size in (2, 3):
        for skills in combinations(combination_pool, size):
            candidates.append(simulate_skill_combination(matching, list(skills), {"simulationMode": mode}))
    combinations_result = sorted(candidates, key=lambda item: (-item["gain"], len(item["skills"])))[:max_combinations]
    all_simulations = singles + combinations_result
    best = max(all_simulations, key=lambda item: item.get("gain", 0), default={})
    current = max(0, min(100, int(float(matching.get("score") or 0))))

    path_skills = list(best.get("skills") or ([best.get("skill")] if best.get("skill") else []))
    if not path_skills:
        path_skills = [gap["skill"] for gap in gaps[:3]]
    recommended_path = []
    previous_score = current
    accumulated: list[str] = []
    for index, skill in enumerate(path_skills[:3]):
        accumulated.append(skill)
        step_estimate = estimate_potential_score(matching, accumulated, mode)
        incremental_gain = max(0, step_estimate["score"] - previous_score)
        recommended_path.append(
            {
                "order": index + 1,
                "skill": skill,
                "whyFirst": (
                    "Meilleur impact immediat estime sur le score et les plafonds."
                    if index == 0
                    else "Complete les competences precedentes et renforce la couverture du domaine."
                ),
                "expectedGain": incremental_gain,
                "recommendedEvidence": _recommended_evidence(skill),
            }
        )
        previous_score = step_estimate["score"]
    offer_domain = _as_dict(v3.get("domainAlignment")).get("offerDomain") or "GENERAL"
    project_gaps = [gap for gap in gaps if _skill_key(gap["skill"]) in {_skill_key(skill) for skill in path_skills}]
    projects = generate_gap_projects(project_gaps or gaps[:3], str(offer_domain)) if opts.get("includeProjects", True) else []
    caps = best.get("scoreCapsApplied") or []
    decision_trace = create_simulation_decision_trace(matching, all_simulations) if opts.get("includeDecisionTrace", True) else []

    if not gaps:
        warnings.append("Aucun gap prioritaire n'a ete identifie; la simulation se concentre sur la qualite des preuves existantes.")
    return {
        "currentScore": current,
        "currentDecisionLabel": matching.get("decisionLabel") or _decision_label(current),
        "potentialBestScore": int(best.get("afterScore") or current),
        "potentialDecisionLabel": best.get("decisionLabelAfter") or _decision_label(int(best.get("afterScore") or current)),
        "scoreGain": int(best.get("gain") or 0),
        "simulationMode": mode,
        "highImpactGaps": gaps[:6],
        "singleSkillSimulations": singles,
        "combinationSimulations": combinations_result,
        "recommendedPath": recommended_path,
        "recommendedProjects": projects[:3],
        "scoreCapsApplied": caps,
        "decisionTrace": decision_trace,
        "summary": build_simulation_summary(current, all_simulations),
        "warnings": _unique_skills(warnings),
        "assumptions": [
            "Chaque gain suppose une competence reellement acquise et une preuve projet ou experience ajoutee.",
            "La simulation reutilise les poids et plafonds du Matching V3 sans garantir un futur resultat.",
        ],
    }
