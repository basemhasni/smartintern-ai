KNOWN_SKILLS = [
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "Java",
    "Spring Boot",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "AWS",
    "Flutter",
    "Git",
    "Jenkins",
]


def extract_skills(text: str) -> list[str]:
    normalized_text = text.lower()
    return [skill for skill in KNOWN_SKILLS if skill.lower() in normalized_text]


def detect_experience_level(text: str) -> str:
    normalized_text = text.lower()

    if any(keyword in normalized_text for keyword in ["senior", "5 ans", "6 ans", "expert"]):
        return "senior"

    if any(keyword in normalized_text for keyword in ["confirmé", "confirme", "3 ans", "4 ans"]):
        return "intermediate"

    return "junior"


def analyze_cv(text: str) -> dict:
    cleaned_text = text.strip()

    if not cleaned_text:
        raise ValueError("CV text must not be empty")

    skills = extract_skills(cleaned_text)

    return {
        "skills": skills,
        "experienceLevel": detect_experience_level(cleaned_text),
        "summary": "Profil orienté développement web." if skills else "Profil général à enrichir.",
    }

