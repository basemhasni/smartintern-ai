"""Deterministic quality analysis for internship offers."""

from __future__ import annotations

import re
from typing import Any

from app.knowledge.skill_taxonomy import get_skill
from app.services.offer_analysis_v2 import analyze_offer_v2
from app.services.skill_extraction_service import canonicalize_skill_list, extract_skills_from_text
from app.utils.text_normalization import deduplicate_strings, normalize_text


GENERIC_TITLES = {
    "stage",
    "stage informatique",
    "stagiaire",
    "developpeur",
    "developpeuse",
    "stage developpeur",
    "stage developpeuse",
    "internship",
    "software intern",
}

SENIORITY_PATTERNS = (
    r"\bsenior\b",
    r"\bexpert(?:e)?\b",
    r"\bconfirme(?:e)?\b",
    r"\blead developer\b",
    r"\btech lead\b",
    r"\barchitecte\b",
    r"\barchitecture complexe\b",
    r"\b(?:4|5|6|7|8|9|10)\s*(?:ans|annees|years)\b",
)

ACTION_MARKERS = (
    "develop",
    "creer",
    "creation",
    "concevoir",
    "implement",
    "maintenir",
    "tester",
    "automatis",
    "particip",
    "collabor",
    "integr",
    "deploy",
    "analyser",
    "document",
    "mission",
    "responsabil",
)

