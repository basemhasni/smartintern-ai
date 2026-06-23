"""Evidence-based Career Assistant V2 built on Hybrid Matching V3 results."""

from __future__ import annotations

from typing import Any

from app.utils.text_normalization import deduplicate_strings, normalize_text


READINESS_LEVELS = {
    "READY",
    "ALMOST_READY",
    "NEEDS_TARGETED_WORK",
    "NEEDS_MAJOR_WORK",
    "INSUFFICIENT_DATA",
}


def _as_dict(value: Any) -> dict:
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _skill_key(value: str) -> str:
    return normalize_text(value).replace(" ", "")


def _unique_skills(values: list[Any]) -> list[str]:
    return deduplicate_strings([value.strip() for value in values if isinstance(value, str) and value.strip()])


def detect_question_intent(question: str | None) -> str:
    normalized = normalize_text(question or "")
    if not normalized:
        return "FULL_ANALYSIS"
    if any(token in normalized for token in ("projet", "portfolio", "realiser", "construire")):
        return "PROJECT_IDEAS"
    if any(token in normalized for token in ("cv", "curriculum", "presenter mon profil")):
        return "CV_IMPROVEMENT"
    if any(token in normalized for token in ("entretien", "interview", "recruteur", "question technique")):
        return "INTERVIEW_PREP"
    if any(token in normalized for token in ("point fort", "points forts", "force", "atout", "deja couvert", "maitrise")):
        return "STRENGTHS"
    if any(token in normalized for token in ("plan", "roadmap", "progression", "combien de temps", "delai", "semaine", "apprendre")):
        return "LEARNING_PLAN"
    if any(token in normalized for token in ("suis je pret", "postuler", "compatibilite", "pourquoi ce score", "mon score", "mes chances", "proche de l offre")):
        return "READINESS"
    if any(token in normalized for token in ("competence", "ameliorer", "manque", "priorite", "ecart")):
        return "SKILL_GAPS"
    return "CUSTOM_QUESTION"


def _find_question_requirement(question: str | None, matching_result: dict) -> dict | None:
    normalized_question = normalize_text(question or "")
    matrix = _as_list(_as_dict(_as_dict(matching_result).get("v3")).get("coverageMatrix"))
    candidates = sorted(
        [row for row in matrix if isinstance(row, dict) and row.get("requirement")],
        key=lambda row: len(str(row["requirement"])),
        reverse=True,
    )
    for row in candidates:
        requirement = normalize_text(str(row["requirement"]))
        compact = requirement.replace(" ", "")
        if requirement in normalized_question or compact in normalized_question.replace(" ", ""):
            return row
    return None


def _build_analysis_summary(matching_result: dict, readiness: str) -> dict:
    matching = _as_dict(matching_result)
    v3 = _as_dict(matching.get("v3"))
    matrix = _as_list(v3.get("coverageMatrix"))
    critical = [row for row in matrix if row.get("importance") == "CRITICAL"]
    required = [row for row in matrix if row.get("importance") in {"CRITICAL", "REQUIRED"}]
    optional = [row for row in matrix if row.get("importance") == "OPTIONAL"]
    covered = lambda rows: sum(1 for row in rows if float(row.get("coverage") or 0) >= 0.75)
    partial = sum(1 for row in matrix if 0 < float(row.get("coverage") or 0) < 0.75)
    evidence = _as_dict(v3.get("evidenceSummary"))
    return {
        "readinessLevel": readiness,
        "score": int(matching.get("score") or 0),
        "confidence": matching.get("confidence") or "LOW",
        "decisionLabel": matching.get("decisionLabel") or "INSUFFICIENT_DATA",
        "criticalCoverage": {"covered": covered(critical), "total": len(critical)},
        "requiredCoverage": {"covered": covered(required), "total": len(required)},
        "optionalCoverage": {"covered": covered(optional), "total": len(optional)},
        "partialCoverageCount": partial,
        "evidenceSummary": {
            "strong": int(evidence.get("strongEvidenceCount") or 0),
            "weak": int(evidence.get("weakEvidenceCount") or 0),
            "missing": int(evidence.get("missingEvidenceCount") or 0),
        },
        "scoreBreakdown": _as_dict(v3.get("scoreBreakdown")),
        "domainAlignment": _as_dict(v3.get("domainAlignment")),
        "semanticMethod": v3.get("semanticMethod") or "unknown",
    }


