const fs = require('node:fs');
const path = require('node:path');

const directory = path.join(__dirname, 'dashboards');
const datasource = { type: 'prometheus', uid: 'prometheus' };

function panel(title, expr, index, layout, kind = 'timeseries', unit = 'short', legend = '') {
  const width = kind === 'stat' ? 6 : 12;
  const height = kind === 'stat' ? 5 : 8;
  if (layout.x + width > 24) {
    layout.x = 0;
    layout.y += layout.rowHeight;
    layout.rowHeight = 0;
  }
  const gridPos = { x: layout.x, y: layout.y, w: width, h: height };
  layout.x += width;
  layout.rowHeight = Math.max(layout.rowHeight, height);
  return {
    id: index + 1,
    title,
    type: kind,
    datasource,
    gridPos,
    targets: [{ datasource, expr, refId: 'A', legendFormat: legend }],
    fieldConfig: { defaults: { unit, color: { mode: 'palette-classic' } }, overrides: [] },
    options: kind === 'stat'
      ? { reduceOptions: { calcs: ['lastNotNull'], fields: '', values: false }, colorMode: 'value', graphMode: 'area', textMode: 'auto' }
      : { legend: { displayMode: 'list', placement: 'bottom', showLegend: true }, tooltip: { mode: 'multi', sort: 'none' } },
  };
}

