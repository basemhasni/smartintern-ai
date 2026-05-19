def normalize_skills(skills: list[str], field_name: str) -> list[str]:
    if not isinstance(skills, list) or any(not isinstance(skill, str) for skill in skills):
        raise ValueError(f"{field_name} must be a list of strings")

    return [skill.strip() for skill in skills if skill.strip()]


def match_candidate(candidate_skills: list[str], required_skills: list[str], optional_skills: list[str] | None) -> dict:
    candidate = normalize_skills(candidate_skills, "candidateSkills")
    required = normalize_skills(required_skills, "requiredSkills")
    optional = normalize_skills(optional_skills or [], "optionalSkills")

    candidate_lookup = {skill.lower(): skill for skill in candidate}
    matched_skills = [skill for skill in required if skill.lower() in candidate_lookup]
    missing_skills = [skill for skill in required if skill.lower() not in candidate_lookup]
    optional_matched_skills = [skill for skill in optional if skill.lower() in candidate_lookup]

    score = 0
    if required:
        score = round((len(matched_skills) / len(required)) * 100)

    return {
        "score": score,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "optionalMatchedSkills": optional_matched_skills,
        "explanation": f"Le candidat possède {len(matched_skills)} compétence(s) requise(s) sur {len(required)}.",
    }

