"use client";

import { useEffect, useState } from "react";
import {
  FlaskConical,
  Layers,
  Shield,
  GitBranch,
  ExternalLink,
  Crown,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SkeletonPulse({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

function SectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)] space-y-4">
      <SkeletonPulse className="w-1/4 h-5 rounded" />
      <SkeletonPulse className="w-1/2 h-3.5 rounded" />
      <div className="h-44 bg-[#f5f5f7]/50 rounded-xl flex items-end justify-between p-4">
        {Array.from({ length: 8 }).map((_, i) => {
          const heights = [40, 75, 55, 90, 60, 80, 45, 70];
          const height = heights[i % heights.length];
          return (
            <SkeletonPulse key={i} className="w-8 rounded-t" style={{ height: `${height}%` }} />
          );
        })}
      </div>
      <div className="space-y-2">
        <SkeletonPulse className="w-full h-8 rounded" />
        <SkeletonPulse className="w-full h-8 rounded" />
        <SkeletonPulse className="w-full h-8 rounded" />
      </div>
    </div>
  );
}

function ExperimentSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#d2d2d7]/40 rounded-xl p-5 flex items-center justify-between shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 w-1/3">
            <SkeletonPulse className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 w-full">
              <SkeletonPulse className="w-3/4 h-4 rounded" />
              <SkeletonPulse className="w-1/2 h-3 rounded" />
            </div>
          </div>
          <SkeletonPulse className="w-20 h-6 rounded" />
          <SkeletonPulse className="w-24 h-8 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle, icon: Icon = FlaskConical }: { title: string; subtitle: string; icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="bg-white border border-dashed border-[#d2d2d7] rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
      <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-4">
        <Icon size={22} className="text-[#6e6e73]" />
      </div>
      <p className="font-bold text-sm text-[#1d1d1f] mb-1">{title}</p>
      <p className="text-xs text-[#6e6e73] max-w-sm leading-relaxed">{subtitle}</p>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number | undefined;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-dotted border-[#d2d2d7] last:border-0">
      <span className="text-xs text-[#6e6e73]">{label}</span>
      <span className="text-xs font-semibold text-[#1d1d1f] font-mono">{value ?? "—"}</span>
    </div>
  );
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { payload: { label: string; metrics?: Record<string, number> } }[];
}

function MlRunTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const run = payload[0].payload;
  return (
    <div className="bg-white border border-[#d2d2d7] rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-bold text-[#1d1d1f] mb-1.5">{run.label}</p>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">AUC</span>
        <span className="font-bold text-[#0071e3]">{(run.metrics?.test_roc_auc ?? 0).toFixed(4)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">F1</span>
        <span className="font-semibold text-[#1d1d1f]">{(run.metrics?.test_f1 ?? 0).toFixed(4)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">Recall</span>
        <span className="font-semibold text-[#1d1d1f]">{(run.metrics?.test_recall ?? 0).toFixed(4)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">Precision</span>
        <span className="font-semibold text-[#1d1d1f]">{(run.metrics?.test_precision ?? 0).toFixed(4)}</span>
      </div>
    </div>
  );
}

function DlRunTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const run = payload[0].payload;
  const aucVal = run.metrics?.val_auc ?? run.metrics?.val_roc_auc ?? run.metrics?.test_roc_auc ?? 0;
  return (
    <div className="bg-white border border-[#d2d2d7] rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-bold text-[#1d1d1f] mb-1.5">{run.label}</p>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">Val AUC</span>
        <span className="font-bold text-[#34c759]">{aucVal.toFixed(4)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">Val F1</span>
        <span className="font-semibold text-[#1d1d1f]">{(run.metrics?.val_f1 ?? 0).toFixed(4)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">Val Loss</span>
        <span className="font-semibold text-[#1d1d1f]">{(run.metrics?.val_loss ?? 0).toFixed(4)}</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-[#6e6e73]">Val Acc</span>
        <span className="font-semibold text-[#1d1d1f]">{(run.metrics?.val_accuracy ?? 0).toFixed(4)}</span>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanName(name: string) {
  return name.replace(/^baseline_/, "");
}

interface ExperimentInfo {
  experiment_id: string;
  experiment_name: string;
  total_runs: number;
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentInfo[]>([]);
  const [mlRuns, setMlRuns] = useState<MlflowRun[]>([]);
  const [dlRuns, setDlRuns] = useState<MlflowRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [exps, mlData, dlData] = await Promise.all([
          fetch("http://localhost:8000/api/experiments").then((r) => r.json()),
          fetch("http://localhost:8000/api/experiments/credit_card_default_ML/runs")
            .then((r) => r.json())
            .catch(() => ({ runs: [] })),
          fetch("http://localhost:8000/api/experiments/credit_card_default_DL_MLP/runs")
            .then((r) => r.json())
            .catch(() => ({ runs: [] })),
        ]);

        setExperiments(exps);
        setMlRuns(mlData.runs ?? []);
        setDlRuns(dlData.runs ?? []);

        const bestRun = [...(mlData.runs ?? [])].sort(
          (a, b) => (b.metrics?.test_roc_auc ?? 0) - (a.metrics?.test_roc_auc ?? 0)
        )[0];
        if (bestRun) setSelectedRunId(bestRun.run_id);
      } catch {
        setError("Could not connect to backend. Make sure Docker is running.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Compute best values for Section 2
  const bestMlAuc = mlRuns.length
    ? Math.max(...mlRuns.map((r) => r.metrics?.test_roc_auc ?? 0))
    : null;

  const bestDlAuc = dlRuns.length
    ? Math.max(
        ...dlRuns.map((r) => r.metrics?.val_auc ?? r.metrics?.val_roc_auc ?? r.metrics?.test_roc_auc ?? 0)
      )
    : null;

  const bestMlRun = mlRuns.length
    ? [...mlRuns].sort((a, b) => (b.metrics?.test_roc_auc ?? 0) - (a.metrics?.test_roc_auc ?? 0))[0]
    : null;

  const bestDlRun = dlRuns.length
    ? [...dlRuns].sort(
        (a, b) =>
          (b.metrics?.val_auc ?? b.metrics?.val_roc_auc ?? b.metrics?.test_roc_auc ?? 0) -
          (a.metrics?.val_auc ?? a.metrics?.val_roc_auc ?? a.metrics?.test_roc_auc ?? 0)
      )[0]
    : null;

  // Selected run info lookup
  const activeSelectedRun =
    mlRuns.find((r) => r.run_id === selectedRunId) ??
    dlRuns.find((r) => r.run_id === selectedRunId) ??
    null;

  // Recharts Chart Data Prep
  const mlChartData = mlRuns
    .map((r) => ({
      ...r,
      auc: r.metrics?.test_roc_auc ?? 0,
      label: cleanName(r.run_name),
    }))
    .sort((a, b) => b.auc - a.auc);

  const dlChartData = dlRuns
    .map((r) => ({
      ...r,
      auc: r.metrics?.val_auc ?? r.metrics?.val_roc_auc ?? r.metrics?.test_roc_auc ?? 0,
      label: cleanName(r.run_name),
    }))
    .sort((a, b) => b.auc - a.auc);

  return (
    <div className="space-y-8 pb-16">
      {/* Section 1: Page Header */}
      <PageHeader
        title="Experiments"
        subtitle="Hyperparameter tuning with Optuna — tracked via MLflow"
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-[#fff0f0] border border-[#ffc0c0] rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-[#cf222e]">
          <span className="shrink-0 font-bold">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Section 2: Live Experiments Overview */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold tracking-wider text-[#6e6e73] uppercase">MLflow Experiments</h2>
        {isLoading ? (
          <ExperimentSkeleton />
        ) : experiments.length === 0 ? (
          <EmptyState
            title="No experiments logged"
            subtitle="Start training by running your Python notebooks or scripts."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {experiments
              .filter((e) => e.experiment_name !== "Default")
              .map((exp) => {
                const isDl = exp.experiment_name.includes("DL");
                const currentBestAuc = isDl ? bestDlAuc : bestMlAuc;
                const showPill = currentBestAuc !== null && currentBestAuc > 0.77;

                return (
                  <div
                    key={exp.experiment_id}
                    className="bg-white border border-[#d2d2d7]/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center shrink-0">
                        <FlaskConical size={18} className="text-[#0071e3]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1d1d1f]">{exp.experiment_name}</p>
                        <p className="text-xs text-[#6e6e73]">ID: {exp.experiment_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#f5f5f7] text-[#6e6e73] px-2.5 py-1 rounded-full font-semibold">
                          {exp.total_runs} {exp.total_runs === 1 ? "run" : "runs"}
                        </span>
                      </div>

                      {currentBestAuc !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#6e6e73]">Best AUC:</span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              showPill ? "bg-[#eafaf1] text-[#1a7f37]" : "bg-[#f5f5f7] text-[#6e6e73]"
                            }`}
                          >
                            {currentBestAuc.toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#d2d2d7] italic">No active runs</span>
                      )}
                    </div>

                    <a
                      href="http://localhost:5001"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#0071e3] hover:underline flex items-center gap-1 self-start md:self-auto"
                    >
                      View in MLflow <ArrowRight size={12} />
                    </a>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Section 3: ML Model Runs */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#1d1d1f]">ML Model Runs</h2>
          <p className="text-xs text-[#6e6e73] mt-1">
            All baseline runs tracked in MLflow. Click a row to see full metrics.
          </p>
        </div>

        {isLoading ? (
          <SectionSkeleton />
        ) : mlRuns.length === 0 ? (
          <EmptyState
            title="No ML runs yet"
            subtitle="Run notebook 02_ml_models_hyperparameter_tuning.ipynb to trigger ML runs."
            icon={FlaskConical}
          />
        ) : (
          <div className="space-y-5">
            {/* ML Chart */}
            <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={mlChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6e6e73" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0.7, 0.82]} tickFormatter={(v) => v.toFixed(3)} tick={{ fontSize: 9, fill: "#6e6e73" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<MlRunTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                    <Bar
                      dataKey="auc"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                      style={{ cursor: "pointer" }}
                      onClick={(data: unknown) => {
                        const d = data as { run_id?: string; payload?: { run_id?: string } };
                        const runId = d?.run_id || d?.payload?.run_id;
                        if (runId) setSelectedRunId(runId);
                      }}
                    >
                      {mlChartData.map((entry) => {
                        const isBest = entry.run_id === bestMlRun?.run_id;
                        const isSelected = entry.run_id === selectedRunId;
                        return (
                          <Cell
                            key={entry.run_id}
                            fill={isSelected ? "#0056b3" : isBest ? "#0071e3" : "#d2d2d7"}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ML Table */}
            <div className="bg-white border border-[#d2d2d7]/50 rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f5f5f7] border-b border-[#d2d2d7]/50">
                      <th className="p-4 font-bold text-[#6e6e73]">MODEL</th>
                      <th className="p-4 font-bold text-[#6e6e73]">AUC</th>
                      <th className="p-4 font-bold text-[#6e6e73]">F1</th>
                      <th className="p-4 font-bold text-[#6e6e73]">RECALL</th>
                      <th className="p-4 font-bold text-[#6e6e73]">PRECISION</th>
                      <th className="p-4 font-bold text-[#6e6e73]">THRESHOLD</th>
                      <th className="p-4 font-bold text-[#6e6e73]">TIME</th>
                      <th className="p-4 font-bold text-[#6e6e73]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...mlRuns]
                      .sort((a, b) => (b.metrics?.test_roc_auc ?? 0) - (a.metrics?.test_roc_auc ?? 0))
                      .map((run) => {
                        const isBest = run.run_id === bestMlRun?.run_id;
                        const isSelected = run.run_id === selectedRunId;
                        return (
                          <tr
                            key={run.run_id}
                            onClick={() => setSelectedRunId(run.run_id)}
                            className={`border-b border-[#f0f0f5] cursor-pointer last:border-none transition-all duration-150 ${
                              isSelected ? "bg-[#eff6ff]" : isBest ? "bg-[#f0f7ff]/60" : "hover:bg-[#f5f5f7]"
                            }`}
                          >
                            <td className="p-4 font-bold text-[#1d1d1f] flex items-center gap-2">
                              {cleanName(run.run_name)}
                              {isBest && (
                                <span className="bg-[#0071e3] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Crown size={8} /> Best
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-mono font-semibold text-[#0071e3]">
                              {(run.metrics?.test_roc_auc ?? 0).toFixed(4)}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.test_f1 != null ? run.metrics.test_f1.toFixed(4) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.test_recall != null ? run.metrics.test_recall.toFixed(4) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.test_precision != null ? run.metrics.test_precision.toFixed(4) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.best_threshold != null ? run.metrics.best_threshold.toFixed(2) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.train_time_sec != null ? `${run.metrics.train_time_sec.toFixed(1)}s` : "—"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  run.status === "FINISHED"
                                    ? "bg-[#eafaf1] text-[#1a7f37]"
                                    : "bg-[#f5f5f7] text-[#6e6e73]"
                                }`}
                              >
                                {run.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Selected Run detail */}
      {!isLoading && activeSelectedRun && (
        <section className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50 border-l-4 border-l-[#0071e3] transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#f0f0f5] mb-5 gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-md font-bold text-[#1d1d1f]">{cleanName(activeSelectedRun.run_name)}</h3>
              <span
                className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                  activeSelectedRun.status === "FINISHED" ? "bg-[#eafaf1] text-[#1a7f37]" : "bg-[#f5f5f7] text-[#6e6e73]"
                }`}
              >
                {activeSelectedRun.status}
              </span>
            </div>
            <a
              href={`http://localhost:5001/#/experiments/1/runs/${activeSelectedRun.run_id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#0071e3] hover:underline flex items-center gap-1 self-start md:self-auto"
            >
              View Run in MLflow <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73] mb-3">Metrics</p>
              <div className="space-y-0.5">
                {activeSelectedRun.metrics?.test_roc_auc != null && (
                  <InfoRow label="Test ROC AUC" value={activeSelectedRun.metrics.test_roc_auc.toFixed(4)} />
                )}
                {activeSelectedRun.metrics?.val_auc != null && (
                  <InfoRow label="Val AUC" value={activeSelectedRun.metrics.val_auc.toFixed(4)} />
                )}
                {activeSelectedRun.metrics?.val_roc_auc != null && (
                  <InfoRow label="Val ROC AUC" value={activeSelectedRun.metrics.val_roc_auc.toFixed(4)} />
                )}
                <InfoRow
                  label="F1 Score"
                  value={(activeSelectedRun.metrics?.test_f1 ?? activeSelectedRun.metrics?.val_f1)?.toFixed(4)}
                />
                <InfoRow label="Recall" value={activeSelectedRun.metrics?.test_recall?.toFixed(4)} />
                <InfoRow label="Precision" value={activeSelectedRun.metrics?.test_precision?.toFixed(4)} />
                <InfoRow
                  label="Accuracy"
                  value={(activeSelectedRun.metrics?.test_accuracy ?? activeSelectedRun.metrics?.val_accuracy)?.toFixed(4)}
                />
                <InfoRow label="Best Threshold" value={activeSelectedRun.metrics?.best_threshold?.toFixed(2)} />
                <InfoRow
                  label="Train Time"
                  value={
                    activeSelectedRun.metrics?.train_time_sec != null
                      ? `${activeSelectedRun.metrics.train_time_sec.toFixed(2)}s`
                      : undefined
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6e6e73] mb-3">Parameters & Tags</p>
              <div className="space-y-0.5">
                {Object.entries(activeSelectedRun.params ?? {}).map(([k, v]) => (
                  <InfoRow key={k} label={k} value={v as string} />
                ))}
                {Object.entries(activeSelectedRun.tags ?? {}).map(([k, v]) => (
                  <InfoRow key={k} label={k} value={v as string} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 5: DL Runs */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#1d1d1f]">Deep Learning Runs</h2>
          <p className="text-xs text-[#6e6e73] mt-1">
            All deep learning model configurations evaluated in MLflow.
          </p>
        </div>

        {isLoading ? (
          <SectionSkeleton />
        ) : dlRuns.length === 0 ? (
          <EmptyState
            title="No DL runs yet"
            subtitle="Run notebook 03_deep_learning_hyperparameter_tuning.ipynb to trigger Deep Learning runs."
            icon={FlaskConical}
          />
        ) : (
          <div className="space-y-5">
            {/* DL Chart */}
            <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dlChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6e6e73" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0.7, 0.82]} tickFormatter={(v) => v.toFixed(3)} tick={{ fontSize: 9, fill: "#6e6e73" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<DlRunTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                    <Bar
                      dataKey="auc"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                      style={{ cursor: "pointer" }}
                      onClick={(data: unknown) => {
                        const d = data as { run_id?: string; payload?: { run_id?: string } };
                        const runId = d?.run_id || d?.payload?.run_id;
                        if (runId) setSelectedRunId(runId);
                      }}
                    >
                      {dlChartData.map((entry) => {
                        const isBest = entry.run_id === bestDlRun?.run_id;
                        const isSelected = entry.run_id === selectedRunId;
                        return (
                          <Cell
                            key={entry.run_id}
                            fill={isSelected ? "#0056b3" : isBest ? "#34c759" : "#d2d2d7"}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DL Table */}
            <div className="bg-white border border-[#d2d2d7]/50 rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f5f5f7] border-b border-[#d2d2d7]/50">
                      <th className="p-4 font-bold text-[#6e6e73]">MODEL</th>
                      <th className="p-4 font-bold text-[#6e6e73]">VAL AUC</th>
                      <th className="p-4 font-bold text-[#6e6e73]">VAL F1</th>
                      <th className="p-4 font-bold text-[#6e6e73]">VAL LOSS</th>
                      <th className="p-4 font-bold text-[#6e6e73]">VAL ACCURACY</th>
                      <th className="p-4 font-bold text-[#6e6e73]">THRESHOLD</th>
                      <th className="p-4 font-bold text-[#6e6e73]">TIME</th>
                      <th className="p-4 font-bold text-[#6e6e73]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...dlRuns]
                      .sort(
                        (a, b) =>
                          (b.metrics?.val_auc ?? b.metrics?.val_roc_auc ?? b.metrics?.test_roc_auc ?? 0) -
                          (a.metrics?.val_auc ?? a.metrics?.val_roc_auc ?? a.metrics?.test_roc_auc ?? 0)
                      )
                      .map((run) => {
                        const isBest = run.run_id === bestDlRun?.run_id;
                        const isSelected = run.run_id === selectedRunId;
                        const aucVal = run.metrics?.val_auc ?? run.metrics?.val_roc_auc ?? run.metrics?.test_roc_auc ?? 0;
                        return (
                          <tr
                            key={run.run_id}
                            onClick={() => setSelectedRunId(run.run_id)}
                            className={`border-b border-[#f0f0f5] cursor-pointer last:border-none transition-all duration-150 ${
                              isSelected ? "bg-[#eff6ff]" : isBest ? "bg-[#f2faf3]" : "hover:bg-[#f5f5f7]"
                            }`}
                          >
                            <td className="p-4 font-bold text-[#1d1d1f] flex items-center gap-2">
                               {cleanName(run.run_name)}
                               {isBest && (
                                 <span className="bg-[#34c759] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                   <Crown size={8} /> Best
                                 </span>
                               )}
                            </td>
                            <td className="p-4 font-mono font-semibold text-[#1a7f37]">
                              {aucVal.toFixed(4)}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.val_f1 != null ? run.metrics.val_f1.toFixed(4) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.val_loss != null ? run.metrics.val_loss.toFixed(4) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.val_accuracy != null ? run.metrics.val_accuracy.toFixed(4) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.best_threshold != null ? run.metrics.best_threshold.toFixed(2) : "—"}
                            </td>
                            <td className="p-4 font-mono text-[#6e6e73]">
                              {run.metrics?.train_time_sec != null ? `${run.metrics.train_time_sec.toFixed(1)}s` : "—"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  run.status === "FINISHED"
                                    ? "bg-[#eafaf1] text-[#1a7f37]"
                                    : "bg-[#f5f5f7] text-[#6e6e73]"
                                }`}
                              >
                                {run.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