def determine_readiness_level(matching_result: dict) -> str:
    matching = _as_dict(matching_result)
    v3 = _as_dict(matching.get("v3"))
    matrix = _as_list(v3.get("coverageMatrix"))
    confidence = str(matching.get("confidence") or "LOW").upper()
    decision = str(matching.get("decisionLabel") or "").upper()
    score = int(matching.get("score") or 0)
    critical = _unique_skills(v3.get("criticalMissingSkills") or [])
    required = _unique_skills(v3.get("missingRequiredSkills") or matching.get("missingSkills") or [])
    evidence = _as_dict(v3.get("evidenceSummary"))
    strong_evidence = int(evidence.get("strongEvidenceCount") or 0)

    if confidence == "LOW" or decision == "INSUFFICIENT_DATA" or not matrix:
        return "INSUFFICIENT_DATA"
    if score >= 85 and confidence in {"HIGH", "MEDIUM"} and not critical:
        return "READY"
    if score >= 70 and not critical and len(required) <= 2:
        return "ALMOST_READY"
    if score < 50 or len(critical) >= 2:
        return "NEEDS_MAJOR_WORK"
    if score >= 50 or strong_evidence > 0:
        return "NEEDS_TARGETED_WORK"
    return "NEEDS_MAJOR_WORK"


def _gap_reason(skill: str, gap_type: str, row: dict | None) -> str:
    evidence = _as_list((row or {}).get("evidence"))
    if gap_type == "CRITICAL":
        return f"{skill} est critique pour cette offre et aucune couverture suffisante n'a ete detectee."
    if gap_type == "REQUIRED":
        return f"{skill} est obligatoire dans l'offre, mais aucune preuve fiable n'apparait dans le CV."
    if gap_type == "PARTIAL":
        return f"Un signal partiel existe pour {skill}, sans preuve assez forte pour confirmer son utilisation."
    if gap_type == "EVIDENCE_WEAK" or not evidence:
        return f"{skill} est mentionnee, mais sa mise en pratique n'est pas suffisamment documentee."
    return f"{skill} est optionnelle et pourrait renforcer la candidature apres les priorites obligatoires."


def _actions_for_gap(skill: str, gap_type: str) -> list[str]:
    if gap_type == "EVIDENCE_WEAK":
        return [
            f"Identifier une realisation reelle utilisant {skill}.",
            "Ajouter au CV le contexte, l'action realisee et le resultat obtenu.",
        ]
    return [
        f"Etudier les fondamentaux directement utiles de {skill}.",
        f"Mettre {skill} en pratique dans un mini-projet cible.",
        "Documenter la realisation dans le CV ou le portfolio sans exagerer le niveau acquis.",
    ]


def prioritize_skill_gaps(matching_result: dict) -> list[dict]:
    matching = _as_dict(matching_result)
    v3 = _as_dict(matching.get("v3"))
    explainability = _as_dict(matching.get("explainability"))
    skill_evidence = _as_dict(explainability.get("skillEvidenceMap"))
    matrix = _as_list(v3.get("coverageMatrix"))
    rows = {_skill_key(str(row.get("requirement", ""))): row for row in matrix if isinstance(row, dict)}
    critical = _unique_skills(v3.get("criticalMissingSkills") or [])
    required = _unique_skills(v3.get("missingRequiredSkills") or matching.get("missingSkills") or [])
    optional = _unique_skills(v3.get("missingOptionalSkills") or [])
    partial = []
    for item in _as_list(v3.get("partialMatchedSkills")):
        if isinstance(item, str):
            partial.append(item)
        elif isinstance(item, dict):
            partial.append(item.get("skill") or item.get("requirement"))
    partial = _unique_skills(partial)

    gaps: list[dict] = []
    seen: set[str] = set()

    def add(skill: str, gap_type: str, priority: str, impact: str) -> None:
        key = _skill_key(skill)
        if not key or key in seen:
            return
        seen.add(key)
        row = rows.get(key)
        gaps.append(
            {
                "skill": skill,
                "priority": priority,
                "gapType": gap_type,
                "reason": _gap_reason(skill, gap_type, row),
                "impactOnMatching": impact,
                "currentEvidence": _as_list((row or {}).get("evidence"))[:2],
                "suggestedActions": _actions_for_gap(skill, gap_type),
            }
        )

    for skill in critical:
        add(skill, "CRITICAL", "HIGH", "Impact fort: son absence limite directement la compatibilite maximale.")
    for skill in required:
        add(skill, "REQUIRED", "HIGH" if len(gaps) < 2 else "MEDIUM", "Impact important sur la couverture des exigences obligatoires.")
    for skill in partial:
        add(skill, "PARTIAL", "MEDIUM", "Une preuve plus directe peut transformer cette couverture partielle en point fort.")

    for row in matrix:
        if not isinstance(row, dict) or row.get("coverage", 0) < 0.75 or row.get("evidence"):
            continue
        add(str(row.get("requirement", "")), "EVIDENCE_WEAK", "MEDIUM", "Le skill est reconnu, mais la qualite de preuve limite la confiance.")
    for skill, evidence in skill_evidence.items():
        if _as_dict(evidence).get("evidenceLevel") == "WEAK" and _skill_key(skill) in rows:
            add(str(skill), "EVIDENCE_WEAK", "MEDIUM", "La competence apparait, mais la preuve reste trop faible pour soutenir fortement le dossier.")
    for skill in optional:
        add(skill, "OPTIONAL", "LOW", "Bonus modere apres traitement des lacunes critiques et obligatoires.")
    return gaps[:5]


