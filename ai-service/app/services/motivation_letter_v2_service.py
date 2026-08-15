"""Evidence-based deterministic motivation letter generation V2."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.services.skill_extraction_service import canonicalize_skill_list
from app.utils.text_normalization import deduplicate_strings, normalize_text


VALID_TONES = {"PROFESSIONAL", "DYNAMIC", "SIMPLE"}
TONE_WORD_LIMITS = {
    "PROFESSIONAL": (180, 280),
    "DYNAMIC": (180, 280),
    "SIMPLE": (130, 220),
}


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


def _unique(values: list[Any]) -> list[str]:
    return deduplicate_strings([_clean(value) for value in values if _clean(value)])


def _skill_key(value: str) -> str:
    canonical = canonicalize_skill_list([value])
    return normalize_text(canonical[0] if canonical else value).replace(" ", "")


def _join_french(values: list[str]) -> str:
    if not values:
        return ""
    if len(values) == 1:
        return values[0]
    return ", ".join(values[:-1]) + f" et {values[-1]}"


def normalize_tone(tone: str | None) -> str:
    normalized = _clean(tone).upper() or "PROFESSIONAL"
    return normalized if normalized in VALID_TONES else "PROFESSIONAL"


def _matching_payload(payload: dict) -> dict:
    return _as_dict(payload.get("matchingResult")) or _as_dict(payload.get("matching"))


def extract_letter_evidence(
    cv_analysis: dict | None,
    matching_result: dict | None,
    candidate_skills: list[str] | None = None,
) -> dict:
    cv = _as_dict(cv_analysis)
    matching = _as_dict(matching_result)
    v3 = _as_dict(matching.get("v3"))
    matrix = _as_list(v3.get("coverageMatrix"))
    detected = _unique(
        _as_list(cv.get("detectedSkills"))
        or _as_list(cv.get("skills"))
        or _as_list(candidate_skills)
    )
    detected_by_key = {_skill_key(skill): skill for skill in detected}
    matched = _unique(_as_list(matching.get("matchedSkills")) + _as_list(matching.get("optionalMatchedSkills")))
    missing = _unique(
        _as_list(v3.get("criticalMissingSkills"))
        + _as_list(v3.get("missingRequiredSkills"))
        + _as_list(matching.get("missingSkills"))
    )
    missing_keys = {_skill_key(skill) for skill in missing}

    verified = []
    evidence_items = []
    for row in matrix:
        if not isinstance(row, dict):
            continue
        skill = _clean(row.get("requirement"))
        coverage = float(row.get("coverage") or 0)
        key = _skill_key(skill)
        if coverage < 0.75 or key in missing_keys or key not in detected_by_key:
            continue
        verified_skill = detected_by_key[key]
        verified.append(verified_skill)
        row_evidence = _as_list(row.get("evidence"))
        evidence_type = _clean(row.get("evidenceType")) or "UNKNOWN"
        confidence = float(row.get("confidence") or 0)
        evidence_items.append(
            {
                "skill": verified_skill,
                "level": "STRONG" if row_evidence and evidence_type in {"PROJECT", "EXPERIENCE"} and confidence >= 0.8 else "MEDIUM",
                "type": evidence_type,
                "text": _clean(row_evidence[0])[:220] if row_evidence else "",
            }
        )

    if not verified:
        matched_keys = {_skill_key(skill) for skill in matched}
        verified = [skill for skill in detected if _skill_key(skill) in matched_keys and _skill_key(skill) not in missing_keys]
        evidence_items.extend(
            {"skill": skill, "level": "MEDIUM", "type": "SKILL_LIST", "text": ""}
            for skill in verified
        )

    projects = []
    for item in _as_list(cv.get("projectSignals")):
        if isinstance(item, str) and item.strip():
            projects.append(item.strip()[:220])
        elif isinstance(item, dict):
            text = item.get("description") or item.get("text") or item.get("title")
            if text:
                projects.append(_clean(text)[:220])

    domains = _unique(_as_list(cv.get("domainSignals")))
    return {
        "verifiedSkills": _unique(verified),
        "strongEvidence": [item for item in evidence_items if item["level"] == "STRONG"],
        "mediumEvidence": [item for item in evidence_items if item["level"] == "MEDIUM"],
        "projects": _unique(projects),
        "domains": domains,
        "missingSkills": missing,
        "criticalMissingSkills": _unique(_as_list(v3.get("criticalMissingSkills"))),
        "experienceLevel": cv.get("experienceLevelV2") or cv.get("experienceLevel") or "UNKNOWN",
        "rawTextQuality": _as_dict(cv.get("rawTextQuality")),
    }


def _select_letter_skills(evidence: dict, offer: dict) -> list[str]:
    verified = evidence["verifiedSkills"]
    required_keys = {_skill_key(skill) for skill in _as_list(offer.get("requiredSkills"))}
    optional_keys = {_skill_key(skill) for skill in _as_list(offer.get("optionalSkills"))}
    relevant = [skill for skill in verified if _skill_key(skill) in required_keys]
    relevant += [skill for skill in verified if _skill_key(skill) in optional_keys and skill not in relevant]
    relevant += [skill for skill in verified if skill not in relevant]
    return relevant[:4]


def _fit_context(student: dict, evidence: dict, used_skills: list[str], tone: str) -> str:
    education = _clean(student.get("educationLevel"))
    target = _clean(student.get("targetJob"))
    skills = _join_french(used_skills)
    strong = evidence["strongEvidence"]

    if tone == "SIMPLE":
        start = f"Ma formation en {education}" if education else "Mon parcours en informatique"
        if target:
            start += f" et mon objectif de devenir {target}"
        sentence = start + " me donnent une base coherente pour cette mission."
        if skills:
            sentence += f" J ai deja utilise {skills} dans mon parcours."
        return sentence

    start = f"Actuellement en {education}" if education else "Etudiant en informatique"
    if target:
        start += f", avec pour objectif professionnel de devenir {target}"
    sentence = start + ", je souhaite mobiliser des acquis directement utiles a cette mission."
    if skills:
        proof = " dans des projets concrets" if any(item["type"] == "PROJECT" for item in strong) else " au cours de mon parcours"
        sentence += f" J ai notamment mis en pratique {skills}{proof}, ce qui me permet d aborder les besoins techniques de l offre avec des reperes verifiables."
    else:
        sentence += " Mon CV ne documente pas encore suffisamment de technologies directement communes avec l offre; je prefere donc presenter mon parcours avec mesure."
    return sentence


def _motivation_context(offer: dict, company: dict, evidence: dict, tone: str) -> str:
    title = _clean(offer.get("title")) or "ce stage"
    offer_label = title if normalize_text(title).startswith("stage ") else f"stage {title}"
    company_name = _clean(company.get("companyName"))
    sector = _clean(company.get("sector"))
    domains = _join_french(evidence["domains"][:2])
    destination = f" chez {company_name}" if company_name else ""

    if tone == "DYNAMIC":
        paragraph = f"Cette opportunite de {offer_label}{destination} retient particulierement mon attention car elle me permettrait de contribuer a une mission concrete tout en approfondissant mes pratiques."
    elif tone == "SIMPLE":
        paragraph = f"Le {offer_label}{destination} correspond au type de mission que je souhaite decouvrir et pratiquer."
    else:
        paragraph = f"L offre de {offer_label}{destination} m interesse par son lien direct avec les competences attendues et par la possibilite de progresser dans un cadre professionnel exigeant."
    if sector:
        paragraph += f" Le secteur {sector} constitue egalement un contexte dans lequel je souhaite mieux comprendre les besoins metier et la qualite attendue des solutions produites."
    elif domains:
        paragraph += f" Son orientation {domains} est coherente avec les domaines deja presents dans mon parcours."
    else:
        paragraph += " Je souhaite surtout confronter mes acquis a des besoins reels, apprendre au contact d une equipe et produire un travail utile."
    return paragraph


def _growth_context(evidence: dict, matching: dict, tone: str) -> tuple[str, list[str]]:
    missing = evidence["criticalMissingSkills"] or evidence["missingSkills"]
    handled = missing[:1]
    readiness = _as_dict(_as_dict(matching.get("careerAdvice")).get("v2")).get("readinessLevel")
    decision = _clean(matching.get("decisionLabel"))

    if handled:
        skill = handled[0]
        if tone == "DYNAMIC":
            paragraph = f"L offre mentionne aussi {skill}, que je ne presente pas comme un acquis actuel. Je suis toutefois dispose a le travailler de maniere ciblee et a demontrer rapidement ma progression par une realisation pratique."
        elif tone == "SIMPLE":
            paragraph = f"Je souhaite aussi progresser sur {skill}, demande dans l offre, sans surestimer mon niveau actuel."
        else:
            paragraph = f"Je souhaite par ailleurs approfondir {skill}, mentionne dans l offre, sans le presenter comme une competence deja acquise. Une progression structuree sur ce point completerait utilement les bases que mon CV permet deja d etablir."
        return paragraph, handled

    if decision == "STRONG_MATCH" or readiness == "READY":
        return "La coherence actuelle de mon profil ne dispense pas d une phase d apprentissage: je souhaite consolider ces acquis, comprendre vos methodes de travail et les appliquer avec rigueur dans un contexte reel.", []
    return "Je souhaite aborder ce stage avec curiosite et lucidite, en m appuyant sur mes acquis actuels tout en restant disponible pour apprendre les pratiques et outils propres a votre equipe.", []


def _opening(student: dict, offer: dict, company: dict, tone: str) -> str:
    title = _clean(offer.get("title")) or "votre offre de stage"
    offer_label = title if normalize_text(title).startswith("stage ") else f"stage {title}"
    company_name = _clean(company.get("companyName"))
    destination = f" au sein de {company_name}" if company_name else ""
    if tone == "DYNAMIC":
        return f"Madame, Monsieur,\n\nJe souhaite vous proposer ma candidature pour le {offer_label}{destination}. Cette mission represente pour moi une occasion concrete de mobiliser mes acquis et de poursuivre ma progression dans un environnement professionnel."
    if tone == "SIMPLE":
        return f"Madame, Monsieur,\n\nJe vous adresse ma candidature pour le {offer_label}{destination}. Cette offre correspond a la direction que je souhaite donner a mon parcours."
    return f"Madame, Monsieur,\n\nJe vous adresse ma candidature pour le {offer_label}{destination}. Les missions et competences associees a cette offre correspondent a la prochaine etape que je souhaite donner a mon parcours."


def _closing(student: dict, tone: str) -> str:
    full_name = " ".join(filter(None, [_clean(student.get("firstName")), _clean(student.get("lastName"))]))
    signature = full_name or "Le candidat"
    if tone == "SIMPLE":
        return f"Je serais heureux d echanger avec vous afin de preciser ma motivation et mon parcours.\n\nCordialement,\n{signature}"
    if tone == "DYNAMIC":
        return f"Je serais heureux de pouvoir echanger avec vous afin de presenter plus concretement mes realisations, ma motivation et la maniere dont je pourrais contribuer a cette mission.\n\nVeuillez agreer, Madame, Monsieur, mes salutations respectueuses.\n{signature}"
    return f"Je me tiens a votre disposition pour un entretien qui me permettrait de presenter plus precisement mon parcours, mes realisations et ma motivation pour cette opportunite.\n\nVeuillez agreer, Madame, Monsieur, l expression de mes salutations distinguees.\n{signature}"


def _word_count(content: str) -> int:
    return len([word for word in content.replace("\n", " ").split(" ") if word.strip()])


def _extract_safe_rag_context(documents: list[dict]) -> dict:
    for document in documents[:5]:
        if not isinstance(document, dict):
            continue
        if float(document.get("score") or document.get("hybridScore") or 0) < 0.18:
            continue
        metadata = _as_dict(document.get("metadata"))
        sector = _clean(metadata.get("sector"))
        if sector:
            return {"sector": sector, "sourceTitle": _clean(document.get("title"))}
    return {}


def validate_letter_claims(letter: str, evidence: dict, matching_result: dict | None) -> dict:
    normalized = normalize_text(letter)
    missing = _unique(evidence.get("missingSkills") or [])
    risky_claims = []
    for skill in missing:
        skill_text = normalize_text(skill)
        risky_markers = (
            "maitrise",
            "expert",
            "solide experience",
            "solides connaissances",
            "mes competences",
            "j ai utilise",
            "je connais",
            "je possede",
        )
        sentences = [sentence.strip() for sentence in normalized.replace("\n", " ").split(".")]
        if any(skill_text in sentence and any(marker in sentence for marker in risky_markers) for sentence in sentences):
            risky_claims.append(skill)
    generic_risks = [claim for claim in ("expert", "profil parfait", "candidat ideal", "garantis") if claim in normalized]
    return {
        "valid": not risky_claims and not generic_risks,
        "claimedMissingSkills": risky_claims,
        "riskyPhrases": generic_risks,
        "usesOnlyVerifiedSkills": not risky_claims,
        "doesNotClaimMissingSkills": not risky_claims,
    }


def calculate_personalization_score(letter: str, inputs: dict) -> float:
    student = _as_dict(inputs.get("student"))
    offer = _as_dict(inputs.get("offer"))
    company = _as_dict(inputs.get("company"))
    used_skills = _as_list(inputs.get("usedSkills"))
    evidence = _as_dict(inputs.get("evidence"))
    normalized = normalize_text(letter)
    score = 0.0
    score += 0.20 if _clean(offer.get("title")) and normalize_text(offer["title"]) in normalized else 0
    score += 0.10 if _clean(company.get("companyName")) and normalize_text(company["companyName"]) in normalized else 0
    mentioned_skills = [skill for skill in used_skills if normalize_text(skill) in normalized]
    score += 0.25 if used_skills and len(mentioned_skills) >= min(2, len(used_skills)) else 0
    score += 0.10 if _clean(student.get("targetJob")) and normalize_text(student["targetJob"]) in normalized else 0
    score += 0.10 if _clean(student.get("educationLevel")) and normalize_text(student["educationLevel"]) in normalized else 0
    score += 0.20 if evidence.get("strongEvidence") or evidence.get("domains") else 0
    score += 0.05 if "votre entreprise m attire" not in normalized else 0
    return round(min(1.0, score), 2)


def _quality_checks(content: str, payload: dict, evidence: dict, used_skills: list[str], claim_report: dict, tone: str) -> dict:
    offer = _as_dict(payload.get("offer"))
    company = _as_dict(payload.get("company"))
    lower, upper = TONE_WORD_LIMITS[tone]
    words = _word_count(content)
    normalized = normalize_text(content)
    verified_keys = {_skill_key(skill) for skill in evidence["verifiedSkills"]}
    return {
        "mentionsCompany": not _clean(company.get("companyName")) or normalize_text(company["companyName"]) in normalized,
        "mentionsOffer": bool(_clean(offer.get("title")) and normalize_text(offer["title"]) in normalized),
        "usesOnlyVerifiedSkills": claim_report["usesOnlyVerifiedSkills"] and all(_skill_key(skill) in verified_keys for skill in used_skills),
        "doesNotClaimMissingSkills": claim_report["doesNotClaimMissingSkills"],
        "hasProfessionalTone": not any(term in normalized for term in ("super", "genial", "incroyable", "parfait")),
        "hasClearStructure": len([part for part in content.split("\n\n") if part.strip()]) >= 5,
        "lengthOk": lower <= words <= upper,
        "wordCount": words,
        "expectedRange": {"min": lower, "max": upper},
    }


def generate_motivation_letter_v2(input_data: Any) -> dict:
    payload = _as_dict(input_data)
    student = _as_dict(payload.get("studentProfile")) or _as_dict(payload.get("student"))
    offer = _as_dict(payload.get("offer"))
    company = _as_dict(payload.get("company"))
    cv_analysis = _as_dict(payload.get("cvAnalysis"))
    matching = _matching_payload(payload)
    if not student:
        raise ValueError("student is required")
    if not offer:
        raise ValueError("offer is required")

    requested_tone = _clean(payload.get("tone")).upper() or "PROFESSIONAL"
    tone = normalize_tone(requested_tone)
    warnings = []
    if requested_tone not in VALID_TONES:
        warnings.append(f"Le ton {requested_tone} n est pas supporte; PROFESSIONAL a ete utilise.")

    evidence = extract_letter_evidence(cv_analysis, matching, _as_list(payload.get("candidateSkills")))
    used_skills = _select_letter_skills(evidence, offer)
    rag_documents = _as_list(payload.get("ragContextDocuments"))
    relevant_rag_documents = [
        document for document in rag_documents
        if isinstance(document, dict) and float(document.get("score") or document.get("hybridScore") or 0) >= 0.18
    ]
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
        for document in relevant_rag_documents[:5]
    ]
    rag_context = _extract_safe_rag_context(relevant_rag_documents)
    company_context = dict(company)
    rag_used = False
    if not _clean(company_context.get("sector")) and rag_context.get("sector"):
        company_context["sector"] = rag_context["sector"]
        rag_used = True
    structure = {
        "opening": _opening(student, offer, company_context, tone),
        "fitParagraph": _fit_context(student, evidence, used_skills, tone),
        "motivationParagraph": _motivation_context(offer, company_context, evidence, tone),
    }
    structure["growthParagraph"], missing_handled = _growth_context(evidence, {**matching, "careerAdvice": payload.get("careerAdvice")}, tone)
    structure["closing"] = _closing(student, tone)
    content = "\n\n".join(structure.values())

    claim_report = validate_letter_claims(content, evidence, matching)
    avoided_claims = []
    if evidence["missingSkills"]:
        avoided_claims.append(f"Aucune maitrise revendiquee pour: {_join_french(evidence['missingSkills'])}.")
    if not evidence["projects"]:
        avoided_claims.append("Aucun projet nomme ou detaille sans preuve dans l analyse CV.")
    if str(evidence.get("experienceLevel")).upper() in {"UNKNOWN", "BEGINNER"}:
        avoided_claims.append("Aucune experience professionnelle avancee revendiquee.")

    quality = _quality_checks(content, {**payload, "student": student, "company": company_context}, evidence, used_skills, claim_report, tone)
    personalization = calculate_personalization_score(content, {"student": student, "offer": offer, "company": company_context, "usedSkills": used_skills, "evidence": evidence})
    confidence = _clean(matching.get("confidence")) or "LOW"
    if confidence == "LOW" or not _as_list(_as_dict(matching.get("v3")).get("coverageMatrix")):
        warnings.append("La lettre est moins personnalisee car les donnees CV ou matching sont insuffisantes.")
    if personalization < 0.5:
        warnings.append("Le score de personnalisation reste faible; ajoutez des preuves CV et des informations d offre plus precises.")
    if not quality["lengthOk"]:
        warnings.append(f"La longueur obtenue ({quality['wordCount']} mots) est hors de la plage recommandee pour le ton {tone}.")
    if not claim_report["valid"]:
        warnings.append("Des revendications potentiellement risquees ont ete detectees; la lettre doit etre relue avant utilisation.")

    if not rag_documents:
        warnings.append("Aucun contexte RAG utilise; la lettre repose sur le profil, le CV, l offre et le matching.")
    elif not rag_used:
        warnings.append("Le contexte RAG ne contenait aucun fait supplementaire assez fiable pour etre integre a la lettre.")

    used_evidence = evidence["strongEvidence"][:3] + evidence["mediumEvidence"][:2]
    return {
        "content": content,
        "letter": content,
        "generatedLetter": content,
        "tone": tone,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "v2": {
            "generationMethod": "MOTIVATION_LETTER_V2_EVIDENCE_BASED",
            "language": "fr",
            "structure": structure,
            "usedEvidence": used_evidence,
            "usedSkills": used_skills,
            "avoidedClaims": avoided_claims,
            "missingSkillsHandled": missing_handled,
            "qualityChecks": quality,
            "warnings": warnings,
            "personalizationScore": personalization,
            "ragContextUsed": rag_used,
            "usedRagContext": rag_used,
            "ragCitations": rag_citations if rag_used else [],
        },
    }
