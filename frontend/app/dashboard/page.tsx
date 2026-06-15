"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Brain,
  Layers,
  Target,
  Crown,
  ExternalLink,
  FlaskConical,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RunMetrics {
  test_roc_auc?: number;
  test_f1?: number;
  test_recall?: number;
  test_precision?: number;
  test_accuracy?: number;
  val_roc_auc?: number;
  val_f1?: number;
  val_auc?: number;
  val_loss?: number;
  val_accuracy?: number;
  best_threshold?: number;
  train_time_sec?: number;
  [key: string]: number | undefined;
}

interface MlflowRun {
  run_id: string;
  run_name: string;
  status: string;
  start_time: number;
  metrics: RunMetrics;
  params: Record<string, string>;
  tags: Record<string, string>;
}

interface ExperimentSummary {
  experiment_id: string;
  experiment_name: string;
  total_runs: number;
}

interface HealthData {
  status: string;
  model_loaded: boolean;
}

interface ModelInfo {
  model_name: string;
  input_dim: number;
  decision_threshold: number;
  architecture?: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOP_FEATURES = [
  { name: "DELAY_COUNT", correlation: 0.3984, color: "#34c759", label: "Engineered" },
  { name: "RECENT_DELAY", correlation: 0.3681, color: "#ff6b35", label: "New" },
  { name: "MAX_DELAY", correlation: 0.3310, color: "#34c759", label: "Engineered" },
  { name: "PAY_0", correlation: 0.3248, color: "#0071e3", label: "Original" },
  { name: "AVG_DELAY", correlation: 0.2820, color: "#34c759", label: "Engineered" },
  { name: "PAY_2", correlation: 0.2636, color: "#0071e3", label: "Original" },
  { name: "LIMIT_BAL", correlation: 0.1535, color: "#0071e3", label: "Original" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bestMlRun(runs: MlflowRun[]): MlflowRun | null {
  if (!runs.length) return null;
  return [...runs].sort(
    (a, b) => (b.metrics.test_roc_auc ?? 0) - (a.metrics.test_roc_auc ?? 0)
  )[0];
}

function bestDlRun(runs: MlflowRun[]): MlflowRun | null {
  if (!runs.length) return null;
  return [...runs].sort(
    (a, b) =>
      (b.metrics.val_auc ?? b.metrics.val_roc_auc ?? b.metrics.test_roc_auc ?? 0) -
      (a.metrics.val_auc ?? a.metrics.val_roc_auc ?? a.metrics.test_roc_auc ?? 0)
  )[0];
}

function cleanRunName(name: string): string {
  return name.replace(/^baseline_/, "");
}

function fmt(val: number | undefined, decimals = 4): string {
  if (val === undefined || val === null) return "—";
  return val.toFixed(decimals);
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SkeletonPulse({ width = "100%", height = "16px" }: { width?: string; height?: string }) {
  return <div className="skeleton rounded-lg" style={{ width, height }} />;
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7] flex flex-col gap-3">
      <SkeletonPulse width="45%" height="12px" />
      <SkeletonPulse width="65%" height="28px" />
      <SkeletonPulse width="55%" height="12px" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-dotted border-[#d2d2d7] last:border-0">
      <span className="text-xs text-[#6e6e73]">{label}</span>
      <span className="text-xs font-semibold text-[#1d1d1f] font-mono">{value}</span>
    </div>
  );
}

function MetricPill({
  label,
  value,
  bgColor,
  textColor,
}: {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div
      className="flex flex-col items-center px-3 py-2 rounded-xl"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: textColor }}>
        {label}
      </span>
      <span className="text-sm font-bold" style={{ color: textColor }}>
        {value}
      </span>
    </div>
  );
}

function FeatureBar({
  feature,
  visible,
  isMax,
  delay,
}: {
  feature: (typeof TOP_FEATURES)[number];
  visible: boolean;
  isMax: boolean;
  delay: number;
}) {
  const maxVal = 0.3984;
  const widthPct = (feature.correlation / maxVal) * 100;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-[110px] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-[#1d1d1f]">{feature.name}</span>
          {isMax && (
            <span className="text-[8px] font-bold tracking-wider text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded uppercase">
              Strongest
            </span>
          )}
        </div>
        <span className="text-[9px] text-[#6e6e73]">{feature.label}</span>
      </div>
      <div className="flex-grow bg-[#f0f0f5] h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all ease-out"
          style={{
            width: visible ? `${widthPct}%` : "0%",
            backgroundColor: feature.color,
            transitionDuration: "600ms",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <span className="w-10 text-right text-[11px] font-mono text-[#6e6e73] shrink-0">
        {feature.correlation.toFixed(3)}
      </span>
    </div>
  );
}

interface BarTooltipProps {
  active?: boolean;
  payload?: { payload: MlflowRun & { auc: number } }[];
}

function RunBarTooltip({ active, payload }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const run = payload[0].payload;
  return (
    <div className="bg-white border border-[#d2d2d7] rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-[#1d1d1f] mb-2">{cleanRunName(run.run_name)}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-[#6e6e73]">AUC</span>
          <span className="font-bold text-[#0071e3]">{fmt(run.metrics?.test_roc_auc ?? run.auc, 4)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#6e6e73]">F1</span>
          <span className="font-semibold text-[#1d1d1f]">{fmt(run.metrics?.test_f1)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#6e6e73]">Recall</span>
          <span className="font-semibold text-[#1d1d1f]">{fmt(run.metrics?.test_recall)}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-2xl p-10 border border-[#d2d2d7]/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
        <FlaskConical size={22} className="text-[#6e6e73]" />
      </div>
      <p className="font-semibold text-sm text-[#1d1d1f]">{title}</p>
      <p className="text-xs text-[#6e6e73] max-w-xs">{subtitle}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [mlRuns, setMlRuns] = useState<MlflowRun[]>([]);
  const [dlRuns, setDlRuns] = useState<MlflowRun[]>([]);
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedTab, setSelectedTab] = useState<"ml" | "dl">("ml");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featureCardRef = useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  // Fetch all data in parallel on mount
  useEffect(() => {
    async function load() {
      try {
        const [health, info, mlData, dlData, expList] = await Promise.all([
          fetch("http://localhost:8000/health").then((r) => r.json()),
          fetch("http://localhost:8000/api/model/info").then((r) => r.json()),
          fetch("http://localhost:8000/api/experiments/credit_card_default_ML/runs")
            .then((r) => r.json())
            .catch(() => ({ runs: [] })),
          fetch("http://localhost:8000/api/experiments/credit_card_default_DL_MLP/runs")
            .then((r) => r.json())
            .catch(() => ({ runs: [] })),
          fetch("http://localhost:8000/api/experiments")
            .then((r) => r.json())
            .catch(() => []),
        ]);

        setHealthData(health);
        setModelInfo(info);

        const loadedMlRuns: MlflowRun[] = mlData.runs ?? [];
        const loadedDlRuns: MlflowRun[] = dlData.runs ?? [];

        setMlRuns(loadedMlRuns);
        setDlRuns(loadedDlRuns);
        setExperiments(Array.isArray(expList) ? expList : []);

        // Default selected run: best ML run
        const best = bestMlRun(loadedMlRuns);
        if (best) setSelectedRunId(best.run_id);
      } catch {
        setError("Could not connect to backend. Make sure Docker is running.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Feature bars scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFeaturesVisible(true);
      },
      { threshold: 0.1 }
    );
    if (featureCardRef.current) observer.observe(featureCardRef.current);
    return () => observer.disconnect();
  }, []);

  // Switch tab and reset selected run to that tab's best
  function switchTab(tab: "ml" | "dl") {
    setSelectedTab(tab);
    if (tab === "ml") {
      const best = bestMlRun(mlRuns);
      setSelectedRunId(best ? best.run_id : null);
    } else {
      const best = bestDlRun(dlRuns);
      setSelectedRunId(best ? best.run_id : null);
    }
  }

  const isOnline =
    healthData?.status === "healthy" || healthData?.status === "ok";
  const activeRuns = selectedTab === "ml" ? mlRuns : dlRuns;
  const bestRun =
    selectedTab === "ml" ? bestMlRun(mlRuns) : bestDlRun(dlRuns);
  const selectedRun = activeRuns.find((r) => r.run_id === selectedRunId) ?? null;

  // Build chart data for current tab
  const chartData = activeRuns
    .map((r) => ({
      ...r,
      auc:
        selectedTab === "ml"
          ? (r.metrics.test_roc_auc ?? 0)
          : (r.metrics.val_auc ?? r.metrics.val_roc_auc ?? r.metrics.test_roc_auc ?? 0),
      label: cleanRunName(r.run_name),
    }))
    .sort((a, b) => b.auc - a.auc);

  const mlBestAuc = bestMlRun(mlRuns)?.metrics.test_roc_auc;
  const dlBestAuc = bestDlRun(dlRuns)?.metrics.val_auc ?? bestDlRun(dlRuns)?.metrics.val_roc_auc;

  const yDomain = selectedTab === "ml" ? ([0.70, 0.85] as [number, number]) : ([0.75, 0.85] as [number, number]);
  const bestBarColor = selectedTab === "ml" ? "#0071e3" : "#34c759";

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Live model tracking — powered by MLflow"
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-[#fff0f0] border border-[#ffc0c0] rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-[#cf222e]">
          <span className="shrink-0 font-bold">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Section 2 — 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Active Model"
              value={modelInfo?.model_name ?? "DeepMLP"}
              subtitle="Loaded model"
              icon={<Brain size={17} />}
            />
            <StatCard
              title="Features"
              value={modelInfo?.input_dim ?? 38}
              subtitle="Input dimensions"
              icon={<Layers size={17} />}
            />
            <StatCard
              title="Threshold"
              value={
                modelInfo?.decision_threshold != null
                  ? Number(modelInfo.decision_threshold).toFixed(2)
                  : "0.55"
              }
              subtitle="Decision threshold"
              icon={<Target size={17} />}
            />
            <StatCard
              title="Status"
              value={isOnline ? "Online" : "Offline"}
              subtitle={healthData?.model_loaded ? "Model loaded" : "Model not loaded"}
              icon={
                <span
                  className={`inline-block w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                    isOnline ? "bg-[#34c759]" : "bg-[#cf222e]"
                  }`}
                />
              }
            />
          </>
        )}
      </div>

      {/* Section 3 — ML / DL Tab Switcher */}
      <div className="flex justify-center">
        <div className="bg-[#f5f5f7] p-1 rounded-full flex border border-[#d2d2d7]/30">
          <button
            onClick={() => switchTab("ml")}
            className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              selectedTab === "ml"
                ? "bg-[#0071e3] text-white shadow-sm"
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            ML Models
          </button>
          <button
            onClick={() => switchTab("dl")}
            className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              selectedTab === "dl"
                ? "bg-[#0071e3] text-white shadow-sm"
                : "text-[#6e6e73] hover:text-[#1d1d1f]"
            }`}
          >
            Deep Learning
          </button>
        </div>
      </div>

      {/* Sections 4 & 5 — Conditional Tab Content */}
      {activeRuns.length === 0 ? (
        <EmptyState
          title={
            selectedTab === "ml"
              ? "No ML runs logged yet"
              : "No DL runs logged yet"
          }
          subtitle={
            selectedTab === "ml"
              ? "Run notebook 02_ml_models_hyperparameter_tuning.ipynb with MLFLOW_TRACKING_URI=http://localhost:5001"
              : "Run notebook 03_deep_learning_hyperparameter_tuning.ipynb with MLFLOW_TRACKING_URI=http://localhost:5001"
          }
        />
      ) : (
        <div className="space-y-5">
          {/* Best Run Banner */}
          {bestRun && (
            <div className="bg-white rounded-2xl p-5 border-l-4 border-[#0071e3] shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 flex items-center justify-center shrink-0">
                    <Crown size={17} className="text-[#0071e3]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071e3]">
                      {selectedTab === "ml" ? "Best ML Model" : "Best DL Model"}
                    </span>
                    <p className="text-lg font-bold text-[#1d1d1f] leading-tight">
                      {cleanRunName(bestRun.run_name)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6e6e73]">
                      {bestRun.params.model && <span>{bestRun.params.model}</span>}
                      {bestRun.params.threshold && (
                        <>
                          <span>·</span>
                          <span>Threshold: {parseFloat(bestRun.params.threshold).toFixed(2)}</span>
                        </>
                      )}
                      {bestRun.metrics.train_time_sec !== undefined && (
                        <>
                          <span>·</span>
                          <span>Train: {bestRun.metrics.train_time_sec.toFixed(1)}s</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right — Metric pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedTab === "ml" ? (
                    <>
                      <MetricPill label="AUC" value={fmt(bestRun.metrics.test_roc_auc, 4)} bgColor="#f0f7ff" textColor="#0071e3" />
                      <MetricPill label="F1" value={fmt(bestRun.metrics.test_f1, 4)} bgColor="#f0faf0" textColor="#1a7f37" />
                      <MetricPill label="Recall" value={fmt(bestRun.metrics.test_recall, 4)} bgColor="#fff8f0" textColor="#b45309" />
                      <MetricPill label="Precision" value={fmt(bestRun.metrics.test_precision, 4)} bgColor="#f5f0ff" textColor="#7c3aed" />
                    </>
                  ) : (
                    <>
                      <MetricPill label="Val AUC" value={fmt(bestRun.metrics.val_auc ?? bestRun.metrics.val_roc_auc, 4)} bgColor="#f0f7ff" textColor="#0071e3" />
                      <MetricPill label="Val F1" value={fmt(bestRun.metrics.val_f1, 4)} bgColor="#f0faf0" textColor="#1a7f37" />
                      <MetricPill label="Val Loss" value={fmt(bestRun.metrics.val_loss, 4)} bgColor="#fff8f0" textColor="#b45309" />
                      <MetricPill label="Threshold" value={fmt(bestRun.metrics.best_threshold, 2)} bgColor="#f5f0ff" textColor="#7c3aed" />
                    </>
                  )}
                  <a
                    href="http://localhost:5001"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#0071e3] hover:underline ml-2"
                  >
                    View in MLflow <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-[#1d1d1f]">All Runs — AUC Comparison</h2>
              <p className="text-xs text-[#6e6e73] mt-1">
                Click a bar to inspect that run&apos;s full metrics below.
              </p>
            </div>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#6e6e73" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={yDomain}
                    tickFormatter={(v) => v.toFixed(3)}
                    tick={{ fontSize: 10, fill: "#6e6e73" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<RunBarTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                  <Bar
                    dataKey="auc"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={52}
                    style={{ cursor: "pointer" }}
                    onClick={(data: unknown) => {
                      const d = data as { run_id?: string; payload?: { run_id?: string } };
                      const runId = d?.run_id || d?.payload?.run_id;
                      if (runId) setSelectedRunId(runId);
                    }}
                  >
                    {chartData.map((entry) => {
                      const isBest = entry.run_id === bestRun?.run_id;
                      const isSelected = entry.run_id === selectedRunId;
                      const color = isSelected
                        ? "#0056b3"
                        : isBest
                        ? bestBarColor
                        : "#d2d2d7";
                      return <Cell key={entry.run_id} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Run Detail Card */}
          {selectedRun && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-[#1d1d1f]">
                    {cleanRunName(selectedRun.run_name)}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedRun.status === "FINISHED"
                        ? "bg-[#f0faf0] text-[#1a7f37]"
                        : "bg-[#f5f5f7] text-[#6e6e73]"
                    }`}
                  >
                    {selectedRun.status}
                  </span>
                </div>
                <a
                  href={`http://localhost:5001/#/experiments/1/runs/${selectedRun.run_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-[#0071e3] hover:underline flex items-center gap-1"
                >
                  View Run in MLflow <ExternalLink size={10} />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Metrics */}
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#6e6e73] mb-3">
                    Metrics
                  </h3>
                  <div>
                    {selectedTab === "ml" ? (
                      <>
                        <InfoRow label="Test ROC AUC" value={fmt(selectedRun.metrics.test_roc_auc)} />
                        <InfoRow label="Test F1" value={fmt(selectedRun.metrics.test_f1)} />
                        <InfoRow label="Test Recall" value={fmt(selectedRun.metrics.test_recall)} />
                        <InfoRow label="Test Precision" value={fmt(selectedRun.metrics.test_precision)} />
                        <InfoRow label="Test Accuracy" value={fmt(selectedRun.metrics.test_accuracy)} />
                        <InfoRow label="Best Threshold" value={fmt(selectedRun.metrics.best_threshold, 2)} />
                        <InfoRow label="Train Time" value={selectedRun.metrics.train_time_sec !== undefined ? `${selectedRun.metrics.train_time_sec.toFixed(2)}s` : "—"} />
                      </>
                    ) : (
                      <>
                        <InfoRow label="Val AUC" value={fmt(selectedRun.metrics.val_auc ?? selectedRun.metrics.val_roc_auc)} />
                        <InfoRow label="Val F1" value={fmt(selectedRun.metrics.val_f1)} />
                        <InfoRow label="Val Loss" value={fmt(selectedRun.metrics.val_loss)} />
                        <InfoRow label="Val Accuracy" value={fmt(selectedRun.metrics.val_accuracy)} />
                        <InfoRow label="Best Threshold" value={fmt(selectedRun.metrics.best_threshold, 2)} />
                        <InfoRow label="Train Time" value={selectedRun.metrics.train_time_sec !== undefined ? `${selectedRun.metrics.train_time_sec.toFixed(2)}s` : "—"} />
                      </>
                    )}
                  </div>
                </div>

                {/* Params + Tags */}
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#6e6e73] mb-3">
                    Parameters
                  </h3>
                  <div>
                    {Object.entries(selectedRun.params).map(([k, v]) => (
                      <InfoRow key={k} label={k} value={v} />
                    ))}
                  </div>
                  {Object.keys(selectedRun.tags).length > 0 && (
                    <>
                      <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#6e6e73] mb-3 mt-5">
                        Tags
                      </h3>
                      <div>
                        {Object.entries(selectedRun.tags).map(([k, v]) => (
                          <InfoRow key={k} label={k} value={v} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Section 6 — Bottom 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Top Predictive Features */}
        <div
          ref={featureCardRef}
          className="bg-white rounded-2xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
        >
          <h2 className="text-sm font-semibold text-[#1d1d1f] mb-1">Top Predictive Features</h2>
          <p className="text-xs text-[#6e6e73] mb-5">Pearson |r| with default, ranked.</p>

          <div className="space-y-2">
            {TOP_FEATURES.map((feature, idx) => (
              <FeatureBar
                key={feature.name}
                feature={feature}
                visible={featuresVisible}
                isMax={idx === 0}
                delay={idx * 80}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-5 pt-4 border-t border-[#f0f0f5]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#0071e3]" />
              <span className="text-[10px] text-[#6e6e73]">Original</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#34c759]" />
              <span className="text-[10px] text-[#6e6e73]">Engineered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#ff6b35]" />
              <span className="text-[10px] text-[#6e6e73]">New</span>
            </div>
          </div>
        </div>

        {/* Card 2: Experiments Summary */}
        <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)] flex flex-col">
          <h2 className="text-sm font-semibold text-[#1d1d1f] mb-1">Experiments</h2>
          <p className="text-xs text-[#6e6e73] mb-5">All logged MLflow experiments.</p>

          <div className="flex-grow space-y-3">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-3 bg-[#f5f5f7] rounded-xl flex flex-col gap-2">
                  <SkeletonPulse width="60%" height="10px" />
                  <SkeletonPulse width="40%" height="10px" />
                </div>
              ))
            ) : (
              experiments
                .filter((e) => e.experiment_name !== "Default")
                .map((exp, idx, arr) => {
                  const isMl = exp.experiment_name.includes("ML");
                  const bestAuc = isMl ? mlBestAuc : dlBestAuc;
                  return (
                    <div key={exp.experiment_id}>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-xs font-bold text-[#1d1d1f] truncate max-w-[160px]">
                            {exp.experiment_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-[#f5f5f7] text-[#6e6e73] px-1.5 py-0.5 rounded font-semibold">
                              {exp.total_runs} {exp.total_runs === 1 ? "run" : "runs"}
                            </span>
                            <span className="text-[10px] text-[#6e6e73]">
                              Best AUC:{" "}
                              <span className="font-bold text-[#34c759]">
                                {bestAuc != null ? bestAuc.toFixed(4) : "—"}
                              </span>
                            </span>
                          </div>
                        </div>
                        <a
                          href="http://localhost:5001"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-[#0071e3] hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          View <ArrowRight size={10} />
                        </a>
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="border-t border-[#f0f0f5]" />
                      )}
                    </div>
                  );
                })
            )}
            {!isLoading && experiments.filter((e) => e.experiment_name !== "Default").length === 0 && (
              <p className="text-xs text-[#6e6e73] text-center py-4">
                No experiments logged yet — run your notebooks.
              </p>
            )}
          </div>

          <a
            href="http://localhost:5001"
            target="_blank"
            rel="noreferrer"
            className="mt-5 pt-4 border-t border-[#f0f0f5] flex items-center justify-between text-xs font-semibold text-[#0071e3] hover:underline"
          >
            <span>Open MLflow UI</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
