from app.agents.matching_agent import MatchingAgent

_agent = MatchingAgent()


def normalize_skills(skills: list[str], field_name: str) -> list[str]:
    return _agent.normalize_skills(skills, field_name)


def match_candidate(candidate_skills: list[str], required_skills: list[str], optional_skills: list[str] | None) -> dict:
    return _agent.run(
        {
            "candidateSkills": candidate_skills,
            "requiredSkills": required_skills,
            "optionalSkills": optional_skills,
        }
    )
