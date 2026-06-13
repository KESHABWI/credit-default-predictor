"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Layers, Target, Activity } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { fetchHealth, fetchModelInfo, HealthResponse, ModelInfoResponse } from "@/lib/api";

// ─── Types & Data ─────────────────────────────────────────────────────────────

const topFeatures = [
  { name: "PAY_0",     correlation: 0.3248, color: "#0071e3", label: "Strongest", isPayment: true },
  { name: "PAY_2",     correlation: 0.2636, color: "#0071e3", label: null, isPayment: true },
  { name: "PAY_3",     correlation: 0.2353, color: "#0071e3", label: null, isPayment: true },
  { name: "PAY_4",     correlation: 0.2166, color: "#0071e3", label: null, isPayment: true },
  { name: "PAY_5",     correlation: 0.2041, color: "#0071e3", label: null, isPayment: true },
  { name: "PAY_6",     correlation: 0.1869, color: "#0071e3", label: null, isPayment: true },
  { name: "LIMIT_BAL", correlation: 0.1535, color: "#34c759", label: null, isPayment: false },
];

const trainingConfig = [
  { label: "Optimizer",     value: "AdamW" },
  { label: "Learning Rate", value: "0.001" },
  { label: "Weight Decay",  value: "0.0001" },
  { label: "Batch Size",    value: "256" },
  { label: "Epochs",        value: "With early stopping" },
  { label: "Loss Function", value: "BCEWithLogitsLoss" },
  { label: "SMOTE",         value: "Yes — train only" },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

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
        padding: "11px 0",
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

function FeatureBar({
  feature,
  visible,
}: {
  feature: (typeof topFeatures)[number];
  visible: boolean;
}) {
  const maxCorrelation = 0.3248; // PAY_0 value
  const widthPercent = (feature.correlation / maxCorrelation) * 100;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "6px 0",
      }}
    >
      {/* Feature name */}
      <div
        style={{
          width: "76px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontFamily: "monospace",
            color: "#1d1d1f",
            fontWeight: 500,
          }}
        >
          {feature.name}
        </span>
        {feature.label && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#0071e3",
              backgroundColor: "#eff6ff",
              padding: "1px 5px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            {feature.label}
          </span>
        )}
      </div>

      {/* Bar track */}
      <div
        style={{
          flex: 1,
          height: "8px",
          backgroundColor: "#f0f0f5",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: visible ? `${widthPercent}%` : "0%",
            backgroundColor: feature.color,
            borderRadius: "4px",
            transition: "width 0.6s ease",
            transitionDelay: "0.05s",
          }}
        />
      </div>

      {/* Value */}
      <div
        style={{
          width: "36px",
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "#6e6e73",
            fontFamily: "monospace",
          }}
        >
          {feature.correlation.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const featureCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [health, modelInfo] = await Promise.all([
          fetchHealth(),
          fetchModelInfo(),
        ]);
        setHealth(health);
        setModelInfo(modelInfo);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Animate bars on mount via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setBarsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (featureCardRef.current) observer.observe(featureCardRef.current);
    return () => observer.disconnect();
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

      {/* ── Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
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
              value={
                health?.status === "healthy" ? "Online" : health?.status ?? "—"
              }
              subtitle={
                health?.model_loaded ? "Model loaded" : "Model not loaded"
              }
              icon={<Activity size={17} />}
            />
          </>
        )}
      </div>

      {/* ── Bottom row: 3 cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        {/* Card 1 — Model Architecture */}
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
          <p
            style={{
              fontSize: "13px",
              color: "#6e6e73",
              margin: "0 0 20px 0",
            }}
          >
            Layer configuration
          </p>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} height="18px" />
              ))}
            </div>
          ) : modelInfo?.architecture ? (
            <div>
              {Object.entries(modelInfo.architecture).map(([block, description]) => (
                <InfoRow key={block} label={block} value={description} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "14px", color: "#6e6e73" }}>No data</p>
          )}
        </div>

        {/* Card 2 — Feature Importance Highlight */}
        <div
          ref={featureCardRef}
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
            Top Predictive Features
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#6e6e73",
              margin: "0 0 20px 0",
            }}
          >
            Ranked by absolute correlation with default
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {topFeatures.map((feature) => (
              <FeatureBar
                key={feature.name}
                feature={feature}
                visible={barsVisible}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px solid #f0f0f5",
              display: "flex",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  backgroundColor: "#0071e3",
                }}
              />
              <span style={{ fontSize: "11px", color: "#6e6e73" }}>
                Payment features
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  backgroundColor: "#34c759",
                }}
              />
              <span style={{ fontSize: "11px", color: "#6e6e73" }}>
                Credit limit
              </span>
            </div>
          </div>
        </div>

        {/* Card 3 — Training Configuration */}
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
            Training Configuration
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#6e6e73",
              margin: "0 0 20px 0",
            }}
          >
            Best hyperparameters from Optuna
          </p>
          <div>
            {trainingConfig.map(({ label, value }) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
