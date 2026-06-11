"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { fetchExperiments } from "@/lib/api";

interface Experiment {
  name?: string;
  experiment_id?: string;
  run_count?: number;
  best_auc?: number;
  [key: string]: unknown;
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        subtitle="MLflow experiment runs and model comparisons"
      />

      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: "80px", borderRadius: "16px" }}
            />
          ))}
        </div>
      )}

      {!loading && (error || experiments.length === 0) && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "60px 40px",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            border: "1px solid #d2d2d7",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "12px",
          }}
        >
          <FlaskConical size={48} color="#d2d2d7" />
          <h3
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#1d1d1f",
              margin: 0,
            }}
          >
            No experiments logged yet
          </h3>
          <p style={{ fontSize: "14px", color: "#6e6e73", margin: 0 }}>
            Run your notebook to log experiments to MLflow
          </p>
          <p style={{ fontSize: "12px", color: "#6e6e73", margin: 0 }}>
            MLflow UI:{" "}
            <a
              href="http://localhost:5001"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0071e3", textDecoration: "none" }}
            >
              http://localhost:5001
            </a>
          </p>
        </div>
      )}

      {!loading && !error && experiments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {experiments.map((exp, i) => (
            <div
              key={exp.experiment_id ?? i}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "24px 28px",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                border: "1px solid #d2d2d7",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f5f5f7",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FlaskConical size={18} color="#6e6e73" />
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
                    {(exp.name as string) ?? `Experiment ${exp.experiment_id}`}
                  </p>
                  {exp.run_count != null && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6e6e73",
                        margin: "2px 0 0 0",
                      }}
                    >
                      {exp.run_count} run{exp.run_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              {exp.best_auc != null && (
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#6e6e73",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 2px 0",
                    }}
                  >
                    Best AUC
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#1d1d1f",
                      margin: 0,
                    }}
                  >
                    {Number(exp.best_auc).toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