def build_evidence_based_strengths(matching_result: dict) -> list[dict]:
    matching = _as_dict(matching_result)
    matrix = _as_list(_as_dict(matching.get("v3")).get("coverageMatrix"))
    skill_evidence = _as_dict(_as_dict(matching.get("explainability")).get("skillEvidenceMap"))
    strengths = []
    for row in matrix:
        if not isinstance(row, dict) or float(row.get("coverage") or 0) < 0.75:
            continue
        evidence_detail = _as_dict(skill_evidence.get(row.get("requirement")))
        if evidence_detail:
            level_map = {"STRONG": "STRONG_EVIDENCE", "MEDIUM": "MEDIUM_EVIDENCE", "WEAK": "WEAK_EVIDENCE"}
            level = level_map.get(evidence_detail.get("evidenceLevel"), "WEAK_EVIDENCE")
            statement = evidence_detail.get("reason") or f"{row['requirement']} dispose d'une preuve analysee."
            strengths.append(
                {
                    "skill": row["requirement"],
                    "evidenceLevel": level,
                    "statement": statement,
                    "evidence": _as_list(evidence_detail.get("evidenceSnippets"))[:2],
                }
            )
            continue
        evidence = _as_list(row.get("evidence"))
        confidence = float(row.get("confidence") or 0)
        evidence_type = str(row.get("evidenceType") or "UNKNOWN")
        if evidence and confidence >= 0.85 and evidence_type in {"PROJECT", "EXPERIENCE"}:
            level = "STRONG_EVIDENCE"
            statement = f"{row['requirement']} est soutenue par une utilisation explicite dans un projet ou une experience."
        elif evidence:
            level = "MEDIUM_EVIDENCE"
            statement = f"{row['requirement']} est couverte par une preuve exploitable, qui gagnerait a etre quantifiee."
        else:
            level = "WEAK_EVIDENCE"
            statement = f"{row['requirement']} est detectee, mais seulement comme mention sans realisation associee."
        strengths.append({"skill": row["requirement"], "evidenceLevel": level, "statement": statement, "evidence": evidence[:2]})
    return strengths


