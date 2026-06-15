"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import RiskBadge from "@/components/RiskBadge";
import {
  predictDefault,
  fetchModelInfo,
  fetchModels,
  PredictResponse,
  ModelRegistryEntry,
} from "@/lib/api";

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

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  max_consec_delay: "Longest consecutive payment delay",
  avg_pay_delay:    "Average monthly payment delay",
  PAY_0:            "Most recent payment status (Sep)",
  LIMIT_BAL:        "Credit limit — higher = lower risk",
  EDUCATION:        "Education level",
  AGE:              "Client age",
  zero_pay_months:  "Months with zero payment",
  util_rate:        "Credit utilization rate",
  total_payment:    "Total payments over 6 months",
  SEX:              "Gender",
  PAY_2:            "August payment status",
};

const PAY_STATUS_FIELDS = [
  { key: "PAY_0" as const, label: "PAY_0", month: "Sep", badge: "🔴 Critical", highlight: true },
  { key: "PAY_2" as const, label: "PAY_2", month: "Aug", badge: "🔴 Critical", highlight: true },
  { key: "PAY_3" as const, label: "PAY_3", month: "Jul", badge: "🟠 High",     highlight: false },
  { key: "PAY_4" as const, label: "PAY_4", month: "Jun", badge: "🟠 High",     highlight: false },
  { key: "PAY_5" as const, label: "PAY_5", month: "May", badge: "🟡 Medium",   highlight: false },
  { key: "PAY_6" as const, label: "PAY_6", month: "Apr", badge: "🟡 Medium",   highlight: false },
];

const BILL_FIELDS = [
  { key: "BILL_AMT1" as const, month: "Sep (most recent)", note: "Most recent — highest weight" },
  { key: "BILL_AMT2" as const, month: "Aug" },
  { key: "BILL_AMT3" as const, month: "Jul" },
  { key: "BILL_AMT4" as const, month: "Jun" },
  { key: "BILL_AMT5" as const, month: "May" },
  { key: "BILL_AMT6" as const, month: "Apr" },
];

const PAY_AMT_FIELDS = [
  { key: "PAY_AMT1" as const, month: "Sep (most recent)" },
  { key: "PAY_AMT2" as const, month: "Aug" },
  { key: "PAY_AMT3" as const, month: "Jul" },
  { key: "PAY_AMT4" as const, month: "Jun" },
  { key: "PAY_AMT5" as const, month: "May" },
  { key: "PAY_AMT6" as const, month: "Apr" },
];

const initialFormData = {
  LIMIT_BAL: "", SEX: "2", EDUCATION: "2", MARRIAGE: "2", AGE: "",
  PAY_0: "-1", PAY_2: "-1", PAY_3: "-1", PAY_4: "-1", PAY_5: "-1", PAY_6: "-1",
  BILL_AMT1: "", BILL_AMT2: "", BILL_AMT3: "", BILL_AMT4: "", BILL_AMT5: "", BILL_AMT6: "",
  PAY_AMT1: "", PAY_AMT2: "", PAY_AMT3: "", PAY_AMT4: "", PAY_AMT5: "", PAY_AMT6: "",
};

type FormData = typeof initialFormData;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function probabilityColor(p: number): string {
  if (p < 0.3) return "#1a7f37";
  if (p <= 0.6) return "#b45309";
  return "#cf222e";
}

function fmt(val: number | null, decimals = 3): string {
  return val !== null ? val.toFixed(decimals) : "—";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6e6e73] mb-1.5 uppercase tracking-[0.06em]">
      {children}
    </label>
  );
}

