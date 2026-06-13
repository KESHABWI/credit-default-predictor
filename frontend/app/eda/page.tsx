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
  ReferenceLine,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  Wrench,
  Scale,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

// ─── Data ────────────────────────────────────────────────────────────────────

const datasetStats = [
  { title: "Total Records", value: "30,000", subtitle: "Credit card clients" },
  { title: "Raw Features", value: "24", subtitle: "Original columns" },
  { title: "Engineered Features", value: "39", subtitle: "After feature engineering" },
  { title: "Default Rate", value: "22.12%", subtitle: "Positive class rate" },
  { title: "Class Ratio", value: "3.52 : 1", subtitle: "Non-default : Default" },
  { title: "Time Period", value: "Apr – Sep 2005", subtitle: "Taiwan dataset" },
];

const featureCorrelations = [
  { feature: "PAY_0",     correlation: 0.3248, strong: true },
  { feature: "PAY_2",     correlation: 0.2636, strong: true },
  { feature: "PAY_3",     correlation: 0.2353, strong: true },
  { feature: "PAY_4",     correlation: 0.2166, strong: true },
  { feature: "PAY_5",     correlation: 0.2041, strong: true },
  { feature: "PAY_6",     correlation: 0.1869, strong: true },
  { feature: "LIMIT_BAL", correlation: 0.1535, strong: true },
  { feature: "PAY_AMT1",  correlation: 0.0729, strong: false },
  { feature: "PAY_AMT2",  correlation: 0.0586, strong: false },
  { feature: "PAY_AMT4",  correlation: 0.0568, strong: false },
  { feature: "PAY_AMT3",  correlation: 0.0563, strong: false },
  { feature: "PAY_AMT5",  correlation: 0.0551, strong: false },
  { feature: "PAY_AMT6",  correlation: 0.0532, strong: false },
  { feature: "SEX",       correlation: 0.0400, strong: false },
  { feature: "EDUCATION", correlation: 0.0280, strong: false },
];

const educationData = [
  { label: "Graduate",    rate: 19.2 },
  { label: "University",  rate: 23.8 },
  { label: "High School", rate: 25.8 },
  { label: "Other",       rate: 17.5 },
];

const marriageData = [
  { label: "Married", rate: 20.7 },
  { label: "Single",  rate: 23.9 },
  { label: "Other",   rate: 17.0 },
];

const keyFindings = [
  {
    icon: AlertTriangle,
    iconColor: "#f59e0b",
    iconBg: "#fffbeb",
    title: "Class Imbalance",
    body: "77.9% of clients did not default — a 3.52:1 imbalance. A naive classifier predicting always no-default scores 77.9% accuracy while being completely useless. We applied SMOTE to the training set only to balance classes without contaminating validation or test distributions.",
  },
  {
    icon: TrendingUp,
    iconColor: "#0071e3",
    iconBg: "#eff6ff",
    title: "Payment Status Dominates",
    body: "PAY_0 — the most recent payment status — has the highest correlation with default at 0.32. Clients delayed by even 1 month default at 3× the rate of on-time payers. The 6 payment status features collectively account for the majority of model signal.",
  },
  {
    icon: Wrench,
    iconColor: "#16a34a",
    iconBg: "#f0fdf4",
    title: "Why Feature Engineering",
    body: "Raw features miss compound risk signals. PAY_RATIO captures whether clients keep up with their debt each month. UTIL_RATE reveals credit pressure. DELAY_COUNT aggregates 6 months of payment behavior into a single risk score. These 14 engineered features significantly boosted AUC.",
  },
  {
    icon: Scale,
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
    title: "Scaling is Critical",
    body: "LIMIT_BAL ranges 10,000–1,000,000 while AGE ranges 21–79. Without StandardScaler, large-scale features dominate gradients and the network barely learns from small-scale ones. Scaler was fit on training data only — fitting on the full dataset is data leakage.",
  },
];

const pipelineSteps = [
  {
    number: 1,
    title: "Load Raw Data",
    description: "30,000 rows × 24 columns from UCI Credit Card dataset",
  },
  {
    number: 2,
    title: "Encode Categoricals",
    description: "SEX remapped to binary (0/1), EDUCATION and MARRIAGE one-hot encoded into EDU_2/3/4 and MAR_2/3",
  },
  {
    number: 3,
    title: "Engineer 15 Features",
    description: "PAY_RATIO×6, TOTAL_BILL, TOTAL_PAID, OVERALL_PAY_RATIO, UTIL_RATE, DELAY_COUNT, MAX_DELAY, AVG_DELAY, RECENT_DELAY, ZERO_PAY_COUNT, BILL_TREND",
  },
  {
    number: 4,
    title: "Clip Outliers",
    description: "Winsorize continuous features at 1st–99th percentile. LIMIT_BAL clipped to [10,000–500,000], BILL_AMT1 clipped similarly",
  },
  {
    number: 5,
    title: "Train / Val / Test Split",
    description: "70% / 15% / 15% stratified split preserving class ratio",
  },
  {
    number: 6,
    title: "Apply SMOTE",
    description: "Oversample minority (default) class on training set only. Result: balanced 50:50 training distribution",
  },
  {
    number: 7,
    title: "StandardScaler",
    description: "Fit on training data only, transform all splits. Binary and encoded columns left unscaled",
  },
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

interface CorrelationTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { feature: string } }>;
}

