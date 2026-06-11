"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import RiskBadge from "@/components/RiskBadge";
import { predictDefault, PredictResponse } from "@/lib/api";

/* ─── Types ──────────────────────────────────────────────────── */
type FormValues = Record<string, number | string>;

const PAY_OPTIONS = [
  { value: "-2", label: "-2 — No consumption" },
  { value: "-1", label: "-1 — Paid in full" },
  { value: "0", label: "0 — Minimum paid" },
  { value: "1", label: "1 — 1 month delay" },
  { value: "2", label: "2 — 2 months delay" },
  { value: "3", label: "3 — 3 months delay" },
  { value: "4", label: "4 — 4 months delay" },
  { value: "5", label: "5 — 5 months delay" },
  { value: "6", label: "6 — 6 months delay" },
  { value: "7", label: "7 — 7 months delay" },
  { value: "8", label: "8 — 8 months delay" },
];

const DEFAULT_VALUES: FormValues = {
  LIMIT_BAL: "",
  SEX: "1",
  EDUCATION: "2",
  MARRIAGE: "2",
  AGE: "",
  PAY_0: "0",
  PAY_2: "0",
  PAY_3: "0",
  PAY_4: "0",
  PAY_5: "0",
  PAY_6: "0",
  BILL_AMT1: "",
  BILL_AMT2: "",
  BILL_AMT3: "",
  BILL_AMT4: "",
  BILL_AMT5: "",
  BILL_AMT6: "",
  PAY_AMT1: "",
  PAY_AMT2: "",
  PAY_AMT3: "",
  PAY_AMT4: "",
  PAY_AMT5: "",
  PAY_AMT6: "",
};

/* ─── Sub-components ─────────────────────────────────────────── */
function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#1d1d1f",
    backgroundColor: "#f5f5f7",
    border: `1px solid ${focused ? "#0071e3" : "#d2d2d7"}`,
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 500,
        color: "#6e6e73",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </label>
  );
}

function NumberInput({
  name,
  placeholder,
  value,
  onChange,
}: {
  name: string;
  placeholder: string;
  value: string | number;
  onChange: (name: string, val: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(focused)}
    />
  );
}