const dashboards = [
  {
    uid: 'smartintern-overview',
    title: 'SmartIntern Overview',
    panels: [
      ['Backend UP', 'min(up{namespace="smartintern-dev",service="backend"})', 'stat'],
      ['AI UP', 'min(up{namespace="smartintern-dev",service="ai-service"})', 'stat'],
      ['PostgreSQL UP', 'max(pg_up{namespace="smartintern-dev"})', 'stat'],
      ['Ready pods', 'sum(kube_pod_status_ready{namespace="smartintern-dev",condition="true"})', 'stat'],
      ['Pod restarts', 'sum(kube_pod_container_status_restarts_total{namespace="smartintern-dev"})', 'stat'],
      ['Node CPU', 'sum(rate(node_cpu_seconds_total{mode!="idle"}[5m]))', 'stat', 'cores'],
      ['Node memory', 'sum(node_memory_MemTotal_bytes-node_memory_MemAvailable_bytes)', 'stat', 'bytes'],
      ['Backend requests/s', 'sum(rate(smartintern_backend_http_requests_total[5m]))', 'stat', 'reqps'],
      ['Backend 5xx/s', 'sum(rate(smartintern_backend_http_requests_total{status_code=~"5.."}[5m]))', 'stat', 'reqps'],
      ['Backend p95 latency', 'histogram_quantile(0.95,sum(rate(smartintern_backend_http_request_duration_seconds_bucket[5m])) by (le))', 'stat', 's'],
      ['AI requests/s', 'sum(rate(smartintern_ai_http_requests_total[5m]))', 'stat', 'reqps'],
      ['AI 5xx/s', 'sum(rate(smartintern_ai_http_requests_total{status_code=~"5.."}[5m]))', 'stat', 'reqps'],
      ['AI p95 latency', 'histogram_quantile(0.95,sum(rate(smartintern_ai_http_request_duration_seconds_bucket[5m])) by (le))', 'stat', 's'],
      ['Ingress requests/s', 'sum(rate(nginx_ingress_controller_requests[5m]))', 'stat', 'reqps'],
    ],
  },
  {
    uid: 'smartintern-backend',
    title: 'SmartIntern Backend',
    panels: [
      ['Availability', 'up{namespace="smartintern-dev",service="backend"}', 'stat'],
      ['Process memory', 'smartintern_backend_process_resident_memory_bytes', 'stat', 'bytes'],
      ['Requests by route', 'sum by (route)(rate(smartintern_backend_http_requests_total[5m]))', 'timeseries', 'reqps', '{{route}}'],
      ['HTTP status codes', 'sum by (status_code)(rate(smartintern_backend_http_requests_total[5m]))', 'timeseries', 'reqps', '{{status_code}}'],
      ['5xx error rate', 'sum(rate(smartintern_backend_http_requests_total{status_code=~"5.."}[5m]))', 'timeseries', 'reqps'],
      ['Latency p50 / p95', 'histogram_quantile(0.95,sum(rate(smartintern_backend_http_request_duration_seconds_bucket[5m])) by (le))', 'timeseries', 's', 'p95'],
      ['Process CPU', 'rate(smartintern_backend_process_cpu_seconds_total[5m])', 'timeseries', 'cores'],
    ],
  },
  {
    uid: 'smartintern-ai',
    title: 'SmartIntern AI Service',
    panels: [
      ['Availability', 'up{namespace="smartintern-dev",service="ai-service"}', 'stat'],
      ['Process memory', 'process_resident_memory_bytes{namespace="smartintern-dev",service="ai-service"}', 'stat', 'bytes'],
      ['Requests by route', 'sum by (route)(rate(smartintern_ai_http_requests_total[5m]))', 'timeseries', 'reqps', '{{route}}'],
      ['HTTP errors', 'sum by (status_code)(rate(smartintern_ai_http_requests_total{status_code=~"5.."}[5m]))', 'timeseries', 'reqps', '{{status_code}}'],
      ['HTTP latency p95', 'histogram_quantile(0.95,sum(rate(smartintern_ai_http_request_duration_seconds_bucket[5m])) by (le))', 'timeseries', 's'],
      ['Workflow calls', 'sum by (workflow)(rate(smartintern_ai_workflow_requests_total[5m]))', 'timeseries', 'reqps', '{{workflow}}'],
      ['Workflow errors', 'sum by (workflow)(rate(smartintern_ai_workflow_requests_total{status_code=~"5.."}[5m]))', 'timeseries', 'reqps', '{{workflow}}'],
      ['Workflow duration p95', 'histogram_quantile(0.95,sum by (le,workflow)(rate(smartintern_ai_workflow_duration_seconds_bucket[5m])))', 'timeseries', 's', '{{workflow}}'],
    ],
  },
  {
    uid: 'smartintern-postgres',
    title: 'SmartIntern PostgreSQL',
    panels: [
      ['PostgreSQL UP', 'max(pg_up{namespace="smartintern-dev"})', 'stat'],
      ['Connections', 'sum(pg_stat_activity_count{namespace="smartintern-dev"})', 'stat'],
      ['Database size', 'sum(pg_database_size_bytes{namespace="smartintern-dev"})', 'stat', 'bytes'],
      ['Transactions/s', 'sum(rate(pg_stat_database_xact_commit{namespace="smartintern-dev"}[5m]))+sum(rate(pg_stat_database_xact_rollback{namespace="smartintern-dev"}[5m]))', 'timeseries', 'ops'],
      ['Locks', 'sum by (mode)(pg_locks_count{namespace="smartintern-dev"})', 'timeseries', 'short', '{{mode}}'],
      ['PostgreSQL pod CPU', 'sum(rate(container_cpu_usage_seconds_total{job="kubernetes-nodes-resource",namespace="smartintern-dev",pod=~"postgres-.*",container="postgres"}[5m]))', 'timeseries', 'cores'],
      ['PostgreSQL pod memory', 'sum(container_memory_working_set_bytes{job="kubernetes-nodes-resource",namespace="smartintern-dev",pod=~"postgres-.*",container="postgres"})', 'timeseries', 'bytes'],
      ['Restarts', 'sum(kube_pod_container_status_restarts_total{namespace="smartintern-dev",container="postgres"})', 'stat'],
    ],
  },
  {
    uid: 'smartintern-kubernetes',
    title: 'SmartIntern Kubernetes',
    panels: [
      ['Ready nodes', 'sum(kube_node_status_condition{condition="Ready",status="true"})', 'stat'],
      ['Ready pods', 'sum(kube_pod_status_ready{namespace="smartintern-dev",condition="true"})', 'stat'],
      ['PVC bound', 'sum(kube_persistentvolumeclaim_status_phase{namespace="smartintern-dev",phase="Bound"})', 'stat'],
      ['Node CPU', 'sum(rate(node_cpu_seconds_total{mode!="idle"}[5m]))', 'timeseries', 'cores'],
      ['Node memory', 'sum(node_memory_MemTotal_bytes-node_memory_MemAvailable_bytes)', 'timeseries', 'bytes'],
      ['Pods by phase', 'sum by (phase)(kube_pod_status_phase{namespace="smartintern-dev"})', 'timeseries', 'short', '{{phase}}'],
      ['Pod restarts', 'sum by (pod)(kube_pod_container_status_restarts_total{namespace="smartintern-dev"})', 'timeseries', 'short', '{{pod}}'],
      ['Deployment replicas', 'sum by (deployment)(kube_deployment_status_replicas_available{namespace="smartintern-dev"})', 'timeseries', 'short', '{{deployment}}'],
      ['StatefulSet ready replicas', 'sum by (statefulset)(kube_statefulset_status_replicas_ready{namespace="smartintern-dev"})', 'timeseries', 'short', '{{statefulset}}'],
      ['Jobs completed', 'sum by (job_name)(kube_job_status_succeeded{namespace="smartintern-dev"})', 'timeseries', 'short', '{{job_name}}'],
    ],
  },
];

fs.mkdirSync(directory, { recursive: true });
for (const dashboard of dashboards) {
  const layout = { x: 0, y: 0, rowHeight: 0 };
  const panels = dashboard.panels.map(([title, expr, kind, unit, legend], index) =>
    panel(title, expr, index, layout, kind, unit, legend));
  const document = {
    id: null,
    uid: dashboard.uid,
    title: dashboard.title,
    tags: ['smartintern', 'observability'],
    timezone: 'browser',
    schemaVersion: 40,
    version: 1,
    refresh: '30s',
    time: { from: 'now-1h', to: 'now' },
    editable: false,
    panels,
  };
  fs.writeFileSync(path.join(directory, `${dashboard.uid}.json`), `${JSON.stringify(document, null, 2)}\n`);
}
