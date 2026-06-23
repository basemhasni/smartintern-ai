"""LangGraph wrapper for Orchestrator V2.

The orchestration logic lives in app.orchestration.orchestrator_v2. This
workflow keeps a graph entry point available without duplicating agent logic.
"""

from __future__ import annotations

from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from app.orchestration.intent_router import build_execution_plan, resolve_intent
from app.orchestration.orchestrator_v2 import orchestrate_v2


class OrchestratorV2WorkflowState(TypedDict, total=False):
    request: dict[str, Any]
    intent: str
    executionPlan: list[dict[str, Any]]
    result: dict[str, Any]
    error: str | None


def validate_request_node(state: OrchestratorV2WorkflowState) -> dict:
    request = state.get("request") or {}
    if not isinstance(request, dict):
        return {"error": "orchestrator request must be an object"}
    return {"error": None}


def detect_intent_node(state: OrchestratorV2WorkflowState) -> dict:
    if state.get("error"):
        return {}
    request = state.get("request") or {}
    intent = resolve_intent(request.get("intent"), request.get("question"))
    return {"intent": intent}


def build_execution_plan_node(state: OrchestratorV2WorkflowState) -> dict:
    if state.get("error"):
        return {}
    request = state.get("request") or {}
    plan = build_execution_plan(state.get("intent") or "UNKNOWN", request.get("options") or {})
    return {"executionPlan": plan}


def run_orchestrator_node(state: OrchestratorV2WorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = orchestrate_v2(state.get("request") or {})
    return {"result": result}


def quality_control_node(state: OrchestratorV2WorkflowState) -> dict:
    if state.get("error"):
        return {}
    result = state.get("result") or {}
    qc = result.get("qualityControl") or {}
    if result.get("status") == "FAILED" and qc.get("blockingIssues"):
        return {"error": "; ".join(qc.get("blockingIssues") or [])}
    return {}


def format_response_node(state: OrchestratorV2WorkflowState) -> dict:
    return {}


def build_orchestrator_v2_workflow():
    workflow = StateGraph(OrchestratorV2WorkflowState)
    workflow.add_node("validate_request", validate_request_node)
    workflow.add_node("detect_intent", detect_intent_node)
    workflow.add_node("build_execution_plan", build_execution_plan_node)
    workflow.add_node("run_orchestrator", run_orchestrator_node)
    workflow.add_node("quality_control", quality_control_node)
    workflow.add_node("format_response", format_response_node)

    workflow.add_edge(START, "validate_request")
    workflow.add_edge("validate_request", "detect_intent")
    workflow.add_edge("detect_intent", "build_execution_plan")
    workflow.add_edge("build_execution_plan", "run_orchestrator")
    workflow.add_edge("run_orchestrator", "quality_control")
    workflow.add_edge("quality_control", "format_response")
    workflow.add_edge("format_response", END)
    return workflow.compile()
