import time

from fastapi import Request
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from starlette.responses import Response


HTTP_REQUESTS = Counter(
    "smartintern_ai_http_requests_total",
    "Completed AI service HTTP requests",
    ("method", "route", "status_code"),
)
HTTP_DURATION = Histogram(
    "smartintern_ai_http_request_duration_seconds",
    "AI service HTTP request duration in seconds",
    ("method", "route", "status_code"),
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)
WORKFLOW_REQUESTS = Counter(
    "smartintern_ai_workflow_requests_total",
    "AI workflow HTTP requests",
    ("workflow", "status_code"),
)
WORKFLOW_DURATION = Histogram(
    "smartintern_ai_workflow_duration_seconds",
    "AI workflow HTTP request duration in seconds",
    ("workflow",),
    buckets=(0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30, 60),
)


def _workflow_for_route(route: str) -> str | None:
    if "match" in route:
        return "matching"
    if "letter" in route or "motivation" in route:
        return "motivation_letter"
    return None


def observe_request(request: Request, status_code: int, started_at: float) -> None:
    if request.url.path == "/metrics":
        return
    route = request.scope.get("route")
    route_path = getattr(route, "path", "unmatched")
    duration = time.perf_counter() - started_at
    labels = (request.method, route_path, str(status_code))
    HTTP_REQUESTS.labels(*labels).inc()
    HTTP_DURATION.labels(*labels).observe(duration)
    workflow = _workflow_for_route(route_path)
    if workflow:
        WORKFLOW_REQUESTS.labels(workflow, str(status_code)).inc()
        WORKFLOW_DURATION.labels(workflow).observe(duration)


def metrics_response() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
