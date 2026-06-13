"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import RiskBadge from "@/components/RiskBadge";
import { predictDefault, PredictResponse } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAY_OPTIONS = [
  { value: "-2", label: "-2 — No consumption" },
  { value: "-1", label: "-1 — Paid in full" },
  { value: "0",  label: "0 — Minimum paid" },
  { value: "1",  label: "1 — 1 month delay" },
  { value: "2",  label: "2 — 2 months delay" },
  { value: "3",  label: "3 — 3 months delay" },
  { value: "4",  label: "4 — 4 months delay" },
  { value: "5",  label: "5 — 5 months delay" },
  { value: "6",  label: "6 — 6 months delay" },
  { value: "7",  label: "7 — 7 months delay" },
  { value: "8",  label: "8 — 8 months delay" },
];

const initialFormData = {
  LIMIT_BAL: "", SEX: "2", EDUCATION: "2", MARRIAGE: "2", AGE: "",
  PAY_0: "-1", PAY_2: "-1", PAY_3: "-1", PAY_4: "-1", PAY_5: "-1", PAY_6: "-1",
  BILL_AMT1: "", BILL_AMT2: "", BILL_AMT3: "", BILL_AMT4: "", BILL_AMT5: "", BILL_AMT6: "",
  PAY_AMT1: "", PAY_AMT2: "", PAY_AMT3: "", PAY_AMT4: "", PAY_AMT5: "", PAY_AMT6: "",
};

type FormData = typeof initialFormData;

const payStatusFields: {
  key: keyof FormData;
  label: string;
  month: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  highlight: boolean;
}[] = [
  {
    key: "PAY_0", label: "PAY_0", month: "Sep",
    badgeText: "🔴 Critical", badgeBg: "#fff0f0", badgeColor: "#cf222e", badgeBorder: "#ffc0c0",
    highlight: true,
  },
  {
    key: "PAY_2", label: "PAY_2", month: "Aug",
    badgeText: "🔴 Critical", badgeBg: "#fff0f0", badgeColor: "#cf222e", badgeBorder: "#ffc0c0",
    highlight: true,
  },
  {
    key: "PAY_3", label: "PAY_3", month: "Jul",
    badgeText: "🟠 High", badgeBg: "#fff8f0", badgeColor: "#b45309", badgeBorder: "#fcd9b0",
    highlight: false,
  },
  {
    key: "PAY_4", label: "PAY_4", month: "Jun",
    badgeText: "🟠 High", badgeBg: "#fff8f0", badgeColor: "#b45309", badgeBorder: "#fcd9b0",
    highlight: false,
  },
  {
    key: "PAY_5", label: "PAY_5", month: "May",
    badgeText: "🟡 Medium", badgeBg: "#fffdf0", badgeColor: "#92680a", badgeBorder: "#fce588",
    highlight: false,
  },
  {
    key: "PAY_6", label: "PAY_6", month: "Apr",
    badgeText: "🟡 Medium", badgeBg: "#fffdf0", badgeColor: "#92680a", badgeBorder: "#fce588",
    highlight: false,
  },
];

const billAmtFields: { key: keyof FormData; month: string; note?: string }[] = [
  { key: "BILL_AMT1", month: "Sep (most recent)", note: "Most recent — highest weight" },
  { key: "BILL_AMT2", month: "Aug" },
  { key: "BILL_AMT3", month: "Jul" },
  { key: "BILL_AMT4", month: "Jun" },
  { key: "BILL_AMT5", month: "May" },
  { key: "BILL_AMT6", month: "Apr" },
];

const payAmtFields: { key: keyof FormData; month: string }[] = [
  { key: "PAY_AMT1", month: "Sep (most recent)" },
  { key: "PAY_AMT2", month: "Aug" },
  { key: "PAY_AMT3", month: "Jul" },
  { key: "PAY_AMT4", month: "Jun" },
  { key: "PAY_AMT5", month: "May" },
  { key: "PAY_AMT6", month: "Apr" },
];

