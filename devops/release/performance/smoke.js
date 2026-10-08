import http from 'k6/http';
import { check, sleep } from 'k6';

const backend = __ENV.K6_BACKEND_URL || 'http://backend:5000';
const ai = __ENV.K6_AI_URL || 'http://ai-service:8000';

export const options = {
  vus: 3,
  duration: '20s',
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const backendHealth = http.get(`${backend}/health`);
  const aiHealth = http.get(`${ai}/health`);
  check(backendHealth, { 'backend health 200': (response) => response.status === 200 });
  check(aiHealth, { 'ai health 200': (response) => response.status === 200 });
  sleep(1);
}