def _project_template(skills: list[str], domain: str) -> dict:
    keys = {_skill_key(skill) for skill in skills}
    if keys & {_skill_key("Docker"), _skill_key("CI/CD"), _skill_key("GitHub Actions"), _skill_key("Kubernetes")}:
        return {
            "title": "Industrialiser et deployer une application existante",
            "description": "Dockeriser une API et sa base de donnees, puis automatiser verification et build avec un pipeline simple.",
            "deliverables": ["Dockerfile et docker-compose", "Pipeline CI documente", "Guide de lancement reproductible"],
        }
    if keys & {_skill_key("React"), _skill_key("Angular"), _skill_key("Vue"), _skill_key("TypeScript")}:
        return {
            "title": "Construire une interface metier connectee a une API",
            "description": "Realiser une interface avec formulaire, filtres, pagination, etats de chargement et gestion des erreurs.",
            "deliverables": ["Interface responsive", "Integration API REST", "README avec captures et choix techniques"],
        }
    if keys & {_skill_key("PostgreSQL"), _skill_key("MySQL"), _skill_key("SQL"), _skill_key("Prisma")}:
        return {
            "title": "Modeliser un mini-systeme de candidatures",
            "description": "Concevoir les relations, migrations et requetes d'un petit workflow d'offres et de candidatures.",
            "deliverables": ["Schema de donnees", "Jeu de migrations", "Requetes et tests de coherence"],
        }
    if keys & {_skill_key("Postman"), _skill_key("Selenium"), _skill_key("Playwright"), _skill_key("Cypress")} or domain == "QA":
        return {
            "title": "Creer une strategie de tests reproductible",
            "description": "Tester un parcours API ou web avec cas nominaux, erreurs et rapport d'execution.",
            "deliverables": ["Collection ou suite automatisee", "Donnees de test", "Rapport court des scenarios couverts"],
        }
    return {
        "title": f"Mini-projet cible autour de {', '.join(skills[:2])}",
        "description": "Construire une demonstration limitee mais terminee qui prouve l'utilisation des competences prioritaires.",
        "deliverables": ["Code source fonctionnel", "README de lancement", "Courte demonstration du resultat"],
    }


def generate_recommended_projects(skill_gaps: list[dict], offer_domain: str) -> list[dict]:
    actionable = [gap for gap in skill_gaps if gap.get("gapType") != "EVIDENCE_WEAK"]
    if not actionable:
        return []
    projects = []
    groups: list[list[str]] = []
    high = [gap["skill"] for gap in actionable if gap.get("priority") == "HIGH"]
    medium = [gap["skill"] for gap in actionable if gap.get("priority") == "MEDIUM"]
    low = [gap["skill"] for gap in actionable if gap.get("priority") == "LOW"]
    if high:
        groups.append(high[:2])
    if medium:
        groups.append(medium[:2])
    if not groups and low:
        groups.append(low[:2])
    for skills in groups[:3]:
        template = _project_template(skills, offer_domain)
        projects.append(
            {
                **template,
                "skillsCovered": skills,
                "difficulty": "INTERMEDIATE" if len(skills) > 1 else "BEGINNER",
                "estimatedTime": "1-2 semaines" if len(skills) > 1 else "2-4 jours",
                "portfolioValue": "Apporte une preuve concrete et verifiable, sans garantir une decision de recrutement.",
            }
        )
    return projects


def build_learning_roadmap(skill_gaps: list[dict], readiness_level: str) -> list[dict]:
    if readiness_level == "INSUFFICIENT_DATA":
        return [{"period": "Prochaine etape", "objective": "Enrichir les donnees du profil", "actions": ["Ajouter les technologies aux projets reellement realises.", "Selectionner une offre dont les exigences sont explicites."], "targetSkills": [], "expectedOutcome": "Obtenir une analyse fondee sur des preuves suffisantes."}]
    if readiness_level == "READY":
        return [{"period": "1-2 jours", "objective": "Preparer les preuves pour l'entretien", "actions": ["Choisir deux projets pertinents.", "Preparer pour chacun contexte, contribution et resultat."], "targetSkills": [], "expectedOutcome": "Presenter clairement les competences deja couvertes."}]

    selected = skill_gaps[:2] if readiness_level == "ALMOST_READY" else skill_gaps[:3]
    roadmap = []
    periods = ["Jour 1-3", "Jour 4-7"] if readiness_level == "ALMOST_READY" else ["Semaine 1", "Semaine 2", "Semaine 3"]
    for index, gap in enumerate(selected):
        roadmap.append({"period": periods[min(index, len(periods) - 1)], "objective": f"Renforcer {gap['skill']}", "actions": gap["suggestedActions"][:2], "targetSkills": [gap["skill"]], "expectedOutcome": f"Produire une preuve concrete et explicable concernant {gap['skill']}."})
    if not roadmap:
        roadmap.append({"period": "Cette semaine", "objective": "Consolider les preuves existantes", "actions": ["Documenter un projet pertinent.", "Relier chaque competence a une realisation reelle."], "targetSkills": [], "expectedOutcome": "Rendre le CV plus precis pour cette offre."})
    return roadmap


