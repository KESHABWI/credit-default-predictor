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
  model_type: string;
  input_dim: number;
  hidden_dims: number[];
  decision_threshold: number;
  scaler: string;
  features: string[];
  top_features: string[];
  metrics: {
    roc_auc: number;
    recall: number;
    precision: number;
    f1: number;
    fbeta2: number;
  };
}

export interface PredictResponse {
  default_probability: number;
  will_default: boolean;
  risk_level: string;
  threshold_used: number;
  model_used: string;
}

export interface ModelRegistryEntry {
  display_name: string;
  type: string;
  threshold: number;
  metrics: {
    roc_auc: number | null;
    recall: number | null;
    precision: number | null;
    f1: number | null;
  };
  loaded: boolean;
}

export function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

export function fetchModelInfo(): Promise<ModelInfoResponse> {
  return apiFetch<ModelInfoResponse>("/api/model/info");
}

export function fetchModels(): Promise<Record<string, ModelRegistryEntry>> {
  return apiFetch<Record<string, ModelRegistryEntry>>("/api/models");
}

export function predictDefault(
  input: Record<string, number>,
  modelKey = "simple_mlp"
): Promise<PredictResponse> {
  return apiFetch<PredictResponse>("/api/predict", {
    method: "POST",
    body: JSON.stringify({ model: modelKey, ...input }),
  });
}

// Fetch all experiments with their runs from MLflow
export async function fetchAllExperiments(): Promise<unknown[]> {
  const res = await fetch(`${BASE_URL}/api/experiments`)
  if (!res.ok) throw new Error("Failed to fetch experiments")
  return res.json()
}

// Fetch all runs for a specific experiment
export async function fetchExperimentRuns(experimentName: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/experiments/${encodeURIComponent(experimentName)}/runs`)
  if (!res.ok) throw new Error("Failed to fetch runs")
  return res.json()
}

// Keep existing helper functions
export function fetchExperiments(): Promise<unknown[]> {
  return apiFetch<unknown[]>("/api/experiments");
}

export function fetchMetricHistory(
  runId: string,
  metricName: string
): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/api/runs/${encodeURIComponent(runId)}/metric/${encodeURIComponent(metricName)}`
  );
}