DOMAIN_LABELS = {
    "FULLSTACK": "Developpeur Fullstack",
    "FRONTEND": "Developpeur Frontend",
    "BACKEND": "Developpeur Backend",
    "WEB": "Developpeur Web",
    "MOBILE": "Developpeur Mobile",
    "DEVOPS": "DevOps / Cloud",
    "QA": "QA et automatisation",
    "AI": "Data et IA",
    "DATA": "Data",
    "GENERAL": "Informatique",
}


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _clean(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def _skill_key(value: Any) -> str:
    return normalize_text(str(value or ""))


def _raw_skills(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return deduplicate_strings([item.strip() for item in value if isinstance(item, str) and item.strip()])


def _duplicate_skills(value: Any) -> list[str]:
    seen: set[str] = set()
    duplicates: list[str] = []
    for skill in value if isinstance(value, list) else []:
        if not isinstance(skill, str) or not skill.strip():
            continue
        key = _skill_key(skill)
        if key in seen:
            duplicates.append(skill.strip())
        seen.add(key)
    return deduplicate_strings(duplicates)


def _issue(issue_type: str, severity: str, message: str, impact: str, suggestion: str) -> dict[str, str]:
    return {
        "type": issue_type,
        "severity": severity,
        "message": message,
        "impactOnMatching": impact,
        "suggestion": suggestion,
    }


def _sentences(description: str) -> list[str]:
    return [
        item.strip()
        for item in re.split(r"(?<=[.!?])\s+|\n+|;", description)
        if len(item.strip()) >= 12
    ]


def _missions(description: str) -> list[str]:
    return deduplicate_strings(
        [
            sentence[:260]
            for sentence in _sentences(description)
            if any(marker in normalize_text(sentence) for marker in ACTION_MARKERS)
        ]
    )[:8]


def _is_generic_title(title: str) -> bool:
    normalized = normalize_text(title)
    return not normalized or normalized in GENERIC_TITLES or (
        len(normalized.split()) <= 2
        and not extract_skills_from_text(title)
        and any(token in normalized for token in ("stage", "stagiaire", "developpeur"))
    )


def _is_keyword_list(description: str) -> bool:
    if not description:
        return False
    words = description.split()
    separators = description.count(",") + description.count(";") + description.count("|")
    return len(words) < 35 and separators >= 3 and len(_sentences(description)) <= 1


def _has_senior_expectation(offer_text: str) -> bool:
    normalized = normalize_text(offer_text)
    return any(re.search(pattern, normalized) for pattern in SENIORITY_PATTERNS)


def _category_group(skill: str) -> str:
    definition = get_skill(skill)
    category = definition.category if definition else "Other"
    if category in {"Frontend", "Backend", "Database"}:
        return "WEB"
    if category == "DevOps / Cloud":
        return "DEVOPS"
    if category == "Data / AI":
        return "AI"
    if category == "Testing / QA":
        return "QA"
    return category.upper()


def _technology_inconsistency(title: str, description: str, required: list[str]) -> dict[str, Any]:
    title_skills = canonicalize_skill_list(extract_skills_from_text(title))
    description_skills = canonicalize_skill_list(extract_skills_from_text(description))
    required_keys = {_skill_key(skill) for skill in required}
    title_keys = {_skill_key(skill) for skill in title_skills}
    specific_title_mismatch = bool(title_skills and required and not title_keys & required_keys)

    title_groups = {_category_group(skill) for skill in title_skills}
    description_groups = {_category_group(skill) for skill in description_skills}
    required_groups = {_category_group(skill) for skill in required}
    conflicting_domains = (
        bool(title_groups and description_groups and title_groups.isdisjoint(description_groups))
        or bool(title_groups and required_groups and title_groups.isdisjoint(required_groups))
    )
    return {
        "inconsistent": specific_title_mismatch or conflicting_domains,
        "titleSkills": title_skills,
        "descriptionSkills": description_skills,
        "requiredGroups": sorted(required_groups),
    }


def _offer_context(offer: dict) -> dict:
    title = _clean(offer.get("title"))
    description = _clean(offer.get("description"))
    required_raw = _raw_skills(offer.get("requiredSkills"))
    optional_raw = _raw_skills(offer.get("optionalSkills"))
    required = canonicalize_skill_list(required_raw)
    optional = canonicalize_skill_list(optional_raw)
    overlap_keys = {_skill_key(skill) for skill in required} & {_skill_key(skill) for skill in optional}
    overlap = [skill for skill in required if _skill_key(skill) in overlap_keys]
    detected = canonicalize_skill_list(extract_skills_from_text(f"{title} {description}"))
    missions = _missions(description)

    if title and description:
        base_analysis = analyze_offer_v2(title, description, required_raw, optional_raw)
        domain = _clean(offer.get("domain")) or base_analysis.get("domain") or "GENERAL"
        seniority = base_analysis.get("seniorityExpected") or "UNKNOWN"
    else:
        domain = _clean(offer.get("domain")) or "GENERAL"
        seniority = "UNKNOWN"

    if domain == "WEB":
        categories = {_category_group(skill) for skill in deduplicate_strings(required + optional + detected)}
        definitions = [get_skill(skill) for skill in deduplicate_strings(required + optional + detected)]
        raw_categories = {item.category for item in definitions if item}
        if "Frontend" in raw_categories and "Backend" in raw_categories:
            domain = "FULLSTACK"
        elif "Frontend" in raw_categories:
            domain = "FRONTEND"
        elif "Backend" in raw_categories or "Database" in raw_categories:
            domain = "BACKEND"
        elif "WEB" not in categories:
            domain = "GENERAL"
    optional_groups = {_category_group(skill) for skill in optional}
    if not required and not detected and len(optional_groups) >= 2:
        domain = "GENERAL"

    return {
        "title": title,
        "description": description,
        "requiredRaw": required_raw,
        "optionalRaw": optional_raw,
        "requiredSkills": required,
        "optionalSkills": optional,
        "detectedSkills": detected,
        "overlap": overlap,
        "duplicateRequired": _duplicate_skills(offer.get("requiredSkills")),
        "duplicateOptional": _duplicate_skills(offer.get("optionalSkills")),
        "missions": missions,
        "domain": domain,
        "seniorityExpected": seniority,
        "technologyConsistency": _technology_inconsistency(title, description, required),
        "hasSeniorExpectation": _has_senior_expectation(f"{title} {description}"),
        "genericTitle": _is_generic_title(title),
        "keywordList": _is_keyword_list(description),
        "location": _clean(offer.get("location")),
        "duration": _clean(offer.get("duration")),
        "companyName": _clean(offer.get("companyName")),
    }


def _evaluate_offer_completeness_context(context: dict) -> dict:
    score = 0
    issues: list[dict] = []
    title = context["title"]
    description = context["description"]
    missions = context["missions"]

    if title:
        score += 2 if context["genericTitle"] else 4
    if len(description) >= 300:
        score += 9
    elif len(description) >= 150:
        score += 8
    elif len(description) >= 80:
        score += 5
    elif description:
        score += 2
    if len(missions) >= 2:
        score += 5
    elif missions:
        score += 3
    if context["location"]:
        score += 2
    if context["duration"]:
        score += 3
    if context["companyName"]:
        score += 2

    if len(description) < 150:
        issues.append(
            _issue(
                "DESCRIPTION_TOO_SHORT",
                "HIGH" if len(description) < 60 else "MEDIUM",
                "La description est trop courte pour presenter clairement le contexte et les missions.",
                "Le moteur dispose de trop peu de contexte pour distinguer les priorites techniques et les responsabilites.",
                "Ajoutez le contexte du stage, 2 a 4 missions concretes et les resultats attendus.",
            )
        )
    if not missions:
        issues.append(
            _issue(
                "UNCLEAR_MISSIONS",
                "MEDIUM",
                "Aucune mission concrete n'est clairement identifiable.",
                "Les competences detectees ne peuvent pas etre reliees a des activites professionnelles precises.",
                "Decrivez les actions du stagiaire avec des verbes comme developper, tester, integrer ou documenter.",
            )
        )
    if not context["duration"]:
        issues.append(
            _issue(
                "MISSING_DURATION",
                "LOW",
                "La duree du stage n'est pas renseignee.",
                "La duree ne change pas directement le score technique, mais elle aide a evaluer le realisme des missions.",
                "Ajoutez une duree indicative, par exemple 4 a 6 mois.",
            )
        )
    if not context["location"]:
        issues.append(
            _issue(
                "MISSING_LOCATION",
                "LOW",
                "La localisation ou le mode de travail n'est pas precise.",
                "Le matching geographique et les attentes du candidat restent moins clairs.",
                "Indiquez la ville et, si pertinent, le mode presentiel, hybride ou a distance.",
            )
        )
    return {"score": min(25, score), "maxScore": 25, "issues": issues, "context": context}


def evaluate_offer_completeness(offer: dict) -> dict:
    return _evaluate_offer_completeness_context(_offer_context(offer))


def _evaluate_skill_clarity_context(context: dict) -> dict:
    required = context["requiredSkills"]
    optional = context["optionalSkills"]
    overlap = context["overlap"]
    duplicates = context["duplicateRequired"] + context["duplicateOptional"]
    score = 0
    issues: list[dict] = []

    if len(required) >= 3:
        score += 12
    elif required:
        score += 8
    if 1 <= len(required) <= 6:
        score += 6
    elif len(required) <= 8 and required:
        score += 4
    elif len(required) > 8:
        score += 1
    score += 3 if optional else 2
    if not overlap:
        score += 4
    if not duplicates:
        score += 3
    if all(get_skill(skill) for skill in required + optional):
        score += 2

    if not required:
        issues.append(
            _issue(
                "MISSING_REQUIRED_SKILLS",
                "HIGH",
                "Les competences obligatoires ne sont pas clairement definies.",
                "Le matching risque d'etre moins precis car l'IA ne sait pas quelles competences sont prioritaires.",
                "Ajoutez idealement 3 a 5 competences obligatoires reellement necessaires.",
            )
        )
    if not optional:
        issues.append(
            _issue(
                "MISSING_OPTIONAL_SKILLS",
                "LOW",
                "Aucune competence optionnelle n'est distinguee.",
                "Le moteur ne peut pas separer les pre-requis des competences qui apportent seulement un bonus.",
                "Ajoutez uniquement les competences appreciees mais non indispensables, si elles existent.",
            )
        )
    if len(required) > 8:
        issues.append(
            _issue(
                "TOO_MANY_REQUIRED_SKILLS",
                "HIGH" if len(required) > 12 else "MEDIUM",
                f"{len(required)} competences obligatoires sont demandees, ce qui est eleve pour un stage.",
                "Trop d'exigences obligatoires reduisent artificiellement les scores et peuvent masquer les competences essentielles.",
                "Gardez 4 a 6 competences centrales et deplacez les autres en optionnel si elles ne sont pas indispensables.",
            )
        )
    if overlap:
        issues.append(
            _issue(
                "REQUIRED_OPTIONAL_OVERLAP",
                "MEDIUM",
                f"Certaines competences sont a la fois obligatoires et optionnelles : {', '.join(overlap)}.",
                "Le moteur recoit deux niveaux de priorite contradictoires pour une meme competence.",
                "Classez chaque competence dans une seule categorie.",
            )
        )
    if duplicates:
        issues.append(
            _issue(
                "DUPLICATE_SKILLS",
                "LOW",
                f"Des competences sont dupliquees : {', '.join(deduplicate_strings(duplicates))}.",
                "Les doublons ajoutent du bruit sans ameliorer la precision.",
                "Conservez une seule occurrence de chaque competence.",
            )
        )
    return {"score": min(30, score), "maxScore": 30, "issues": issues, "context": context}


def evaluate_skill_clarity(offer: dict) -> dict:
    return _evaluate_skill_clarity_context(_offer_context(offer))


def _evaluate_seniority_consistency_context(context: dict) -> dict:
    total_skills = len(deduplicate_strings(context["requiredSkills"] + context["optionalSkills"]))
    score = 0
    issues: list[dict] = []
    if not context["hasSeniorExpectation"]:
        score += 8
    if total_skills <= 8:
        score += 4
    elif total_skills <= 12:
        score += 2
    if context["missions"] and len(context["missions"]) <= 6:
        score += 3
    elif not context["missions"]:
        score += 1

    if context["hasSeniorExpectation"]:
        issues.append(
            _issue(
                "SENIORITY_TOO_HIGH_FOR_INTERNSHIP",
                "HIGH",
                "Le niveau demande contient des attentes senior ou plusieurs annees d'experience.",
                "Un stage avec des attentes trop elevees produit peu de correspondances credibles et penalise les profils juniors.",
                "Reformulez les attentes autour de bases solides, de capacite d'apprentissage et d'accompagnement.",
            )
        )
    if total_skills > 12:
        issues.append(
            _issue(
                "STAGE_SCOPE_TOO_BROAD",
                "MEDIUM",
                "Le perimetre technologique est tres large pour une seule experience de stage.",
                "Le matching peut favoriser des listes de mots-cles plutot qu'un profil coherent.",
                "Recentrez l'offre sur un domaine principal et quelques outils complementaires.",
            )
        )
    return {"score": min(15, score), "maxScore": 15, "issues": issues, "context": context}


def evaluate_seniority_consistency(offer: dict) -> dict:
    return _evaluate_seniority_consistency_context(_offer_context(offer))


def _evaluate_matching_readiness_context(context: dict) -> dict:
    score = 0
    issues: list[dict] = []
    if context["requiredSkills"]:
        score += 8
    if context["domain"] not in {"", "GENERAL", "UNKNOWN"}:
        score += 4
    if context["missions"]:
        score += 4
    if context["requiredSkills"] and (extract_skills_from_text(context["title"]) or len(context["requiredSkills"]) <= 6):
        score += 2
    if len(context["description"]) >= 150:
        score += 2

    if context["domain"] in {"", "GENERAL", "UNKNOWN"}:
        issues.append(
            _issue(
                "UNCLEAR_DOMAIN",
                "MEDIUM",
                "Le domaine technique principal est difficile a identifier.",
                "Les candidats comparables et les familles de competences sont moins bien delimites.",
                "Precisez le domaine dans le titre et les missions : frontend, backend, mobile, QA, DevOps, data ou IA.",
            )
        )
    if context["technologyConsistency"]["inconsistent"]:
        issues.append(
            _issue(
                "TECHNOLOGY_INCONSISTENCY",
                "HIGH",
                "Le titre, la description et les competences obligatoires ne decrivent pas clairement la meme orientation technique.",
                "Le moteur peut construire des exigences contradictoires et produire un score difficile a justifier.",
                "Alignez le titre, les missions et les competences obligatoires sur une stack ou un domaine principal.",
            )
        )
        score = max(0, score - 5)
    return {"score": min(20, score), "maxScore": 20, "issues": issues, "context": context}


def evaluate_matching_readiness(offer: dict) -> dict:
    return _evaluate_matching_readiness_context(_offer_context(offer))


def _evaluate_writing_quality_context(context: dict) -> dict:
    description = context["description"]
    score = 0
    if len(description) >= 150:
        score += 4
    elif len(description) >= 80:
        score += 2
    sentence_count = len(_sentences(description))
    if sentence_count >= 3:
        score += 3
    elif sentence_count >= 1:
        score += 1
    if not context["keywordList"] and len(description.split()) >= 20:
        score += 3
    elif not context["keywordList"]:
        score += 1
    return {"score": min(10, score), "maxScore": 10, "issues": [], "context": context}


def evaluate_stage_realism(offer: dict) -> dict:
    return evaluate_seniority_consistency(offer)


def _quality_level(score: int) -> str:
    if score >= 85:
        return "EXCELLENT"
    if score >= 70:
        return "GOOD"
    if score >= 50:
        return "MEDIUM"
    if score >= 30:
        return "LOW"
    return "VERY_LOW"


def _legacy_quality(level: str) -> str:
    if level in {"EXCELLENT", "GOOD"}:
        return "GOOD"
    if level == "MEDIUM":
        return "MEDIUM"
    return "LOW"


def _matching_readiness(score: int, readiness_score: int, issues: list[dict], context: dict) -> str:
    if not context["title"] and not context["description"]:
        return "INSUFFICIENT"
    if not context["requiredSkills"]:
        return "LOW"
    high_issues = [item for item in issues if item["severity"] == "HIGH"]
    if score >= 80 and readiness_score >= 16 and not high_issues and not context["genericTitle"]:
        return "HIGH"
    if score >= 50 and readiness_score >= 10:
        return "MEDIUM"
    return "LOW"


def generate_offer_improvement_suggestions(offer: dict, analysis: dict) -> list[str]:
    suggestions = [item["suggestion"] for item in _as_list(analysis.get("issues"))]
    return deduplicate_strings(suggestions)[:10]


def _improved_title(context: dict) -> str:
    if not context["genericTitle"]:
        return context["title"]
    skills = deduplicate_strings(context["requiredSkills"] + context["detectedSkills"])
    role = DOMAIN_LABELS.get(context["domain"], "Informatique")
    suffix = " ".join(skills[:2])
    return f"Stage {role}{f' {suffix}' if suffix else ''}".strip()


def generate_improved_offer_draft(offer: dict, analysis: dict) -> dict:
    context = _as_dict(analysis.get("context")) or _offer_context(offer)
    required = deduplicate_strings(context["requiredSkills"])
    optional = [
        skill
        for skill in deduplicate_strings(context["optionalSkills"])
        if _skill_key(skill) not in {_skill_key(item) for item in required}
    ]
    if len(required) > 8:
        moved = required[6:]
        required = required[:6]
        optional = deduplicate_strings(optional + moved)
    if not required:
        detected_from_content = canonicalize_skill_list(
            extract_skills_from_text(f"{context['title']} {context['description']}")
        )
        required = detected_from_content[:5]
        optional = [
            skill for skill in optional if _skill_key(skill) not in {_skill_key(item) for item in required}
        ]

    missions = context["missions"] or [
        "A completer : decrire 2 a 4 missions concretes confiees au stagiaire.",
        "A completer : preciser les livrables ou resultats attendus pendant le stage.",
    ]
    description = context["description"]
    if len(description) < 150:
        skill_sentence = (
            f" Les competences centrales identifiees sont {', '.join(required)}."
            if required
            else " Les competences obligatoires restent a preciser."
        )
        description = (
            f"{description}{skill_sentence} "
            "Completez cette description avec le contexte du projet, les missions concretes, "
            "l'accompagnement propose et les resultats attendus."
        ).strip()

    profile_sought = (
        f"Etudiant disposant de bases en {', '.join(required)} et capable d'expliquer des projets concrets."
        if required
        else "A completer : preciser les bases techniques attendues sans exiger un niveau senior."
    )
    notes = [
        "Conserver uniquement les competences indispensables dans requiredSkills.",
        "Relier chaque competence obligatoire a au moins une mission.",
        "Utiliser optionalSkills pour les bonus qui ne doivent pas penaliser le matching.",
    ]
    if not context["location"]:
        notes.append("Completer la localisation ou le mode de travail.")
    if not context["duration"]:
        notes.append("Completer la duree indicative du stage.")
    return {
        "title": _improved_title(context),
        "description": description,
        "missions": missions,
        "requiredSkills": required,
        "optionalSkills": optional,
        "profileSought": profile_sought,
        "matchingNotes": notes,
    }


def build_offer_quality_decision_trace(offer: dict, analysis: dict) -> list[dict]:
    dimensions = _as_dict(analysis.get("dimensionScores"))
    context = _as_dict(analysis.get("context"))
    issues = _as_list(analysis.get("issues"))
    high_count = sum(1 for item in issues if item.get("severity") == "HIGH")
    return [
        {
            "step": "COMPLETENESS_CHECK",
            "title": "Verification de la completude",
            "status": "SUCCESS",
            "summary": f"Completude : {dimensions.get('completeness', 0)}/25. {len(context.get('missions', []))} mission(s) identifiable(s).",
            "details": [item["message"] for item in issues if item["type"] in {"DESCRIPTION_TOO_SHORT", "UNCLEAR_MISSIONS", "MISSING_DURATION", "MISSING_LOCATION"}],
        },
        {
            "step": "SKILL_CLARITY_CHECK",
            "title": "Analyse des competences",
            "status": "SUCCESS",
            "summary": f"Clarte des competences : {dimensions.get('skillClarity', 0)}/30 avec {len(context.get('requiredSkills', []))} exigence(s) obligatoire(s).",
            "details": [item["message"] for item in issues if item["type"] in {"MISSING_REQUIRED_SKILLS", "TOO_MANY_REQUIRED_SKILLS", "REQUIRED_OPTIONAL_OVERLAP", "DUPLICATE_SKILLS"}],
        },
        {
            "step": "INTERNSHIP_REALISM_CHECK",
            "title": "Coherence avec un stage",
            "status": "SUCCESS" if not context.get("hasSeniorExpectation") else "WARNING",
            "summary": f"Realisme du stage : {dimensions.get('stageRealism', 0)}/15.",
            "details": [item["message"] for item in issues if item["type"] in {"SENIORITY_TOO_HIGH_FOR_INTERNSHIP", "STAGE_SCOPE_TOO_BROAD"}],
        },
        {
            "step": "MATCHING_READINESS_CHECK",
            "title": "Preparation au matching",
            "status": "WARNING" if analysis.get("matchingReadiness") in {"LOW", "INSUFFICIENT"} else "SUCCESS",
            "summary": f"Preparation au matching : {analysis.get('matchingReadiness')} ({dimensions.get('matchingReadiness', 0)}/20).",
            "details": [item["message"] for item in issues if item["type"] in {"UNCLEAR_DOMAIN", "TECHNOLOGY_INCONSISTENCY", "MATCHING_LOW_READINESS"}],
        },
        {
            "step": "QUALITY_SCORE",
            "title": "Synthese de qualite",
            "status": "WARNING" if high_count else "SUCCESS",
            "summary": f"Score final : {analysis.get('qualityScore')}/100, niveau {analysis.get('qualityLevel')}.",
            "details": [f"{high_count} probleme(s) de severite elevee detecte(s)."],
        },
    ]


def analyze_offer_quality(offer: Any) -> dict:
    payload = _as_dict(offer)
    context = _offer_context(payload)
    completeness = _evaluate_offer_completeness_context(context)
    skill_clarity = _evaluate_skill_clarity_context(context)
    realism = _evaluate_seniority_consistency_context(context)
    readiness = _evaluate_matching_readiness_context(context)
    writing = _evaluate_writing_quality_context(context)
    issues = []
    for dimension in (completeness, skill_clarity, realism, readiness, writing):
        issues.extend(dimension["issues"])
    if context["genericTitle"]:
        issues.append(
            _issue(
                "GENERIC_TITLE",
                "MEDIUM",
                "Le titre est trop generique pour identifier le metier ou la stack.",
                "Le matching et la recherche d'offres disposent de moins de signaux sur le poste cible.",
                "Precisez le role et une ou deux technologies centrales dans le titre.",
            )
        )

    score = sum(item["score"] for item in (completeness, skill_clarity, realism, readiness, writing))
    if not context["requiredSkills"]:
        score = min(score, 49)
    if len(context["description"]) < 60 and not context["requiredSkills"]:
        score = min(score, 29)
    if context["technologyConsistency"]["inconsistent"]:
        score = min(score, 59)
    if context["hasSeniorExpectation"]:
        score = min(score, 69)
    if context["genericTitle"]:
        score = min(score, 84)
    if not context["title"] and not context["description"]:
        score = min(score, 20)
    score = max(0, min(100, round(score)))
    level = _quality_level(score)
    matching_readiness = _matching_readiness(score, readiness["score"], issues, context)
    if matching_readiness in {"LOW", "INSUFFICIENT"}:
        issues.append(
            _issue(
                "MATCHING_LOW_READINESS",
                "HIGH" if matching_readiness == "INSUFFICIENT" else "MEDIUM",
                "L'offre n'est pas encore suffisamment structuree pour un matching precis.",
                "La confiance du Matching V3 sera limitee tant que les priorites et les missions restent ambigues.",
                "Corrigez d'abord les problemes de competences obligatoires, de domaine et de missions.",
            )
        )

    dimension_scores = {
        "completeness": completeness["score"],
        "skillClarity": skill_clarity["score"],
        "stageRealism": realism["score"],
        "matchingReadiness": readiness["score"],
        "writingQuality": writing["score"],
    }
    strengths = []
    if completeness["score"] >= 20:
        strengths.append("L'offre contient un contexte et des missions suffisamment detailles.")
    if skill_clarity["score"] >= 24:
        strengths.append("Les competences obligatoires et optionnelles sont clairement separees.")
    if realism["score"] >= 12:
        strengths.append("Les attentes restent globalement realistes pour une experience de stage.")
    if readiness["score"] >= 16:
        strengths.append("La structure est directement exploitable par Matching V3.")
    if writing["score"] >= 8:
        strengths.append("La description est lisible et ne se limite pas a une liste de mots-cles.")

    partial = {
        "qualityScore": score,
        "qualityLevel": level,
        "quality": _legacy_quality(level),
        "matchingReadiness": matching_readiness,
        "summary": (
            f"Qualite {level.lower()} ({score}/100). "
            f"Preparation au matching : {matching_readiness.lower()}. "
            f"{len(issues)} point(s) d'amelioration detecte(s)."
        ),
        "dimensionScores": dimension_scores,
        "strengths": strengths,
        "issues": issues,
        "recommendations": [],
        "improvedOfferDraft": {},
        "decisionTrace": [],
        "warnings": [],
        "context": context,
    }
    partial["recommendations"] = generate_offer_improvement_suggestions(payload, partial)
    partial["improvedOfferDraft"] = generate_improved_offer_draft(payload, partial)
    partial["decisionTrace"] = build_offer_quality_decision_trace(payload, partial)
    if matching_readiness == "INSUFFICIENT":
        partial["warnings"].append("Les donnees sont insuffisantes pour proposer une version fortement personnalisee.")
    return partial
