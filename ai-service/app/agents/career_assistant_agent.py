from app.agents.base_agent import BaseAgent

ACTION_CATALOG = {
    "docker": [
        "Comprendre les images et conteneurs Docker.",
        "Dockeriser une petite API Node.js.",
        "Ajouter ce projet dans votre portfolio.",
    ],
    "aws": [
        "Decouvrir les services EC2, S3 et RDS.",
        "Deployer une petite application de demonstration.",
        "Documenter les etapes de deploiement.",
    ],
    "react": [
        "Creer une interface avec composants et gestion d'etat.",
        "Consommer une API REST depuis React.",
        "Ajouter ce projet dans votre portfolio.",
    ],
    "node.js": [
        "Creer une API REST structuree avec Express.",
        "Ajouter authentification et validation des donnees.",
        "Tester les endpoints avec Postman.",
    ],
    "postgresql": [
        "Pratiquer les requetes SQL et les relations.",
        "Connecter une API a PostgreSQL avec un ORM.",
        "Modeliser un cas simple avec plusieurs tables.",
    ],
}

GENERIC_ACTIONS = [
    "Etudier les fondamentaux de cette competence.",
    "Realiser un mini-projet pratique.",
    "Documenter le resultat dans votre portfolio.",
]


class CareerAssistantAgent(BaseAgent):
    name = "CareerAssistantAgent"
    description = "Generates deterministic career improvement advice"

    def _normalize_list(self, values: list[str] | None) -> list[str]:
        normalized: list[str] = []
        seen: set[str] = set()

        for value in values or []:
            if not isinstance(value, str):
                continue

            cleaned = value.strip()
            key = cleaned.lower()

            if cleaned and key not in seen:
                seen.add(key)
                normalized.append(cleaned)

        return normalized

    def _actions_for_skill(self, skill: str) -> list[str]:
        return ACTION_CATALOG.get(skill.lower(), GENERIC_ACTIONS)

    def _missing_optional_skills(
        self,
        candidate_skills: list[str],
        matched_skills: list[str],
        optional_skills: list[str],
    ) -> list[str]:
        known = {skill.lower() for skill in candidate_skills + matched_skills}
        return [skill for skill in optional_skills if skill.lower() not in known]

    def _build_profile_summary(self, score: int, offer_title: str) -> str:
        if score >= 80:
            return f"Votre profil correspond fortement a l'offre {offer_title}."

        if score >= 50:
            return f"Votre profil correspond partiellement a l'offre {offer_title}."

        return f"Votre profil necessite encore des ameliorations pour l'offre {offer_title}."

    def _build_action_plan(self, skills_to_improve: list[dict]) -> list[dict]:
        if not skills_to_improve:
            return [
                {
                    "period": "Semaine 1",
                    "objective": "Consolider les competences deja presentes dans votre CV.",
                },
                {
                    "period": "Semaine 2",
                    "objective": "Realiser un mini-projet lie a l'offre cible.",
                },
                {
                    "period": "Semaine 3",
                    "objective": "Mettre a jour votre CV et votre portfolio avec les resultats obtenus.",
                },
            ]

        plan = []
        for index, item in enumerate(skills_to_improve[:3], start=1):
            plan.append(
                {
                    "period": f"Semaine {index}",
                    "objective": f"Travailler {item['skill']} avec une realisation pratique.",
                }
            )

        return plan

    def run(self, input_data):
        student = input_data.student
        offer = input_data.offer
        matching = input_data.matching

        if not student:
            raise ValueError("student is required")

        if not offer:
            raise ValueError("offer is required")

        if not matching:
            raise ValueError("matching is required")

        if not isinstance(matching.missingSkills, list):
            raise ValueError("missingSkills must be a list")

        candidate_skills = self._normalize_list(input_data.candidateSkills)
        matched_skills = self._normalize_list(matching.matchedSkills)
        missing_skills = self._normalize_list(matching.missingSkills)
        optional_skills = self._normalize_list(offer.optionalSkills)
        optional_missing_skills = self._missing_optional_skills(candidate_skills, matched_skills, optional_skills)

        strengths = [f"Vous possedez deja {skill}." for skill in matched_skills]

        skills_to_improve = []
        for skill in missing_skills:
            skills_to_improve.append(
                {
                    "skill": skill,
                    "priority": "HIGH",
                    "reason": "Cette competence est demandee dans l'offre mais absente de votre CV analyse.",
                    "actions": self._actions_for_skill(skill),
                }
            )

        for skill in optional_missing_skills:
            skills_to_improve.append(
                {
                    "skill": skill,
                    "priority": "MEDIUM",
                    "reason": "Cette competence est optionnelle dans l'offre et peut renforcer votre candidature.",
                    "actions": self._actions_for_skill(skill),
                }
            )

        action_plan = self._build_action_plan(skills_to_improve)

        if missing_skills:
            final_advice = (
                f"Vous avez deja une base pertinente pour cette offre. En ameliorant {missing_skills[0]}, "
                "vous augmenterez votre adequation avec le poste."
            )
        elif optional_missing_skills:
            final_advice = (
                "Votre profil couvre les competences obligatoires de l'offre. Vous pouvez renforcer votre candidature "
                f"en travaillant {optional_missing_skills[0]}."
            )
        else:
            final_advice = (
                "Votre profil couvre les competences identifiees pour cette offre. Continuez a consolider vos projets "
                "et a presenter des realisations concretes."
            )

        return {
            "profileSummary": self._build_profile_summary(matching.score, offer.title),
            "matchingScore": matching.score,
            "strengths": strengths,
            "skillsToImprove": skills_to_improve,
            "actionPlan": action_plan,
            "finalAdvice": final_advice,
        }