def generate_cv_improvement_tips(matching_result: dict) -> list[str]:
    matching = _as_dict(matching_result)
    strengths = build_evidence_based_strengths(matching)
    gaps = prioritize_skill_gaps(matching)
    tips = []
    for item in strengths:
        if item["evidenceLevel"] == "WEAK_EVIDENCE":
            tips.append(f"Pour {item['skill']}, ajoutez une realisation reelle, votre contribution et le resultat obtenu si vous disposez de cette experience.")
    for gap in gaps[:3]:
        if gap["gapType"] in {"CRITICAL", "REQUIRED", "PARTIAL"}:
            tips.append(f"Ne mentionnez {gap['skill']} comme competence acquise qu'apres une utilisation reelle; vous pouvez indiquer une formation en cours de facon explicite.")
    if not tips:
        tips.append("Reliez les technologies deja presentes a des projets precis, avec contexte, actions et resultats mesurables lorsque disponibles.")
    tips.append("Conservez uniquement des competences que vous pouvez expliquer et illustrer honnetement en entretien.")
    return deduplicate_strings(tips)[:5]


def generate_interview_preparation_tips(matching_result: dict) -> list[dict]:
    strengths = build_evidence_based_strengths(matching_result)
    gaps = prioritize_skill_gaps(matching_result)
    tips = []
    for item in strengths[:3]:
        tips.append({"topic": item["skill"], "tip": f"Preparez un exemple precis montrant comment vous avez utilise {item['skill']}, les choix effectues et le resultat.", "basedOn": "matched skill"})
    for gap in gaps[:2]:
        tips.append({"topic": gap["skill"], "tip": f"Si {gap['skill']} est abordee, expliquez honnetement votre niveau actuel et la demarche concrete engagee pour progresser.", "basedOn": "weak evidence" if gap["gapType"] == "EVIDENCE_WEAK" else "missing skill"})
    return tips


def _rag_insights(documents: list[dict], gaps: list[dict]) -> tuple[list[str], list[str]]:
    gap_keys = {_skill_key(gap["skill"]): gap["skill"] for gap in gaps}
    insights = []
    warnings = []
    for document in documents[:5]:
        if not isinstance(document, dict):
            continue
        metadata = _as_dict(document.get("metadata"))
        skills = _unique_skills(sum((_as_list(metadata.get(key)) for key in ("skills", "requiredSkills", "optionalSkills", "matchedSkills")), []))
        confirmed = [gap_keys[_skill_key(skill)] for skill in skills if _skill_key(skill) in gap_keys]
        if confirmed:
            title = document.get("title") or "un document indexe"
            insights.append(f"Le document {title} confirme la pertinence de {', '.join(deduplicate_strings(confirmed))} pour ce contexte.")
    if documents and not insights:
        warnings.append("Le contexte RAG disponible n'apporte pas de signal suffisamment precis sur les priorites detectees.")
    if not documents:
        warnings.append("Aucun contexte RAG exploitable; les conseils reposent sur le matching et les preuves du CV.")
    return insights[:5], warnings


def _effort(readiness: str, gap_count: int) -> dict:
    if readiness == "READY":
        return {"level": "LOW", "reason": "Les exigences principales sont couvertes; l'effort porte surtout sur la presentation des preuves."}
    if readiness in {"ALMOST_READY", "NEEDS_TARGETED_WORK"}:
        return {"level": "MEDIUM", "reason": f"Un travail cible sur {max(1, min(gap_count, 3))} priorite(s) peut renforcer le dossier."}
    return {"level": "HIGH", "reason": "Les donnees ou plusieurs exigences essentielles demandent un travail plus substantiel avant de cibler cette offre."}