const topFeatures = [
  { label: "PAY_0", description: "Most recent payment delay — highest weight" },
  { label: "PAY_2", description: "Second month payment status" },
  { label: "PAY_3", description: "Third month payment status" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function probabilityColor(probability: number): string {
  if (probability < 0.3) return "#1a7f37";
  if (probability < 0.6) return "#b45309";
  return "#cf222e";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#6e6e73",
        marginBottom: "7px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </label>
  );
}

function ImpactBadge({
  text,
  bg,
  color,
}: {
  text: string;
  bg: string;
  color: string;
}) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: 600,
        backgroundColor: bg,
        color,
        padding: "2px 7px",
        borderRadius: "999px",
        letterSpacing: "0.02em",
        textTransform: "none" as const,
      }}
    >
      {text}
    </span>
  );
}

function NumberField({
  fieldKey,
  placeholder,
  value,
  min,
  max,
  onChange,
}: {
  fieldKey: string;
  placeholder: string;
  value: string;
  min?: number;
  max?: number;
  onChange: (key: string, val: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "10px 14px",
        fontSize: "14px",
        color: "#1d1d1f",
        backgroundColor: "#f5f5f7",
        border: `1px solid ${focused ? "#0071e3" : "#d2d2d7"}`,
        borderRadius: "10px",
        outline: "none",
        transition: "border-color 0.2s ease",
        boxSizing: "border-box" as const,
      }}
    />
  );
}

