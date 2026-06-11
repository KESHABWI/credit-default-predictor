"use client";

import { useEffect, useState } from "react";
import { Brain, Layers, Target, Activity } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { fetchHealth, fetchModelInfo, HealthResponse, ModelInfoResponse } from "@/lib/api";

function SkeletonBlock({
  width = "100%",
  height = "20px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "8px" }}
    />
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px dotted #d2d2d7",
      }}
    >
      <span style={{ fontSize: "14px", color: "#6e6e73" }}>{label}</span>
      <span style={{ fontSize: "14px", color: "#1d1d1f", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [h, m] = await Promise.all([fetchHealth(), fetchModelInfo()]);
        setHealth(h);
        setModelInfo(m);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Credit card default prediction overview"
      />

      {error && (
        <div
          style={{
            backgroundColor: "#fff0f0",
            border: "1px solid #fecdca",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#cf222e",
          }}
        >
          {error} — make sure the backend is running on port 8000.
        </div>
      )}

      {/* Stat Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                border: "1px solid #d2d2d7",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <SkeletonBlock width="60%" height="12px" />
              <SkeletonBlock width="40%" height="28px" />
              <SkeletonBlock width="80%" height="12px" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Model"
              value={modelInfo?.model_name ?? "—"}
              subtitle="Active model"
              icon={<Brain size={17} />}
            />
            <StatCard
              title="Features"
              value={modelInfo?.input_dim ?? "—"}
              subtitle="Input dimensions"
              icon={<Layers size={17} />}
            />
            <StatCard
              title="Threshold"
              value={
                modelInfo?.decision_threshold != null
                  ? modelInfo.decision_threshold.toFixed(2)
                  : "—"
              }
              subtitle="Decision threshold"
              icon={<Target size={17} />}
            />
            <StatCard
              title="Status"
              value={health?.status === "healthy" ? "Online" : health?.status ?? "—"}
              subtitle={
                health?.model_loaded ? "Model loaded" : "Model not loaded"
              }
              icon={<Activity size={17} />}
            />
          </>
        )}
      </div>

      {/* Two-column info cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {/* Model Architecture */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            border: "1px solid #d2d2d7",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#1d1d1f",
              margin: "0 0 4px 0",
            }}
          >
            Model Architecture
          </h2>
          <p style={{ fontSize: "13px", color: "#6e6e73", margin: "0 0 20px 0" }}>
            Layer configuration
          </p>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} height="18px" />
              ))}
            </div>
          ) : modelInfo?.architecture ? (
            <div>
              {Object.entries(modelInfo.architecture).map(([block, desc]) => (
                <InfoRow key={block} label={block} value={desc} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#6e6e73" }}>No data</p>
          )}
        </div>

        {/* Hyperparameters */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
            border: "1px solid #d2d2d7",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#1d1d1f",
              margin: "0 0 4px 0",
            }}
          >
            Hyperparameters
          </h2>
          <p style={{ fontSize: "13px", color: "#6e6e73", margin: "0 0 20px 0" }}>
            Training configuration
          </p>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} height="18px" />
              ))}
            </div>
          ) : modelInfo ? (
            <div>
              <InfoRow label="Optimizer" value={modelInfo.optimizer} />
              <InfoRow label="Scheduler" value={modelInfo.scheduler} />
              {Object.entries(modelInfo.optimizer_params ?? {}).map(
                ([k, v]) => (
                  <InfoRow key={k} label={k} value={String(v)} />
                )
              )}
              {Object.entries(modelInfo.dropout_rates ?? {}).map(([k, v]) => (
                <InfoRow key={k} label={`Dropout ${k}`} value={String(v)} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#6e6e73" }}>No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
