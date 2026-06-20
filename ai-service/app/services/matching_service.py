from app.agents.matching_agent_v2 import MatchingAgentV2

_agent = MatchingAgentV2()


def normalize_skills(skills: list[str], field_name: str) -> list[str]:
    return _agent.normalize_skills(skills, field_name)


def match_candidate(
    candidate_skills: list[str],
    required_skills: list[str],
    optional_skills: list[str] | None,
    candidate_analysis: dict | None = None,
    offer_analysis: dict | None = None,
) -> dict:
    return _agent.run(
        {
            "candidateSkills": candidate_skills,
            "requiredSkills": required_skills,
            "optionalSkills": optional_skills,
            "candidateAnalysis": candidate_analysis or {},
            "offerAnalysis": offer_analysis or {},
        }
    )
