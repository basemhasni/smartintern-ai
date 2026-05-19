from app.services.cv_analysis_service import extract_skills


def detect_domain(text: str) -> str:
    normalized_text = text.lower()

    if any(keyword in normalized_text for keyword in ["flutter", "mobile", "android", "ios"]):
        return "Mobile"

    if any(keyword in normalized_text for keyword in ["docker", "jenkins", "aws", "devops", "ci/cd"]):
        return "DevOps"

    if any(keyword in normalized_text for keyword in ["data", "ia", "ai", "machine learning", "python"]):
        return "Data / IA"

    if any(keyword in normalized_text for keyword in ["react", "angular", "vue", "node", "fullstack", "web"]):
        return "Développement web"

    return "Général"


def summarize_offer(domain: str) -> str:
    summaries = {
        "Développement web": "Offre orientée développement web fullstack.",
        "Mobile": "Offre orientée développement mobile.",
        "DevOps": "Offre orientée DevOps et infrastructure.",
        "Data / IA": "Offre orientée data et intelligence artificielle.",
        "Général": "Offre généraliste.",
    }

    return summaries[domain]


def analyze_offer(title: str, description: str) -> dict:
    cleaned_title = title.strip()
    cleaned_description = description.strip()

    if not cleaned_title or not cleaned_description:
        raise ValueError("Offer title and description must not be empty")

    combined_text = f"{cleaned_title} {cleaned_description}"
    required_skills = extract_skills(combined_text)
    domain = detect_domain(combined_text)

    return {
        "requiredSkills": required_skills,
        "optionalSkills": [],
        "domain": domain,
        "summary": summarize_offer(domain),
    }

