"""Shared state for Orchestrator V2."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


@dataclass
class OrchestrationContext:
    intent: str
    input: dict[str, Any]
    requestId: str = field(default_factory=lambda: str(uuid4()))
    normalizedInput: dict[str, Any] = field(default_factory=dict)
    cvAnalysis: dict[str, Any] = field(default_factory=dict)
    offerAnalysis: dict[str, Any] = field(default_factory=dict)
    offerQualityAnalysis: dict[str, Any] = field(default_factory=dict)
    matchingResult: dict[str, Any] = field(default_factory=dict)
    skillGapSimulation: dict[str, Any] = field(default_factory=dict)
    ragContext: dict[str, Any] = field(default_factory=dict)
    careerAdvice: dict[str, Any] = field(default_factory=dict)
    motivationLetter: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    stepResults: list[dict[str, Any]] = field(default_factory=list)
    debugInfo: dict[str, Any] = field(default_factory=dict)

    def add_step(self, name: str, status: str, used_cached_input: bool = False, warnings: list[str] | None = None, error: str | None = None) -> None:
        result = {
            "name": name,
            "status": status,
            "usedCachedInput": used_cached_input,
            "warnings": warnings or [],
        }
        if error:
            result["error"] = error
        self.stepResults.append(result)
        if warnings:
            self.warnings.extend(warnings)
        if error:
            self.errors.append(error)
