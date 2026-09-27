import unittest
from types import SimpleNamespace

from starlette.requests import Request

from app.core.metrics import metrics_response, observe_request


class MetricsTests(unittest.TestCase):
    def test_metrics_have_normalized_route_and_no_personal_path(self):
        scope = {
            "type": "http",
            "method": "GET",
            "path": "/offers/private-id/match",
            "headers": [],
            "query_string": b"",
            "route": SimpleNamespace(path="/offers/{offer_id}/match"),
        }
        observe_request(Request(scope), 200, 0.0)
        body = metrics_response().body.decode()
        self.assertIn('workflow="matching"', body)
        self.assertIn('route="/offers/{offer_id}/match"', body)
        self.assertNotIn("private-id", body)
        self.assertIn("smartintern_ai_http_requests_total", body)