function ImpactBadge({
  text,
  variant = "gray",
}: {
  text: string;
  variant?: "red" | "amber" | "gray";
}) {
  const styles = {
    red:   "bg-red-50 text-red-700 border border-red-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    gray:  "bg-[#f5f5f7] text-[#6e6e73]",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[variant]}`}>
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
  return (
    <input
      id={`field-${fieldKey}`}
      type="number"
      placeholder={placeholder}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      className="w-full px-3.5 py-2.5 text-sm text-[#1d1d1f] bg-[#f5f5f7] border border-[#d2d2d7] rounded-[10px] outline-none focus:border-[#0071e3] focus:bg-white transition-colors duration-200 box-border"
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
  return (
    <select
      id={`field-${fieldKey}`}
      value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      className={[
        "w-full px-3.5 py-2.5 text-sm text-[#1d1d1f] rounded-[10px] outline-none cursor-pointer transition-colors duration-200 box-border",
        highlight
          ? "bg-[#fafcff] border-2 border-l-[3px] border-[#0071e3]"
          : "bg-[#f5f5f7] border border-[#d2d2d7] focus:border-[#0071e3] focus:bg-white",
      ].join(" ")}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl px-7 py-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7] mb-4">
      {children}
    </div>
  );
}

function SectionHeader({ label, badge }: { label: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="text-[11px] font-bold text-[#6e6e73] uppercase tracking-[0.1em]">{label}</span>
      {badge}
    </div>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-dotted border-[#e8e8ed] last:border-b-0">
      <span className="text-[13px] text-[#6e6e73]">{label}</span>
      <span className="text-[13px] font-semibold" style={{ color: valueColor ?? "#1d1d1f" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Model Selector ───────────────────────────────────────────────────────────

const MODEL_ORDER = [
  "simple_mlp", "complex_mlp",
  "lightgbm", "xgboost", "catboost", "random_forest", "logistic",
];

function ModelSelector({
  registry,
  loading,
  selected,
  onSelect,
}: {
  registry: Record<string, ModelRegistryEntry>;
  loading: boolean;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const ordered = MODEL_ORDER.filter((k) => k in registry && registry[k].loaded);

  const isDL = (key: string) => registry[key]?.type === "Deep Learning";

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-xl bg-[#d2d2d7]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ordered.map((key) => {
        const entry = registry[key];
        const active = key === selected;
        const dl = isDL(key);
        return (
          <button
            key={key}
            type="button"
            id={`model-btn-${key}`}
            onClick={() => onSelect(key)}
            className={[
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium border transition-all duration-200 cursor-pointer",
              active
                ? dl
                  ? "bg-[#0071e3] text-white border-[#0071e3] shadow-md"
                  : "bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-md"
                : "bg-white text-[#1d1d1f] border-[#d2d2d7] hover:border-[#0071e3] hover:text-[#0071e3]",
            ].join(" ")}
          >
            <span
              className={[
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                active
                  ? "bg-white/20 text-white"
                  : dl
                  ? "bg-[#e8f0fe] text-[#0071e3]"
                  : "bg-[#f0f7ef] text-[#1a7f37]",
              ].join(" ")}
            >
              {dl ? "DL" : "ML"}
            </span>
            {entry.display_name}
            {entry.metrics.roc_auc !== null && (
              <span className={`text-[10px] opacity-70`}>
                {entry.metrics.roc_auc.toFixed(3)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedModel, setSelectedModel] = useState("simple_mlp");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [resultVisible, setResultVisible] = useState(false);

  const [topFeatures, setTopFeatures] = useState<string[]>([]);
  const [modelRegistry, setModelRegistry] = useState<Record<string, ModelRegistryEntry>>({});
  const [registryLoading, setRegistryLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchModelInfo().then((info) => setTopFeatures(info.top_features.slice(0, 5))).catch(() => {}),
      fetchModels()
        .then((reg) => setModelRegistry(reg))
        .catch(() => {}),
    ]).finally(() => setRegistryLoading(false));
  }, []);

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setValidationError(null);

    if (!formData.LIMIT_BAL || !formData.AGE) {
      setValidationError("Please fill in Credit Limit and Age before predicting.");
      return;
    }

    setLoading(true);
    setResultVisible(false);
    setResult(null);

    try {
      const numericPayload: Record<string, number> = {};
      for (const [key, value] of Object.entries(formData)) {
        numericPayload[key] = value === "" ? 0 : Number(value);
      }
      const response = await predictDefault(numericPayload, selectedModel);
      setResult(response);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setResultVisible(true));
      });
    } catch {
      setValidationError("Prediction failed. Check that all fields are filled in correctly.");
    } finally {
      setLoading(false);
    }
  }

  const activeEntry = modelRegistry[selectedModel];

  return (
    <div>
      <PageHeader
        title="Predict"
        subtitle="Enter client details to predict default probability"
      />

      <div className="flex gap-6 items-start">
        {/* ── Left column (58%) ── */}
        <div className="flex-[0_0_58%]">
          <form onSubmit={handleSubmit}>

            {/* ── Model Selector card ── */}
            <SectionCard>
              <SectionHeader label="Select Model" />
              <ModelSelector
                registry={modelRegistry}
                loading={registryLoading}
                selected={selectedModel}
                onSelect={setSelectedModel}
              />

              {/* Selected model metrics row */}
              {activeEntry && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#f0f0f0]">
                  <span className={[
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    activeEntry.type === "Deep Learning"
                      ? "bg-[#e8f0fe] text-[#0071e3]"
                      : "bg-[#f0f7ef] text-[#1a7f37]",
                  ].join(" ")}>
                    {activeEntry.type}
                  </span>
                  <span className="text-[12px] text-[#6e6e73]">
                    Threshold: <strong className="text-[#1d1d1f]">{activeEntry.threshold}</strong>
                  </span>
                  {activeEntry.metrics.roc_auc !== null && (
                    <span className="text-[12px] text-[#6e6e73]">
                      ROC-AUC: <strong className="text-[#1d1d1f]">{fmt(activeEntry.metrics.roc_auc)}</strong>
                    </span>
                  )}
                  {activeEntry.metrics.recall !== null && (
                    <span className="text-[12px] text-[#6e6e73]">
                      Recall: <strong className="text-[#1d1d1f]">{fmt(activeEntry.metrics.recall)}</strong>
                    </span>
                  )}
                  {activeEntry.metrics.f1 !== null && (
                    <span className="text-[12px] text-[#6e6e73]">
                      F1: <strong className="text-[#1d1d1f]">{fmt(activeEntry.metrics.f1)}</strong>
                    </span>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Info banner */}
            <div className="flex items-start gap-2.5 bg-[#f0f7ff] border border-[#b3d4f5] rounded-xl px-4 py-3 mb-4">
              <Zap size={15} className="text-[#0071e3] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#0071e3] m-0 leading-relaxed">
                <strong>max_consec_delay, avg_pay_delay, PAY_0</strong> are the strongest predictors.
                Payment history matters most.
              </p>
            </div>

            {/* ── Client Profile ── */}
            <SectionCard>
              <SectionHeader label="Client Profile" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>
                    Credit Limit
                    <ImpactBadge text="Moderate Impact" variant="amber" />
                  </FieldLabel>
                  <NumberField fieldKey="LIMIT_BAL" placeholder="e.g. 200,000" value={formData.LIMIT_BAL} min={0} onChange={handleChange} />
                </div>
                <div>
                  <FieldLabel>Sex</FieldLabel>
                  <SelectField fieldKey="SEX" options={[{ value: "1", label: "1 — Male" }, { value: "2", label: "2 — Female" }]} value={formData.SEX} onChange={handleChange} />
                </div>
                <div>
                  <FieldLabel>Age</FieldLabel>
                  <NumberField fieldKey="AGE" placeholder="e.g. 35" value={formData.AGE} min={21} max={79} onChange={handleChange} />
                </div>
                <div>
                  <FieldLabel>Education</FieldLabel>
                  <SelectField
                    fieldKey="EDUCATION"
                    options={[
                      { value: "1", label: "1 — Graduate" },
                      { value: "2", label: "2 — University" },
                      { value: "3", label: "3 — High School" },
                      { value: "4", label: "4 — Other" },
                      { value: "5", label: "5 — Unknown" },
                      { value: "6", label: "6 — Unknown" },
                    ]}
                    value={formData.EDUCATION}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-span-2">
                  <FieldLabel>Marital Status</FieldLabel>
                  <SelectField
                    fieldKey="MARRIAGE"
                    options={[{ value: "1", label: "1 — Married" }, { value: "2", label: "2 — Single" }, { value: "3", label: "3 — Other" }]}
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
                badge={<span className="text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Highest Impact</span>}
              />
              <p className="text-[13px] text-[#6e6e73] -mt-2 mb-4 leading-relaxed">
                Payment delays are the strongest predictor. PAY_0 is most recent month (September).
              </p>
              <div className="grid grid-cols-3 gap-4">
                {PAY_STATUS_FIELDS.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>
                      {field.label} — {field.month}
                      <span className="text-[10px] font-semibold">{field.badge}</span>
                    </FieldLabel>
                    <SelectField fieldKey={field.key} options={PAY_OPTIONS} value={formData[field.key]} highlight={field.highlight} onChange={handleChange} />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Bill Amounts ── */}
            <SectionCard>
              <SectionHeader label="Bill Amounts" badge={<ImpactBadge text="Low–Moderate Impact" />} />
              <p className="text-[13px] text-[#6e6e73] -mt-2 mb-4 leading-relaxed">
                Monthly statement balances. Shows debt accumulation trend.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {BILL_FIELDS.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>{field.month}</FieldLabel>
                    <NumberField fieldKey={field.key} placeholder="e.g. 50,000" value={formData[field.key]} onChange={handleChange} />
                    {field.note && <p className="text-[11px] text-[#0071e3] font-medium mt-1">{field.note}</p>}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Payment Amounts ── */}
            <SectionCard>
              <SectionHeader label="Payment Amounts" badge={<ImpactBadge text="Low–Moderate Impact" />} />
              <p className="text-[13px] text-[#6e6e73] -mt-2 mb-4 leading-relaxed">
                Actual payments made each month. Higher payments reduce risk.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {PAY_AMT_FIELDS.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>{field.month}</FieldLabel>
                    <NumberField fieldKey={field.key} placeholder="e.g. 2,000" value={formData[field.key]} onChange={handleChange} />
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Submit */}
            <button
              id="predict-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-[#5aa5f5] disabled:cursor-not-allowed text-white border-none rounded-xl text-[15px] font-medium flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin shrink-0" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Predict Default Risk
                </>
              )}
            </button>

            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mt-3 text-[13px] text-red-700">
                {validationError}
              </div>
            )}
          </form>
        </div>

        {/* ── Right column (42%) ── */}
        <div className="flex-[0_0_42%] sticky top-24">
          {!result ? (
            <div className="bg-white rounded-2xl border border-[#d2d2d7] shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-7 py-12 flex flex-col items-center text-center gap-3.5">
              <Zap size={40} color="#d2d2d7" />
              <div>
                <p className="text-base font-semibold text-[#1d1d1f] mb-1.5">Awaiting Input</p>
                <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                  Select a model, fill in the form, and click Predict
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`bg-white rounded-2xl border border-[#d2d2d7] shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-7 py-8 transition-opacity duration-500 ${resultVisible ? "opacity-100" : "opacity-0"}`}
            >
              {/* Model used badge */}
              <div className="flex justify-center mb-4">
                <span className={[
                  "text-[11px] font-semibold px-3 py-1 rounded-full",
                  modelRegistry[selectedModel]?.type === "Deep Learning"
                    ? "bg-[#e8f0fe] text-[#0071e3]"
                    : "bg-[#f0f7ef] text-[#1a7f37]",
                ].join(" ")}>
                  {result.model_used}
                </span>
              </div>

              {/* Probability */}
              <div className="text-center pt-1 mb-6">
                <p
                  className="text-[56px] font-bold tracking-[-0.03em] leading-none mb-1.5"
                  style={{ color: probabilityColor(result.default_probability) }}
                >
                  {(result.default_probability * 100).toFixed(1)}%
                </p>
                <p className="text-[13px] text-[#6e6e73] mb-3.5">Default Probability</p>
                <div className="flex justify-center">
                  <RiskBadge risk={result.risk_level as "Low" | "Medium" | "High"} />
                </div>
              </div>

              <div className="h-px bg-[#f0f0f0] mb-4" />

              <div className="mb-4">
                <DetailRow label="Will Default" value={result.will_default ? "Yes" : "No"} valueColor={result.will_default ? "#cf222e" : "#1a7f37"} />
                <DetailRow label="Threshold Used" value={String(result.threshold_used)} />
                <DetailRow
                  label="Risk Level"
                  value={result.risk_level}
                  valueColor={result.risk_level === "High" ? "#cf222e" : result.risk_level === "Medium" ? "#b45309" : "#1a7f37"}
                />
              </div>

              <div className="h-px bg-[#f0f0f0] mb-4" />

              {/* Key predictors */}
              <div>
                <p className="text-[14px] font-semibold text-[#1d1d1f] mb-3">Key Predictors</p>
                <div className="bg-[#f5f5f7] rounded-xl p-4 flex flex-col gap-2.5">
                  {topFeatures.length === 0
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-2.5 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-[#d2d2d7] shrink-0 mt-1" />
                          <div className="h-4 bg-[#d2d2d7] rounded w-3/4" />
                        </div>
                      ))
                    : topFeatures.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0 mt-1.5" />
                          <div>
                            <span className="text-[13px] font-semibold text-[#1d1d1f] font-mono">{feature}</span>
                            <span className="text-[12px] text-[#6e6e73] ml-2">{FEATURE_DESCRIPTIONS[feature] ?? ""}</span>
                          </div>
                        </div>
                      ))}
                </div>
                <p className="text-[12px] text-[#6e6e73] text-center mt-3.5 leading-relaxed">
                  Threshold set at {result.threshold_used} — tuned to maximize recall for default detection
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
