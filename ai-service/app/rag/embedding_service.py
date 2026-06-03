TECHNICAL_KEYWORDS = [
    "React",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Java",
    "Spring Boot",
    "Python",
    "FastAPI",
    "Flutter",
    "MongoDB",
    "Git",
    "Jenkins",
]


def generate_simple_embedding(text: str) -> list[int]:
    normalized_text = (text or "").lower()

    return [
        1 if keyword.lower() in normalized_text else 0
        for keyword in TECHNICAL_KEYWORDS
    ]