def generate_career_advice_v2(input_data: Any) -> dict:
    payload = _as_dict(input_data)
    student = _as_dict(payload.get("student"))
    offer = _as_dict(payload.get("offer"))
    matching = _as_dict(payload.get("matching"))
    explainability = _as_dict(matching.get("explainability"))
    career_signal_map = _as_dict(explainability.get("careerSignalMap"))
    global_signals = _as_dict(career_signal_map.get("globalSignals"))
    if not student:
        raise ValueError("student is required")
    if not offer:
        raise ValueError("offer is required")
    if not matching:
        raise ValueError("matching is required")

    question = payload.get("question")
    intent = detect_question_intent(question)
    question_requirement = _find_question_requirement(question, matching)
    if question_requirement and intent not in {"PROJECT_IDEAS", "CV_IMPROVEMENT", "INTERVIEW_PREP"}:
        intent = "SPECIFIC_SKILL"
    readiness = determine_readiness_level(matching)
    gaps = prioritize_skill_gaps(matching)
    evidence_strengths = build_evidence_based_strengths(matching)
    domain = _as_dict(_as_dict(matching.get("v3")).get("domainAlignment")).get("offerDomain") or "GENERAL"
    projects = generate_recommended_projects(gaps, str(domain))
    if readiness == "INSUFFICIENT_DATA":
        projects = []
    roadmap = build_learning_roadmap(gaps, readiness)
    cv_tips = generate_cv_improvement_tips(matching)
    interview_tips = generate_interview_preparation_tips(matching)
    rag_documents = _as_list(payload.get("ragContextDocuments"))
    rag_insights, rag_warnings = _rag_insights(rag_documents, gaps)
    rag_citations = [
        {
            "sourceId": document.get("id"),
            "title": document.get("title") or "Document indexe",
            "sourceType": _as_dict(document.get("metadata")).get("sourceType") or document.get("ownerType") or "DOCUMENT",
            "ownerType": document.get("ownerType"),
            "chunkIndex": _as_dict(document.get("metadata")).get("chunkIndex", 0),
            "score": float(document.get("score") or 0),
            "snippet": str(document.get("contentPreview") or "")[:240],
        }
        for document in rag_documents[:5]
        if isinstance(document, dict)
    ]
    critical = [gap for gap in gaps if gap["gapType"] == "CRITICAL"]
    required = [gap for gap in gaps if gap["gapType"] == "REQUIRED"]
    optional = [gap for gap in gaps if gap["gapType"] == "OPTIONAL"]
    weak = [item for item in evidence_strengths if item["evidenceLevel"] == "WEAK_EVIDENCE"]
    score = int(matching.get("score") or 0)
    analysis_summary = _build_analysis_summary(matching, readiness)

    focus = {
        "PROJECT_IDEAS": "La priorite est de produire une preuve pratique directement reliee aux exigences de l'offre.",
        "CV_IMPROVEMENT": "La priorite est de rendre les preuves du CV plus precises sans ajouter de competence non acquise.",
        "INTERVIEW_PREP": "La priorite est de preparer des exemples honnetes pour les points couverts et les lacunes.",
        "STRENGTHS": "La reponse distingue les preuves fortes, moyennes et les simples mentions du CV.",
        "LEARNING_PLAN": "La reponse organise les actions selon la priorite et l'effort de preparation estime.",
        "READINESS": "La reponse explique le niveau de preparation avec la couverture et la confiance du matching.",
        "SPECIFIC_SKILL": "La reponse analyse la competence citee a partir de sa couverture et de ses preuves.",
        "CUSTOM_QUESTION": "La reponse utilise uniquement les signaux disponibles dans le matching et le CV.",
        "SKILL_GAPS": "La priorite est de traiter d'abord les ecarts critiques, puis les exigences obligatoires.",
        "FULL_ANALYSIS": "L'analyse combine les ecarts, les preuves, le plan d'apprentissage et la preparation de candidature.",
    }[intent]
    warnings = list(rag_warnings)
    if str(matching.get("confidence") or "LOW").upper() == "LOW":
        warnings.insert(0, "La confiance du matching est faible; enrichissez le CV et verifiez les exigences de l'offre avant d'agir.")

    signal_notes = []
    if global_signals.get("dominantDomains"):
        signal_notes.append(f"Domaines solides: {', '.join(global_signals['dominantDomains'][:2])}.")
    if global_signals.get("weakDomains"):
        signal_notes.append(f"Domaines a renforcer: {', '.join(global_signals['weakDomains'][:2])}.")
    profile_summary = f"Compatibilite {score}/100 pour {offer.get('title', 'l offre cible')}. Niveau de preparation: {readiness}. {focus} {' '.join(signal_notes)}"
    legacy_strengths = [item["statement"] for item in evidence_strengths]
    if not legacy_strengths:
        legacy_strengths = _unique_skills(matching.get("strengths") or [])
    legacy_gaps = [{"skill": gap["skill"], "priority": gap["priority"], "reason": gap["reason"], "actions": gap["suggestedActions"]} for gap in gaps]
    legacy_plan = [{"period": item["period"], "objective": item["objective"], "actions": item["actions"], "targetSkills": item["targetSkills"], "expectedOutcome": item["expectedOutcome"]} for item in roadmap]

    if readiness == "INSUFFICIENT_DATA":
        final_advice = "Les donnees actuelles ne permettent pas un conseil suffisamment fiable. Completez le CV avec des projets et technologies reellement utilises, puis relancez l'analyse."
    elif intent == "PROJECT_IDEAS" and projects:
        final_advice = f"Commencez par le projet '{projects[0]['title']}'. Gardez un perimetre limite, terminez les livrables et documentez uniquement les competences reellement mises en pratique."
    elif intent == "CV_IMPROVEMENT":
        final_advice = "Ameliorez d'abord la qualite des preuves: reliez chaque technologie a une realisation, votre contribution et un resultat. N'ajoutez aucune competence que vous ne pouvez pas expliquer."
    elif intent == "INTERVIEW_PREP":
        topic = interview_tips[0]["topic"] if interview_tips else "vos projets"
        final_advice = f"Preparez en priorite un exemple structure autour de {topic}, puis une reponse honnete sur les competences encore en progression."
    elif critical:
        final_advice = f"Concentrez d'abord l'effort sur {critical[0]['skill']}, une exigence critique qui limite actuellement la compatibilite, puis produisez une preuve concrete de progression."
    elif readiness == "READY":
        final_advice = "Le profil est proche des attentes techniques. Privilegiez maintenant la qualite des preuves, la presentation des projets et une preparation d'entretien honnete."
    else:
        first = gaps[0]["skill"] if gaps else "les preuves de vos projets"
        final_advice = f"Travaillez en priorite {first} avec une realisation limitee mais terminee, puis mettez le CV a jour uniquement avec ce que vous pouvez demontrer."

    if intent == "SPECIFIC_SKILL" and question_requirement:
        skill = str(question_requirement.get("requirement"))
        coverage = round(float(question_requirement.get("coverage") or 0) * 100)
        match_type = str(question_requirement.get("matchType") or "MISSING")
        evidence = _as_list(question_requirement.get("evidence"))
        related_gap = next((gap for gap in gaps if _skill_key(gap["skill"]) == _skill_key(skill)), None)
        if coverage >= 75:
            proof_text = f" Une preuve a ete detectee: {evidence[0]}" if evidence else " La competence est detectee, mais le CV devrait mieux documenter son utilisation."
            direct_answer = f"Pour {skill}, la couverture estimee est de {coverage}% ({match_type}).{proof_text}"
        elif coverage > 0:
            direct_answer = f"{skill} n'est couverte que partiellement a {coverage}% ({match_type}). Ce signal ne suffit pas a prouver une maitrise directe."
        else:
            direct_answer = f"Aucune preuve fiable de {skill} n'a ete trouvee dans le CV. Cette competence est classee {question_requirement.get('importance', 'REQUIRED')} pour l'offre."
        if related_gap and related_gap.get("suggestedActions"):
            direct_answer += f" Action conseillee: {related_gap['suggestedActions'][0]}"
    elif intent == "SKILL_GAPS":
        named_gaps = ", ".join(gap["skill"] for gap in gaps[:3])
        direct_answer = (
            f"Travaillez en priorite {named_gaps}. L'ordre tient compte de la criticite dans l'offre, "
            "de la couverture actuelle et de la qualite des preuves du CV."
            if named_gaps
            else "Aucun ecart technique prioritaire n'est identifie. Renforcez surtout les preuves de vos projets."
        )
    elif intent == "PROJECT_IDEAS":
        direct_answer = final_advice
    elif intent == "CV_IMPROVEMENT":
        direct_answer = f"{final_advice} Premiere action: {cv_tips[0]}" if cv_tips else final_advice
    elif intent == "INTERVIEW_PREP":
        direct_answer = final_advice
    elif intent == "STRENGTHS":
        named_strengths = ", ".join(item["skill"] for item in evidence_strengths[:3])
        direct_answer = (
            f"Vos points d'appui les mieux documentes sont {named_strengths}. Ils sont retenus parce que le CV contient des preuves exploitables, pas seulement des mots-cles."
            if named_strengths
            else "Aucun point fort n'est suffisamment documente pour cette offre. Ajoutez des preuves concretes aux projets reellement realises."
        )
    elif intent == "LEARNING_PLAN":
        steps = "; ".join(f"{item['period']}: {item['objective']}" for item in roadmap[:3])
        direct_answer = f"Plan recommande: {steps}" if steps else "Aucune roadmap fiable ne peut etre construite avec les donnees actuelles."
    elif intent == "READINESS":
        required_coverage = analysis_summary["requiredCoverage"]
        critical_coverage = analysis_summary["criticalCoverage"]
        direct_answer = (
            f"Votre niveau est {readiness} avec un score de {score}/100 et une confiance {analysis_summary['confidence']}. "
            f"Vous couvrez {required_coverage['covered']} exigence(s) obligatoire(s) sur {required_coverage['total']} "
            f"et {critical_coverage['covered']} competence(s) critique(s) sur {critical_coverage['total']}."
        )
    elif intent == "CUSTOM_QUESTION":
        strongest = evidence_strengths[0]["skill"] if evidence_strengths else None
        first_gap = gaps[0]["skill"] if gaps else None
        direct_answer = (
            f"D'apres les donnees disponibles, votre meilleur appui est {strongest or 'la coherence generale du profil'}"
            f" et la priorite principale est {first_gap or 'de mieux documenter vos projets'}. "
            "La question ne correspond pas a un signal plus precis du matching; la reponse reste donc limitee a ces elements verifiables."
        )
    else:
        required_coverage = analysis_summary["requiredCoverage"]
        evidence_counts = analysis_summary["evidenceSummary"]
        named_gaps = ", ".join(gap["skill"] for gap in gaps[:3]) or "aucun gap prioritaire"
        direct_answer = (
            f"Le profil obtient {score}/100 avec une confiance {analysis_summary['confidence']} et un niveau {readiness}. "
            f"Il couvre {required_coverage['covered']} exigence(s) obligatoire(s) sur {required_coverage['total']}; "
            f"{evidence_counts['strong']} preuve(s) forte(s) soutiennent l'analyse. Priorites: {named_gaps}."
        )

    return {
        "profileSummary": profile_summary,
        "matchingScore": score,
        "strengths": legacy_strengths,
        "skillsToImprove": legacy_gaps,
        "actionPlan": legacy_plan,
        "finalAdvice": final_advice,
        "ragInsights": rag_insights,
        "v2": {
            "adviceMethod": "CAREER_ASSISTANT_V2_FROM_MATCHING_V3",
            "questionIntent": intent,
            "answeredQuestion": payload.get("question") or "",
            "directAnswer": direct_answer,
            "specificSkillAnalysis": question_requirement or None,
            "analysisSummary": analysis_summary,
            "skillEvidenceMap": _as_dict(explainability.get("skillEvidenceMap")),
            "careerSignalMap": career_signal_map,
            "decisionTrace": _as_list(explainability.get("decisionTrace")),
            "decisionLabel": matching.get("decisionLabel") or "INSUFFICIENT_DATA",
            "confidence": matching.get("confidence") or "LOW",
            "readinessLevel": readiness,
            "priorityFocus": gaps[:3],
            "criticalGaps": critical,
            "requiredGaps": required,
            "optionalImprovements": optional,
            "evidenceBasedStrengths": evidence_strengths,
            "weakEvidenceAreas": weak,
            "recommendedProjects": projects if intent not in {"CV_IMPROVEMENT", "INTERVIEW_PREP"} else [],
            "cvImprovementTips": cv_tips if intent != "PROJECT_IDEAS" else cv_tips[:1],
            "interviewPreparationTips": interview_tips if intent != "PROJECT_IDEAS" else [],
            "learningRoadmap": roadmap,
            "estimatedPreparationEffort": _effort(readiness, len(gaps)),
            "warnings": warnings,
            "ragContextUsed": bool(rag_documents),
            "ragCitations": rag_citations,
            "ragWarnings": rag_warnings,
        },
    }