function SelectInput({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string | number;
  onChange: (name: string, val: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), cursor: "pointer" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

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
        padding: "24px 28px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        border: "1px solid #d2d2d7",
        marginBottom: "16px",
      }}
    >
      <h3
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#1d1d1f",
          margin: "0 0 18px 0",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function ResultDivider() {
  return (
    <div
      style={{ height: "1px", backgroundColor: "#d2d2d7", margin: "16px 0" }}
    />
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function PredictPage() {
  const [form, setForm] = useState<FormValues>(DEFAULT_VALUES);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(name: string, val: string) {
    setForm((prev) => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: Record<string, number> = {};
      for (const [k, v] of Object.entries(form)) {
        payload[k] = Number(v);
      }
      const res = await predictDefault(payload);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Prediction failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function probColor(prob: number): string {
    if (prob < 0.3) return "#1a7f37";
    if (prob < 0.6) return "#b45309";
    return "#cf222e";
  }

  return (
    <div>
      <PageHeader
        title="Predict"
        subtitle="Enter client details to predict default probability"
      />

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* ── Left: Form (60%) ── */}
        <div style={{ flex: "0 0 60%" }}>
          <form onSubmit={handleSubmit}>
            {/* Client Profile */}
            <SectionCard title="Client Profile">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormLabel>Credit Limit (LIMIT_BAL)</FormLabel>
                  <NumberInput
                    name="LIMIT_BAL"
                    placeholder="e.g. 50000"
                    value={form.LIMIT_BAL}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <FormLabel>Sex (SEX)</FormLabel>
                  <SelectInput
                    name="SEX"
                    options={[
                      { value: "1", label: "1 — Male" },
                      { value: "2", label: "2 — Female" },
                    ]}
                    value={form.SEX}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <FormLabel>Age (AGE)</FormLabel>
                  <NumberInput
                    name="AGE"
                    placeholder="e.g. 35"
                    value={form.AGE}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <FormLabel>Education (EDUCATION)</FormLabel>
                  <SelectInput
                    name="EDUCATION"
                    options={[
                      { value: "1", label: "1 — Graduate" },
                      { value: "2", label: "2 — University" },
                      { value: "3", label: "3 — High School" },
                      { value: "4", label: "4 — Other" },
                    ]}
                    value={form.EDUCATION}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <FormLabel>Marriage (MARRIAGE)</FormLabel>
                  <SelectInput
                    name="MARRIAGE"
                    options={[
                      { value: "1", label: "1 — Married" },
                      { value: "2", label: "2 — Single" },
                      { value: "3", label: "3 — Other" },
                    ]}
                    value={form.MARRIAGE}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Payment Status */}
            <SectionCard title="Payment Status (PAY_0 is most recent)">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {(
                  [
                    "PAY_0",
                    "PAY_2",
                    "PAY_3",
                    "PAY_4",
                    "PAY_5",
                    "PAY_6",
                  ] as const
                ).map((field) => (
                  <div key={field}>
                    <FormLabel>{field}</FormLabel>
                    <SelectInput
                      name={field}
                      options={PAY_OPTIONS}
                      value={form[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Bill Amounts */}
            <SectionCard title="Bill Amounts">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {(
                  [
                    "BILL_AMT1",
                    "BILL_AMT2",
                    "BILL_AMT3",
                    "BILL_AMT4",
                    "BILL_AMT5",
                    "BILL_AMT6",
                  ] as const
                ).map((field) => (
                  <div key={field}>
                    <FormLabel>{field}</FormLabel>
                    <NumberInput
                      name={field}
                      placeholder="e.g. 12000"
                      value={form[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Payment Amounts */}
            <SectionCard title="Payment Amounts">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {(
                  [
                    "PAY_AMT1",
                    "PAY_AMT2",
                    "PAY_AMT3",
                    "PAY_AMT4",
                    "PAY_AMT5",
                    "PAY_AMT6",
                  ] as const
                ).map((field) => (
                  <div key={field}>
                    <FormLabel>{field}</FormLabel>
                    <NumberInput
                      name={field}
                      placeholder="e.g. 2000"
                      value={form[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
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
                transition: "all 0.2s ease",
              }}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Predicting…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Predict Default Risk
                </>
              )}
            </button>

            {error && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#cf222e",
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}
          </form>
        </div>

        {/* ── Right: Result Panel (40%) ── */}
        <div style={{ flex: "0 0 40%", position: "sticky", top: "0" }}>
          {!result ? (
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
                gap: "12px",
              }}
            >
              <Zap size={40} color="#d2d2d7" />
              <p
                style={{
                  fontSize: "15px",
                  color: "#6e6e73",
                  margin: 0,
                }}
              >
                Fill in the form to see prediction
              </p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "32px 28px",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                border: "1px solid #d2d2d7",
              }}
            >
              {/* Probability */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "52px",
                    fontWeight: 600,
                    color: probColor(result.default_probability),
                    margin: "0 0 4px 0",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {(result.default_probability * 100).toFixed(1)}%
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6e6e73",
                    margin: "0 0 14px 0",
                  }}
                >
                  Default Probability
                </p>
                <RiskBadge
                  risk={result.risk_level as "Low" | "Medium" | "High"}
                />
              </div>

              <ResultDivider />

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#6e6e73" }}>
                    Will Default
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: result.will_default ? "#cf222e" : "#1a7f37",
                    }}
                  >
                    {result.will_default ? "Yes" : "No"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#6e6e73" }}>
                    Threshold Used
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1d1d1f",
                    }}
                  >
                    {result.threshold_used}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .submit-btn:hover:not(:disabled) {
          background-color: #0077ed !important;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
