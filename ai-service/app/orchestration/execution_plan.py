"""Small helpers for Orchestrator V2 execution plans."""

from __future__ import annotations

from typing import Any


def step_names(plan: list[dict[str, Any]]) -> list[str]:
    return [str(item.get("step")) for item in plan]


def is_step_planned(plan: list[dict[str, Any]], step: str) -> bool:
    return step in step_names(plan)


def is_step_required(plan: list[dict[str, Any]], step: str) -> bool:
    for item in plan:
        if item.get("step") == step:
            return bool(item.get("required"))
    return False
