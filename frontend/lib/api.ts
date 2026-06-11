const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
}

export interface ModelInfoResponse {
  model_name: string;
  input_dim: number;
  architecture: Record<string, string>;
  dropout_rates: Record<string, number>;
  optimizer: string;
  optimizer_params: Record<string, number>;
  scheduler: string;
  decision_threshold: number;
  features: string[];
}

export interface PredictResponse {
  default_probability: number;
  will_default: boolean;
  risk_level: string;
  threshold_used: number;
}

export function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

export function fetchModelInfo(): Promise<ModelInfoResponse> {
  return apiFetch<ModelInfoResponse>("/api/model/info");
}

export function predictDefault(
  input: Record<string, number>
): Promise<PredictResponse> {
  return apiFetch<PredictResponse>("/api/predict", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchExperiments(): Promise<unknown[]> {
  return apiFetch<unknown[]>("/api/experiments");
}

export function fetchExperimentRuns(experimentName: string): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/experiments/${encodeURIComponent(experimentName)}/runs`
  );
}

export function fetchMetricHistory(
  runId: string,
  metricName: string
): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/api/runs/${encodeURIComponent(runId)}/metric/${encodeURIComponent(metricName)}`
  );
}
