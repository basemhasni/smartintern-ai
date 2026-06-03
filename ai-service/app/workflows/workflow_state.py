from typing import Optional, TypedDict


class MatchingWorkflowState(TypedDict):
    candidateSkills: list[str]
    requiredSkills: list[str]
    optionalSkills: list[str]
    result: Optional[dict]
    error: Optional[str]
