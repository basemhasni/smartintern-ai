from app.agents.base_agent import BaseAgent

VALID_TONES = {"PROFESSIONAL", "DYNAMIC", "SIMPLE"}


class MotivationLetterAgent(BaseAgent):
    name = "MotivationLetterAgent"
    description = "Generates deterministic personalized motivation letters"

    def _clean(self, value: str | None) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()
        return cleaned or None

    def _dedupe_skills(self, skills: list[str] | None) -> list[str]:
        cleaned_skills: list[str] = []
        seen: set[str] = set()

        for skill in skills or []:
            cleaned = self._clean(skill)
            if not cleaned:
                continue

            key = cleaned.lower()
            if key not in seen:
                seen.add(key)
                cleaned_skills.append(cleaned)

        return cleaned_skills

    def _safe_known_skills(self, candidate_skills: list[str], matched_skills: list[str]) -> list[str]:
        candidate_lookup = {skill.lower(): skill for skill in self._dedupe_skills(candidate_skills)}
        safe_skills = []

        for skill in self._dedupe_skills(matched_skills):
            if skill.lower() in candidate_lookup:
                safe_skills.append(candidate_lookup[skill.lower()])

        if safe_skills:
            return safe_skills

        return list(candidate_lookup.values())

    def _join_skills(self, skills: list[str]) -> str:
        if not skills:
            return ""

        if len(skills) == 1:
            return skills[0]

        return ", ".join(skills[:-1]) + f" et {skills[-1]}"

    def run(self, input_data):
        tone = input_data.tone or "PROFESSIONAL"

        if tone not in VALID_TONES:
            raise ValueError("tone must be PROFESSIONAL, DYNAMIC, or SIMPLE")

        student = input_data.student
        offer = input_data.offer
        company = input_data.company
        matching = input_data.matching

        if not student:
            raise ValueError("student is required")

        if not offer:
            raise ValueError("offer is required")

        if not company:
            raise ValueError("company is required")

        first_name = self._clean(student.firstName) or "l'etudiant"
        last_name = self._clean(student.lastName) or ""
        full_name = f"{first_name} {last_name}".strip()
        education = self._clean(student.educationLevel)
        target_job = self._clean(student.targetJob)
        bio = self._clean(student.bio)
        company_name = self._clean(company.companyName) or "votre entreprise"
        sector = self._clean(company.sector)
        offer_title = self._clean(offer.title) or "votre offre de stage"
        location = self._clean(offer.location)
        duration = self._clean(offer.duration)
        matched_skills = matching.matchedSkills if matching else []
        safe_skills = self._safe_known_skills(input_data.candidateSkills, matched_skills)
        skills_sentence = self._join_skills(safe_skills)

        intro_by_tone = {
            "PROFESSIONAL": "Madame, Monsieur,",
            "DYNAMIC": "Madame, Monsieur,",
            "SIMPLE": "Bonjour,",
        }

        opening_by_tone = {
            "PROFESSIONAL": f"Je vous adresse ma candidature pour l'offre {offer_title} au sein de {company_name}.",
            "DYNAMIC": f"Je souhaite rejoindre {company_name} pour le stage {offer_title}, qui correspond fortement a mon projet.",
            "SIMPLE": f"Je vous propose ma candidature pour le stage {offer_title} chez {company_name}.",
        }

        paragraphs = [intro_by_tone[tone], "", opening_by_tone[tone]]

        profile_parts = []
        if education:
            profile_parts.append(f"Actuellement en {education}")
        if target_job:
            profile_parts.append(f"avec un objectif de devenir {target_job}")

        if profile_parts:
            paragraphs.append(", ".join(profile_parts) + ".")

        if bio:
            paragraphs.append(f"Mon profil se distingue par cette motivation : {bio}")

        if skills_sentence:
            paragraphs.append(
                f"Mes competences directement utiles pour cette mission sont {skills_sentence}."
            )

        if matching and matching.score is not None:
            paragraphs.append(
                f"Le matching avec l'offre met en avant un score de {matching.score}, ce qui confirme l'alignement de mon profil avec les besoins exprimes."
            )

        company_sentence = f"Je suis motive par l'idee de contribuer aux projets de {company_name}"
        if sector:
            company_sentence += f" dans le secteur {sector}"
        if location:
            company_sentence += f" a {location}"
        if duration:
            company_sentence += f" pendant {duration}"
        company_sentence += "."
        paragraphs.append(company_sentence)

        if tone == "DYNAMIC":
            paragraphs.append(
                "Je suis pret a m'investir avec serieux, curiosite et energie pour apprendre rapidement et apporter une contribution concrete."
            )
        elif tone == "SIMPLE":
            paragraphs.append(
                "Je serais heureux d'echanger avec vous afin de presenter ma motivation plus en detail."
            )
        else:
            paragraphs.append(
                "Je serais ravi de pouvoir echanger avec vous lors d'un entretien afin de vous presenter plus en detail ma motivation."
            )

        paragraphs.extend(["", "Veuillez agreer, Madame, Monsieur, l'expression de mes salutations distinguees.", full_name])

        return {
            "content": "\n\n".join(paragraphs)
        }
