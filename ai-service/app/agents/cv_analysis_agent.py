from app.agents.base_agent import BaseAgent

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


class CVAnalysisAgent(BaseAgent):
    name = "CVAnalysisAgent"
    description = "Extracts skills and profile signals from CV text"

    def extract_skills(self, text: str) -> list[str]:
        normalized_text = text.lower()
        return [skill for skill in KNOWN_SKILLS if skill.lower() in normalized_text]

    def detect_experience_level(self, text: str) -> str:
        normalized_text = text.lower()

        if any(keyword in normalized_text for keyword in ["senior", "5 ans", "6 ans", "expert"]):
            return "senior"

        if any(keyword in normalized_text for keyword in ["confirmÃ©", "confirme", "3 ans", "4 ans"]):
            return "intermediate"

        return "junior"

    def run(self, input_data):
        cleaned_text = input_data.strip()

        if not cleaned_text:
            raise ValueError("CV text must not be empty")

        skills = self.extract_skills(cleaned_text)

        return {
            "skills": skills,
            "experienceLevel": self.detect_experience_level(cleaned_text),
            "summary": "Profil orientÃ© dÃ©veloppement web." if skills else "Profil gÃ©nÃ©ral Ã  enrichir.",
        }