function SelectField({
  fieldKey,
  options,
  value,
  highlight,
  onChange,
}: {
  fieldKey: string;
  options: { value: string; label: string }[];
  value: string;
  highlight?: boolean;
  onChange: (key: string, val: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        padding: "10px 14px",
        fontSize: "14px",
        color: "#1d1d1f",
        backgroundColor: highlight ? "#fafcff" : "#f5f5f7",
        border: `1px solid ${focused ? "#0071e3" : highlight ? "#0071e3" : "#d2d2d7"}`,
        borderLeft: highlight ? "2px solid #0071e3" : `1px solid ${focused ? "#0071e3" : "#d2d2d7"}`,
        borderRadius: "10px",
        outline: "none",
        cursor: "pointer",
        transition: "border-color 0.2s ease",
        boxSizing: "border-box" as const,
        appearance: "auto" as const,
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "24px 28px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        border: "1px solid #d2d2d7",
        marginBottom: "16px",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  label,
  badge,
}: {
  label: string;
  badge?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "18px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#6e6e73",
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </span>
      {badge}
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 0",
        borderBottom: "1px dotted #e8e8ed",
      }}
    >
      <span style={{ fontSize: "13px", color: "#6e6e73" }}>{label}</span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: valueColor ?? "#1d1d1f",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultVisible, setResultVisible] = useState(false);

  function handleChange(key: string, value: string) {
    setFormData((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResultVisible(false);
    setResult(null);

    try {
      const numericPayload: Record<string, number> = {};
      for (const [key, value] of Object.entries(formData)) {
        numericPayload[key] = Number(value);
      }
      const response = await predictDefault(numericPayload);
      setResult(response);
      // Tiny delay so the opacity transition is visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setResultVisible(true));
      });
    } catch {
      setError("Prediction failed. Make sure all fields are filled in correctly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Predict"
        subtitle="Enter client details to predict default probability"
      />

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* ────────────────── Left Column (58%) ────────────────── */}
        <div style={{ flex: "0 0 58%" }}>
          <form onSubmit={handleSubmit}>

            {/* ── Important Feature Banner ── */}
            <div
              style={{
                backgroundColor: "#f0f7ff",
                border: "1px solid #b3d4f5",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <Zap size={15} color="#0071e3" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "13px", color: "#0071e3", margin: 0, lineHeight: 1.5 }}>
                <strong>PAY_0, PAY_2, PAY_3</strong> have the highest impact on prediction.
                Fill payment status carefully.
              </p>
            </div>

            {/* ── Client Profile ── */}
            <SectionCard>
              <SectionHeader label="Client Profile" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {/* Credit Limit */}
                <div>
                  <FieldLabel>
                    Credit Limit
                    <ImpactBadge text="Moderate Impact" bg="#fff8f0" color="#b45309" />
                  </FieldLabel>
                  <NumberField
                    fieldKey="LIMIT_BAL"
                    placeholder="e.g. 200,000"
                    value={formData.LIMIT_BAL}
                    onChange={handleChange}
                  />
                </div>

                {/* Sex */}
                <div>
                  <FieldLabel>Sex</FieldLabel>
                  <SelectField
                    fieldKey="SEX"
                    options={[
                      { value: "1", label: "1 — Male" },
                      { value: "2", label: "2 — Female" },
                    ]}
                    value={formData.SEX}
                    onChange={handleChange}
                  />
                </div>

                {/* Age */}
                <div>
                  <FieldLabel>Age</FieldLabel>
                  <NumberField
                    fieldKey="AGE"
                    placeholder="e.g. 35"
                    value={formData.AGE}
                    min={21}
                    max={79}
                    onChange={handleChange}
                  />
                </div>

                {/* Education */}
                <div>
                  <FieldLabel>Education</FieldLabel>
                  <SelectField
                    fieldKey="EDUCATION"
                    options={[
                      { value: "1", label: "1 — Graduate" },
                      { value: "2", label: "2 — University" },
                      { value: "3", label: "3 — High School" },
                      { value: "4", label: "4 — Other" },
                    ]}
                    value={formData.EDUCATION}
                    onChange={handleChange}
                  />
                </div>

                {/* Marriage — full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldLabel>Marital Status</FieldLabel>
                  <SelectField
                    fieldKey="MARRIAGE"
                    options={[
                      { value: "1", label: "1 — Married" },
                      { value: "2", label: "2 — Single" },
                      { value: "3", label: "3 — Other" },
                    ]}
                    value={formData.MARRIAGE}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── Payment Status ── */}
            <SectionCard>
              <SectionHeader
                label="Payment Status"
                badge={
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      backgroundColor: "#fff0f0",
                      color: "#cf222e",
                      border: "1px solid #ffc0c0",
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    Highest Impact
                  </span>
                }
              />
              <p
                style={{
                  fontSize: "13px",
                  color: "#6e6e73",
                  margin: "-10px 0 18px 0",
                  lineHeight: 1.5,
                }}
              >
                Payment delays are the strongest predictor of default. PAY_0 is the most recent month.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {payStatusFields.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>
                      {field.label} — {field.month}
                      <ImpactBadge
                        text={field.badgeText}
                        bg={field.badgeBg}
                        color={field.badgeColor}
                      />
                    </FieldLabel>
                    <SelectField
                      fieldKey={field.key}
                      options={PAY_OPTIONS}
                      value={formData[field.key]}
                      highlight={field.highlight}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Bill Amounts ── */}
            <SectionCard>
              <SectionHeader
                label="Bill Amounts"
                badge={
                  <ImpactBadge text="Low–Moderate Impact" bg="#f5f5f7" color="#6e6e73" />
                }
              />
              <p
                style={{
                  fontSize: "13px",
                  color: "#6e6e73",
                  margin: "-10px 0 18px 0",
                  lineHeight: 1.5,
                }}
              >
                Monthly statement balances over 6 months. Shows debt accumulation trend.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {billAmtFields.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>{field.month}</FieldLabel>
                    <NumberField
                      fieldKey={field.key}
                      placeholder="e.g. 50,000"
                      value={formData[field.key]}
                      onChange={handleChange}
                    />
                    {field.note && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#0071e3",
                          margin: "5px 0 0 0",
                          fontWeight: 500,
                        }}
                      >
                        {field.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Payment Amounts ── */}
            <SectionCard>
              <SectionHeader
                label="Payment Amounts"
                badge={
                  <ImpactBadge text="Low–Moderate Impact" bg="#f5f5f7" color="#6e6e73" />
                }
              />
              <p
                style={{
                  fontSize: "13px",
                  color: "#6e6e73",
                  margin: "-10px 0 18px 0",
                  lineHeight: 1.5,
                }}
              >
                Actual amounts paid each month. Higher payments reduce default risk.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {payAmtFields.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>{field.month}</FieldLabel>
                    <NumberField
                      fieldKey={field.key}
                      placeholder="e.g. 2,000"
                      value={formData[field.key]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Submit Button ── */}
            <button
              type="submit"
              disabled={loading}
              className="predict-submit-btn"
              style={{
                width: "100%",
                height: "48px",
                backgroundColor: loading ? "#5aa5f5" : "#0071e3",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s ease",
              }}
            >
              {loading ? (
                <>
                  <span className="predict-spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Predict Default Risk
                </>
              )}
            </button>

            {/* ── Error Banner ── */}
            {error && (
              <div
                style={{
                  backgroundColor: "#fff0f0",
                  border: "1px solid #fecdca",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#cf222e",
                }}
              >
                {error}
              </div>
            )}
          </form>
        </div>

        {/* ────────────────── Right Column (42%) ────────────────── */}
        <div
          style={{
            flex: "0 0 42%",
            position: "sticky",
            top: "96px",
          }}
        >
          {!result ? (
            /* Empty state */
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "48px 28px",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                border: "1px solid #d2d2d7",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "14px",
              }}
            >
              <Zap size={40} color="#d2d2d7" />
              <div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    margin: "0 0 6px 0",
                  }}
                >
                  Awaiting Input
                </p>
                <p style={{ fontSize: "13px", color: "#6e6e73", margin: 0, lineHeight: 1.5 }}>
                  Fill in the form and click Predict to see the risk assessment
                </p>
              </div>
            </div>
          ) : (
            /* Result card — fades in */
            <div
              style={{
                opacity: resultVisible ? 1 : 0,
                transition: "opacity 0.5s ease",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "32px 28px",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                border: "1px solid #d2d2d7",
              }}
            >
              {/* Probability display */}
              <div
                style={{
                  textAlign: "center",
                  paddingTop: "8px",
                  marginBottom: "24px",
                }}
              >
                <p
                  style={{
                    fontSize: "56px",
                    fontWeight: 700,
                    color: probabilityColor(result.default_probability),
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {(result.default_probability * 100).toFixed(1)}%
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6e6e73",
                    margin: "0 0 14px 0",
                  }}
                >
                  Default Probability
                </p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <RiskBadge risk={result.risk_level as "Low" | "Medium" | "High"} />
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#f0f0f0", marginBottom: "16px" }} />

              {/* Detail rows */}
              <div style={{ marginBottom: "4px" }}>
                <DetailRow
                  label="Will Default"
                  value={result.will_default ? "Yes" : "No"}
                  valueColor={result.will_default ? "#cf222e" : "#1a7f37"}
                />
                <DetailRow
                  label="Threshold Used"
                  value={String(result.threshold_used)}
                />
                <DetailRow
                  label="Risk Level"
                  value={result.risk_level}
                  valueColor={
                    result.risk_level === "High"
                      ? "#cf222e"
                      : result.risk_level === "Medium"
                      ? "#b45309"
                      : "#1a7f37"
                  }
                />
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#f0f0f0",
                  margin: "16px 0",
                }}
              />

              {/* Feature Impact */}
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    margin: "0 0 12px 0",
                  }}
                >
                  What drove this?
                </p>
                <div
                  style={{
                    backgroundColor: "#f5f5f7",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {topFeatures.map((feature) => (
                    <div
                      key={feature.label}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#0071e3",
                          flexShrink: 0,
                          marginTop: "5px",
                        }}
                      />
                      <div>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#1d1d1f",
                            fontFamily: "monospace",
                          }}
                        >
                          {feature.label}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6e6e73",
                            marginLeft: "8px",
                          }}
                        >
                          {feature.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6e6e73",
                    textAlign: "center",
                    margin: "14px 0 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  Threshold set at 0.35 — tuned to maximize recall for default detection
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Global styles ── */}
      <style>{`
        .predict-submit-btn:hover:not(:disabled) {
          background-color: #0077ed !important;
        }
        .predict-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: predict-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes predict-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
