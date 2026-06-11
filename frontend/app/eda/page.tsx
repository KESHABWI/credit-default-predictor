"use client";

import {
  AlertTriangle,
  TrendingUp,
  Wrench,
  Scale,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

const featureGroups = [
  {
    group: "Credit Profile",
    features: "LIMIT_BAL, SEX, AGE",
    description: "Basic client info",
    whyItMatters: "Defines borrowing capacity and demographics",
  },
  {
    group: "Payment Status",
    features: "PAY_0 to PAY_6",
    description: "Monthly repayment delays",
    whyItMatters: "Strongest predictor of default risk",
  },
  {
    group: "Bill Amounts",
    features: "BILL_AMT1 to BILL_AMT6",
    description: "Monthly statement balances",
    whyItMatters: "Shows debt accumulation trend",
  },
  {
    group: "Payment Amounts",
    features: "PAY_AMT1 to PAY_AMT6",
    description: "Actual payments made",
    whyItMatters: "Reveals payment behavior patterns",
  },
  {
    group: "Engineered",
    features: "PAY_RATIO, UTIL_RATE, etc.",
    description: "Derived risk signals",
    whyItMatters: "Captures relationships raw features miss",
  },
];

const keyFindings = [
  {
    icon: AlertTriangle,
    title: "Class Imbalance",
    body: "The dataset has a 3.52:1 imbalance — 77.9% no default vs 22.1% default. A naive model predicting always no-default scores 77.9% accuracy while being completely useless. We applied SMOTE to the training set only to balance classes without leaking test distribution.",
  },
  {
    icon: TrendingUp,
    title: "Payment Status is King",
    body: "PAY_0 (most recent payment status) is the single strongest predictor. Clients with PAY_0 ≥ 1 (at least 1 month delayed) default at 3× the rate of on-time payers. This one feature alone gives ~70% AUC.",
  },
  {
    icon: Wrench,
    title: "Why Feature Engineering",
    body: "Raw features miss key signals. PAY_RATIO (payment / bill) captures whether clients are keeping up with debt. UTIL_RATE shows credit pressure. DELAY_COUNT aggregates all 6 months of payment history into one risk score.",
  },
  {
    icon: Scale,
    title: "Scaling Critical",
    body: "LIMIT_BAL ranges 10,000–800,000. AGE ranges 22–60. Without StandardScaler, gradient descent would be dominated by large-scale features. We fit the scaler on training data only — fitting on full data would be leakage.",
  },
];

const pipelineSteps = [
  {
    n: 1,
    title: "Load Raw Data",
    desc: "30,000 rows × 25 columns from UCI repository",
  },
  {
    n: 2,
    title: "Clip Outliers",
    desc: "Remove extreme values using IQR-based bounds per feature",
  },
  {
    n: 3,
    title: "Encode Categoricals",
    desc: "SEX binary, EDUCATION/MARRIAGE one-hot encoded",
  },
  {
    n: 4,
    title: "Engineer Features",
    desc: "PAY_RATIO×6, TOTAL_BILL, TOTAL_PAID, UTIL_RATE, DELAY_COUNT, MAX_DELAY, AVG_DELAY",
  },
  {
    n: 5,
    title: "Train/Val/Test Split",
    desc: "70% / 15% / 15% stratified split",
  },
  {
    n: 6,
    title: "Apply SMOTE",
    desc: "Oversample minority class on training set only",
  },
  {
    n: 7,
    title: "StandardScaler",
    desc: "Fit on train, transform all splits",
  },
];

function SectionCard({
  title,
  children,
}: {
  title: string;
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
          margin: "0 0 20px 0",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function EdaPage() {
  return (
    <div>
      <PageHeader
        title="Data Analysis"
        subtitle="Exploratory analysis of the UCI credit card dataset"
      />

      {/* Section 1 — Dataset Overview */}
      <SectionCard title="Dataset Overview">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <StatCard title="Total Records" value="30,000" />
          <StatCard title="Features" value="25 → 39" subtitle="Raw to engineered" />
          <StatCard title="Default Rate" value="22.1%" />
          <StatCard title="Time Period" value="Apr–Sep 2005" />
          <StatCard title="Country" value="Taiwan" />
          <StatCard title="Class Ratio" value="3.52:1" subtitle="Non-default : Default" />
        </div>
      </SectionCard>

      {/* Section 2 — Feature Groups */}
      <SectionCard title="Feature Groups">
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
                {["Group", "Features", "Description", "Why It Matters"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6e6e73",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        borderBottom: "1px solid #d2d2d7",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {featureGroups.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < featureGroups.length - 1
                        ? "1px solid #f0f0f5"
                        : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 12px",
                      fontWeight: 500,
                      color: "#1d1d1f",
                    }}
                  >
                    {row.group}
                  </td>
                  <td
                    style={{
                      padding: "14px 12px",
                      color: "#6e6e73",
                      fontFamily: "monospace",
                      fontSize: "13px",
                    }}
                  >
                    {row.features}
                  </td>
                  <td style={{ padding: "14px 12px", color: "#6e6e73" }}>
                    {row.description}
                  </td>
                  <td style={{ padding: "14px 12px", color: "#6e6e73" }}>
                    {row.whyItMatters}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Section 3 — Key Findings */}
      <SectionCard title="Key Findings">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {keyFindings.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              style={{
                backgroundColor: "#f5f5f7",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#ffffff",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color="#6e6e73" />
                </div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6e6e73",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 4 — Preprocessing Pipeline */}
      <SectionCard title="Preprocessing Pipeline">
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {pipelineSteps.map((step, i) => (
            <div
              key={step.n}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                padding: "16px 0",
                borderBottom:
                  i < pipelineSteps.length - 1
                    ? "1px solid #f0f0f5"
                    : "none",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#0071e3",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {step.n}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    margin: "0 0 2px 0",
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6e6e73",
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