function CorrelationTooltip({ active, payload }: CorrelationTooltipProps) {
  if (!active || !payload?.length) return null;
  const { feature } = payload[0].payload;
  const correlation = payload[0].value;
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d2d2d7",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        fontSize: "13px",
      }}
    >
      <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#1d1d1f" }}>
        {feature}
      </p>
      <p style={{ margin: 0, color: "#6e6e73" }}>
        Correlation:{" "}
        <span style={{ color: "#0071e3", fontWeight: 600 }}>
          {correlation.toFixed(4)}
        </span>
      </p>
    </div>
  );
}

interface DemographicsTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function DemographicsTooltip({ active, payload, label }: DemographicsTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d2d2d7",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        fontSize: "13px",
      }}
    >
      <p style={{ margin: "0 0 4px 0", fontWeight: 600, color: "#1d1d1f" }}>
        {label}
      </p>
      <p style={{ margin: 0, color: "#6e6e73" }}>
        Default rate:{" "}
        <span style={{ color: "#0071e3", fontWeight: 600 }}>
          {payload[0].value}%
        </span>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EdaPage() {
  const [barsVisible, setBarsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setBarsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <PageHeader
        title="Data Analysis"
        subtitle="Exploratory analysis of 30,000 credit card clients — Taiwan, Apr–Sep 2005"
      />

      {/* ── Section 1: Dataset Overview ── */}
      <SectionCard title="Dataset Overview">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {datasetStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── Section 2: Feature Importance Chart ── */}
      <SectionCard
        title="Feature Correlation with Default"
        subtitle="PAY_0–PAY_6 are the dominant predictors. Features above the 0.10 threshold (red dashed line) are considered strong signals."
      >
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            layout="vertical"
            data={featureCorrelations}
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 0.36]}
              tickFormatter={(v) => v.toFixed(2)}
              tick={{ fontSize: 12, fill: "#6e6e73" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={80}
              tick={{ fontSize: 12, fill: "#1d1d1f", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CorrelationTooltip />} cursor={{ fill: "rgba(0,113,227,0.04)" }} />
            <ReferenceLine
              x={0.10}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Signal threshold",
                position: "top",
                fontSize: 11,
                fill: "#ef4444",
                fontWeight: 500,
              }}
            />
            <Bar dataKey="correlation" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {featureCorrelations.map((entry) => (
                <Cell
                  key={entry.feature}
                  fill={entry.strong ? "#0071e3" : "#d2d2d7"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ── Section 3: Demographics ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Education Chart */}
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
              fontSize: "17px",
              fontWeight: 600,
              color: "#1d1d1f",
              margin: "0 0 4px 0",
            }}
          >
            Default Rate by Education Level
          </h2>
          <div style={{ height: "220px", marginBottom: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={educationData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6e6e73" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 30]}
                  tick={{ fontSize: 12, fill: "#6e6e73" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DemographicsTooltip />} cursor={{ fill: "rgba(0,113,227,0.04)" }} />
                <Bar dataKey="rate" fill="#0071e3" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#6e6e73",
              margin: 0,
              lineHeight: 1.5,
              borderTop: "1px solid #f0f0f5",
              paddingTop: "12px",
            }}
          >
            Graduate school clients default least — better financial literacy and income stability.
          </p>
        </div>

        {/* Marriage Chart */}
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
              fontSize: "17px",
              fontWeight: 600,
              color: "#1d1d1f",
              margin: "0 0 4px 0",
            }}
          >
            Default Rate by Marital Status
          </h2>
          <div style={{ height: "220px", marginBottom: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={marriageData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6e6e73" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 30]}
                  tick={{ fontSize: 12, fill: "#6e6e73" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DemographicsTooltip />} cursor={{ fill: "rgba(0,113,227,0.04)" }} />
                <Bar dataKey="rate" fill="#0071e3" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#6e6e73",
              margin: 0,
              lineHeight: 1.5,
              borderTop: "1px solid #f0f0f5",
              paddingTop: "12px",
            }}
          >
            Single clients show slightly higher default rates, potentially due to lower household income pooling.
          </p>
        </div>
      </div>

      {/* ── Section 4: Key Findings ── */}
      <SectionCard title="Key Findings">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {keyFindings.map(({ icon: Icon, iconColor, iconBg, title, body }) => (
            <div
              key={title}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid #f0f0f5",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.08)";
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: iconBg,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={iconColor} />
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
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Section 5: Preprocessing Pipeline ── */}
      <SectionCard title="Preprocessing Pipeline" subtitle="Seven sequential steps applied before model training.">
        <div ref={sectionRef} style={{ position: "relative" }}>
          {/* Vertical connector line */}
          <div
            style={{
              position: "absolute",
              left: "13px",
              top: "28px",
              bottom: "28px",
              width: "2px",
              borderLeft: "2px dotted #d2d2d7",
              zIndex: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {pipelineSteps.map((step) => (
              <div
                key={step.number}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "18px",
                  padding: "16px 0",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Circle number */}
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
                    fontWeight: 700,
                    boxShadow: "0 0 0 4px #f5f5f7",
                  }}
                >
                  {step.number}
                </div>
                <div style={{ paddingTop: "3px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1d1d1f",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#6e6e73",
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
