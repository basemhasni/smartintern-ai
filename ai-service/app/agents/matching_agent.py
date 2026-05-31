from app.agents.base_agent import BaseAgent


class MatchingAgent(BaseAgent):
    name = "MatchingAgent"
    description = "Computes a deterministic compatibility score between candidate and offer skills"

    def normalize_skills(self, skills: list[str], field_name: str) -> list[str]:
        if not isinstance(skills, list) or any(not isinstance(skill, str) for skill in skills):
            raise ValueError(f"{field_name} must be a list of strings")

        return [skill.strip() for skill in skills if skill.strip()]

    def run(self, input_data):
        candidate = self.normalize_skills(input_data["candidateSkills"], "candidateSkills")
        required = self.normalize_skills(input_data["requiredSkills"], "requiredSkills")
        optional = self.normalize_skills(input_data.get("optionalSkills") or [], "optionalSkills")

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
            "explanation": f"Le candidat possÃ¨de {len(matched_skills)} compÃ©tence(s) requise(s) sur {len(required)}.",
        }
