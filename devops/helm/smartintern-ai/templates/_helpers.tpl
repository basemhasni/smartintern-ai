{{- define "smartintern.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "smartintern.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "smartintern.imageTag" -}}
{{- required "global.imageTag is required and must be an immutable 12-character Git SHA" .Values.global.imageTag -}}
{{- end -}}

{{- define "smartintern.labels" -}}
helm.sh/chart: {{ include "smartintern.chart" . }}
app.kubernetes.io/part-of: smartintern-ai
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ include "smartintern.imageTag" . | quote }}
{{- end -}}

{{- define "smartintern.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/component: {{ .component }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
{{- end -}}
