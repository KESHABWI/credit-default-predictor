"use client";

import { useEffect, useState } from "react";
import {
  FlaskConical,
  Layers,
  Shield,
  GitBranch,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { fetchExperiments } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Experiment {
  name?: string;
  experiment_id?: string;
  run_count?: number;
  best_auc?: number;
  [key: string]: unknown;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const searchSpaceRows = [
  {
    parameter: "learning_rate",
    range: "1e-4 – 1e-2",
    bestValue: "0.001",
    why: "Controls gradient step size",
  },
  {
    parameter: "dropout1",
    range: "0.1 – 0.5",
    bestValue: "0.3",
    why: "Regularization in block 1",
  },
  {
    parameter: "dropout2",
    range: "0.1 – 0.5",
    bestValue: "0.3",
    why: "Regularization in block 2",
  },
  {
    parameter: "dropout3",
    range: "0.05 – 0.4",
    bestValue: "0.2",
    why: "Lighter regularization near output",
  },
  {
    parameter: "weight_decay",
    range: "1e-5 – 1e-2",
    bestValue: "0.0001",
    why: "L2 penalty on weights",
  },
  {
    parameter: "batch_size",
    range: "128, 256, 512",
    bestValue: "256",
    why: "Mini-batch gradient stability",
  },
];

const modelComparisonRows = [
  {
    model: "SimpleMLP",
    params: "13,441",
    valAuc: "~0.768",
    testAuc: "~0.762",
    valLoss: "Higher",
    regularization: "ReLU only",
    winner: false,
  },
  {
    model: "DeepMLP",
    params: "~85,000",
    valAuc: "~0.789",
    testAuc: "~0.783",
    valLoss: "Lower",
    regularization: "BN + Dropout",
    winner: true,
  },
];

const whyDeepMlpCards = [
  {
    icon: Layers,
    iconColor: "#0071e3",
    iconBg: "#eff6ff",
    title: "BatchNorm",
    body: "Normalizes layer outputs to mean≈0, std≈1 during training. Allows higher learning rates and acts as mild regularization. SimpleMLP without BatchNorm showed higher variance across runs.",
  },
  {
    icon: Shield,
    iconColor: "#16a34a",
    iconBg: "#f0fdf4",
    title: "Dropout",
    body: "Randomly zeroes 30% of neurons per forward pass during training. Forces redundant representations — no single neuron dominates. Critical for preventing overfitting on SMOTE-augmented training data.",
  },
  {
    icon: GitBranch,
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
    title: "Depth",
    body: "4 blocks vs 3 in SimpleMLP. Deeper networks learn hierarchical representations — early layers detect payment delay patterns, later layers combine them into default risk signals.",
  },
];

const TABLE_HEADERS = [
  "Model",
  "Params",
  "Val AUC",
  "Test AUC",
  "Val Loss",
  "Regularization",
  "Winner",
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        border: "1px solid #d2d2d7",
        marginBottom: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "17px",
          fontWeight: 600,
          color: "#1d1d1f",
          margin: "0 0 4px 0",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "13px",
            color: "#6e6e73",
            margin: "0 0 22px 0",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
      {!subtitle && <div style={{ height: "20px" }} />}
      {children}
    </div>
  );
}

function SkeletonBlock({ height = "80px" }: { height?: string }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: "14px", width: "100%" }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchExperiments();
        setExperiments(data as Experiment[]);
      } catch {
        setError("Could not connect to backend");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Experiments"
        subtitle="Hyperparameter tuning with Optuna + MLflow tracking"
      />

      {/* ── Section 1: Search Space ── */}
      <SectionCard
        title="Optuna Search Space"
        subtitle="Random search over 20 trials. Each trial trains a full DeepMLP and reports val AUC to Optuna."
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                {["Parameter", "Range", "Best Value", "Why"].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "8px 14px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#6e6e73",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #f0f0f5",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searchSpaceRows.map((row, index) => (
                <tr
                  key={row.parameter}
                  style={{
                    borderBottom:
                      index < searchSpaceRows.length - 1
                        ? "1px solid #f8f8f8"
                        : "none",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      "#fafafa";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "14px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: "#0071e3",
                      fontWeight: 500,
                    }}
                  >
                    {row.parameter}
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: "#6e6e73",
                    }}
                  >
                    {row.range}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span
                      style={{
                        backgroundColor: "#f0f7ff",
                        color: "#0071e3",
                        fontWeight: 600,
                        fontSize: "12px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontFamily: "monospace",
                      }}
                    >
                      {row.bestValue}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      fontSize: "13px",
                      color: "#6e6e73",
                    }}
                  >
                    {row.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Section 2: MLflow Experiments ── */}
      <SectionCard title="MLflow Experiments" subtitle="Live data from the backend API.">
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} height="80px" />
            ))}
          </div>
        )}

        {!loading && (error || experiments.length === 0) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "12px",
              padding: "48px 32px",
              backgroundColor: "#fafafa",
              borderRadius: "14px",
              border: "1px dashed #d2d2d7",
            }}
          >
            <FlaskConical size={48} color="#d2d2d7" />
            <div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1d1d1f",
                  margin: "0 0 6px 0",
                }}
              >
                No experiments logged yet
              </p>
              <p style={{ fontSize: "13px", color: "#6e6e73", margin: "0 0 4px 0" }}>
                Run your notebook with{" "}
                <code
                  style={{
                    backgroundColor: "#f0f0f5",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  MLFLOW_TRACKING_URI=http://localhost:5001
                </code>
              </p>
              <a
                href="http://localhost:5001"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "13px",
                  color: "#0071e3",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                    "underline";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                    "none";
                }}
              >
                Open MLflow UI →
              </a>
            </div>
          </div>
        )}

        {!loading && !error && experiments.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {experiments.map((experiment, index) => (
              <div
                key={experiment.experiment_id ?? index}
                style={{
                  backgroundColor: "#fafafa",
                  borderRadius: "14px",
                  padding: "20px 22px",
                  border: "1px solid #f0f0f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 16px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#ffffff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#fafafa";
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FlaskConical size={18} color="#0071e3" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#1d1d1f",
                        margin: 0,
                      }}
                    >
                      {(experiment.name as string) ??
                        `Experiment ${experiment.experiment_id}`}
                    </p>
                    {experiment.run_count != null && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#6e6e73",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {experiment.run_count} run
                        {experiment.run_count !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  {experiment.best_auc != null && (
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#6e6e73",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          margin: "0 0 2px 0",
                          fontWeight: 600,
                        }}
                      >
                        Best AUC
                      </p>
                      <p
                        style={{
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#0071e3",
                          margin: 0,
                        }}
                      >
                        {Number(experiment.best_auc).toFixed(4)}
                      </p>
                    </div>
                  )}
                  <a
                    href="http://localhost:5001"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "13px",
                      color: "#0071e3",
                      textDecoration: "none",
                      fontWeight: 500,
                      padding: "6px 12px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "8px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                        "#dbeafe";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                        "#eff6ff";
                    }}
                  >
                    View in MLflow →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Section 3: Model Comparison ── */}
      <SectionCard
        title="Model Comparison"
        subtitle="SimpleMLP vs DeepMLP trained on identical data splits."
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: "left",
                      padding: "8px 14px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#6e6e73",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #f0f0f5",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelComparisonRows.map((row, index) => (
                <tr
                  key={row.model}
                  onClick={() =>
                    setSelectedRow(selectedRow === index ? null : index)
                  }
                  style={{
                    backgroundColor:
                      selectedRow === index
                        ? "#f0f7ff"
                        : row.winner
                        ? "#f8fbff"
                        : "transparent",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    borderBottom:
                      index < modelComparisonRows.length - 1
                        ? "1px solid #f0f0f5"
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRow !== index) {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        "#fafafa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRow !== index) {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        row.winner ? "#f8fbff" : "transparent";
                    }
                  }}
                >
                  <td
                    style={{
                      padding: "16px 14px",
                      fontWeight: 600,
                      color: "#1d1d1f",
                    }}
                  >
                    {row.model}
                  </td>
                  <td
                    style={{
                      padding: "16px 14px",
                      color: "#6e6e73",
                      fontFamily: "monospace",
                      fontSize: "13px",
                    }}
                  >
                    {row.params}
                  </td>
                  <td
                    style={{
                      padding: "16px 14px",
                      color: "#1d1d1f",
                      fontFamily: "monospace",
                      fontSize: "13px",
                    }}
                  >
                    {row.valAuc}
                  </td>
                  <td
                    style={{
                      padding: "16px 14px",
                      color: "#1d1d1f",
                      fontFamily: "monospace",
                      fontSize: "13px",
                    }}
                  >
                    {row.testAuc}
                  </td>
                  <td style={{ padding: "16px 14px", color: "#6e6e73" }}>
                    {row.valLoss}
                  </td>
                  <td
                    style={{
                      padding: "16px 14px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      color: "#6e6e73",
                    }}
                  >
                    {row.regularization}
                  </td>
                  <td style={{ padding: "16px 14px" }}>
                    {row.winner ? (
                      <span
                        style={{
                          backgroundColor: "#0071e3",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Best
                      </span>
                    ) : (
                      <span style={{ color: "#d2d2d7", fontSize: "13px" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p
            style={{
              fontSize: "12px",
              color: "#6e6e73",
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            Click a row to highlight it.
          </p>
        </div>
      </SectionCard>

      {/* ── Section 4: Why DeepMLP Won ── */}
      <SectionCard title="Why DeepMLP Won">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {whyDeepMlpCards.map(
            ({ icon: Icon, iconColor, iconBg, title, body }) => (
              <div
                key={title}
                style={{
                  backgroundColor: "#fafafa",
                  borderRadius: "14px",
                  padding: "22px",
                  border: "1px solid #f0f0f5",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 16px rgba(0,0,0,0.07)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#ffffff";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#fafafa";
                  (e.currentTarget as HTMLDivElement).style.transform = "none";
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: iconBg,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  <Icon size={20} color={iconColor} />
                </div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    margin: "0 0 10px 0",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6e6e73",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {body}
                </p>
              </div>
            )
          )}
        </div>
      </SectionCard>
    </div>
  );
}
