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
  PieChart,
  Pie,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Users,
  Database,
  Layers,
  Cpu,
  Percent,
  Scale,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

// ─── Data ────────────────────────────────────────────────────────────────────

const datasetStats = [
  { title: "Total Records", value: "30,000", subtitle: "Credit card clients", icon: <Database size={16} /> },
  { title: "Raw Features", value: "24", subtitle: "Original columns", icon: <Layers size={16} /> },
  { title: "Engineered Features", value: "39", subtitle: "After feature engineering", icon: <Cpu size={16} /> },
  { title: "Default Rate", value: "22.12%", subtitle: "Positive class rate", icon: <Percent size={16} /> },
  { title: "Class Ratio", value: "3.52 : 1", subtitle: "Non-default : Default", icon: <Scale size={16} /> },
  { title: "Period", value: "Apr – Sep 2005", subtitle: "Taiwan dataset", icon: <Calendar size={16} /> },
];

const classDistributionData = [
  { name: "No Default", value: 23364, percentage: 77.88 },
  { name: "Default", value: 6636, percentage: 22.12 },
];

const featureCorrelations = [
  { feature: "DELAY_COUNT", correlation: 0.3984, type: "Engineered" },
  { feature: "RECENT_DELAY", correlation: 0.3681, type: "New" },
  { feature: "MAX_DELAY", correlation: 0.3310, type: "Engineered" },
  { feature: "PAY_0", correlation: 0.3248, type: "Original" },
  { feature: "AVG_DELAY", correlation: 0.2820, type: "Engineered" },
  { feature: "PAY_2", correlation: 0.2636, type: "Original" },
  { feature: "PAY_3", correlation: 0.2353, type: "Original" },
  { feature: "PAY_4", correlation: 0.2166, type: "Original" },
  { feature: "PAY_5", correlation: 0.2041, type: "Original" },
  { feature: "PAY_6", correlation: 0.1869, type: "Original" },
  { feature: "ZERO_PAY_COUNT", correlation: 0.1634, type: "New" },
  { feature: "LIMIT_BAL", correlation: 0.1535, type: "Original" },
  { feature: "TOTAL_PAID", correlation: 0.1024, type: "Engineered" },
  { feature: "UTIL_RATE", correlation: 0.0878, type: "Engineered" },
  { feature: "OVERALL_PAY_RATIO", correlation: 0.0805, type: "Engineered" },
  { feature: "PAY_RATIO_3", correlation: 0.0796, type: "Engineered" },
  { feature: "PAY_RATIO_2", correlation: 0.0759, type: "Engineered" },
  { feature: "PAY_RATIO_4", correlation: 0.0730, type: "Engineered" },
  { feature: "PAY_AMT1", correlation: 0.0729, type: "Original" },
  { feature: "PAY_RATIO_6", correlation: 0.0711, type: "Engineered" },
  { feature: "PAY_RATIO_1", correlation: 0.0674, type: "Engineered" },
  { feature: "PAY_RATIO_5", correlation: 0.0608, type: "Engineered" },
];

const genderData = [
  { label: "Male", rate: 24.2 },
  { label: "Female", rate: 20.8 },
];

const educationData = [
  { label: "Graduate", rate: 19.2 },
  { label: "University", rate: 23.8 },
  { label: "High School", rate: 25.8 },
  { label: "Other", rate: 17.5 },
];

const marriageData = [
  { label: "Married", rate: 20.7 },
  { label: "Single", rate: 23.9 },
  { label: "Other", rate: 17.0 },
];

const ageData = [
  { ageGroup: "21–25", rate: 26.8 },
  { ageGroup: "26–30", rate: 24.3 },
  { ageGroup: "31–35", rate: 22.1 },
  { ageGroup: "36–40", rate: 20.8 },
  { ageGroup: "41–50", rate: 19.4 },
  { ageGroup: "51–60", rate: 18.9 },
  { ageGroup: "61+", rate: 21.2 },
];

const qualityIssues = [
  {
    issue: "Class imbalance (22% default)",
    ml: "class_weight='balanced' | scale_pos_weight=3.52",
    dl: "SMOTE on training set only",
    explanation: "Standard models suffer when classes are highly skewed. Tuning weights is clean for tree models, while synthetic oversampling (SMOTE) balanced training for deep learning convergence."
  },
  {
    issue: "EDUCATION has undocumented values 0,5,6",
    ml: "Collapse 0,5,6 → 'Unknown', ordinal encode",
    dl: "One-hot encode (collapsed to 4 categories)",
    explanation: "Undocumented values violate assumptions of strict demographic categories. Collapsing these low-density codes prevents sparse dummy matrices and data leakage."
  },
  {
    issue: "MARRIAGE has undocumented value 0",
    ml: "Collapse 0 → 'Unknown', ordinal encode",
    dl: "One-hot encode (3 categories)",
    explanation: "Marital code 0 occurs in less than 0.2% of cases. Grouping it under 'Other' prevents numerical singularities in dense layers."
  },
  {
    issue: "BILL_AMT1–6 are heavily right-skewed",
    ml: "log1p transform → RobustScaler",
    dl: "Clip outliers + StandardScaler + BatchNorm",
    explanation: "Raw card balances range by six orders of magnitude. For neural nets, standard scaling with clipping handles the extreme positive tail skew."
  },
  {
    issue: "BILL_AMT1–6 are highly correlated (r>0.9)",
    ml: "Keep all for trees | PCA(2) for LR",
    dl: "BatchNorm + Dropout handles multicollinearity",
    explanation: "Multicollinearity inflates standard errors in traditional regression. Deep models use active regularizers like Dropout to isolate orthogonal signals."
  },
  {
    issue: "PAY_0 is strongest predictor",
    ml: "Keep raw + engineer max_delay, times_delayed",
    dl: "Engineer DELAY_COUNT, RECENT_DELAY, AVG_DELAY",
    explanation: "The most recent payment state is historically most critical. Aggregating multi-month history prevents reliance on transient monthly fluctuations."
  },
  {
    issue: "LIMIT_BAL: higher = less default",
    ml: "Keep continuous, standard scale",
    dl: "StandardScaler, feed as float32",
    explanation: "High credit limit correlates with low default rates. Correct continuous scaling exposes this linear separator to the neural network directly."
  },
  {
    issue: "Negative BILL_AMT values (overpayments)",
    ml: "Clip to 0 before log1p",
    dl: "Clip to 0 before log1p",
    explanation: "Negative billing states indicate overpayment of balances. Zeroing out negative values prevents complex logarithm errors and aligns with standard debt definitions."
  },
  {
    issue: "PAY_AMT outliers (max = 1.68M NTD)",
    ml: "Winsorize at 99th percentile for LR | keep for trees",
    dl: "Clip + gradient clipping in training",
    explanation: "Individual payment sizes can be massive. Standard scaling remains sensitive to these, so clipping extreme outliers bounds gradient updates."
  },
  {
    issue: "Defaulters show rising bill + flat payments",
    ml: "Engineer bill_trend, pay_to_bill_ratio",
    dl: "Feed BILL_TREND as engineered feature to MLP",
    explanation: "A growing divergence between bill size and payments indicates cash flow distress. Feeding this delta directly captures joint dynamics."
  }
];

const keyFindings = [
  {
    icon: AlertTriangle,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-50",
    title: "Class Imbalance",
    description: "77.9% no-default vs 22.1% default — 3.52:1 ratio. A naive classifier predicting always no-default scores 77.9% accuracy while detecting zero actual defaults. We applied SMOTE to the training set only — never to validation or test — to avoid contaminating evaluation metrics.",
  },
  {
    icon: TrendingUp,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-50",
    title: "Payment Status Dominates",
    description: "PAY_0 alone gives ~70% AUC. But our engineered DELAY_COUNT (counting all 6 months of delays) outperforms PAY_0 with 0.398 correlation vs 0.325. Feature engineering turned 6 correlated payment columns into 4 powerful aggregate signals.",
  },
  {
    icon: BarChart2,
    colorClass: "text-green-500",
    bgClass: "bg-green-50",
    title: "Bill Amounts Are Tricky",
    description: "BILL_AMT1–6 are highly correlated (r>0.9) and heavily right-skewed. Raw values range from -165,000 to 964,511 NTD. We clip outliers, apply StandardScaler, and let BatchNorm handle the remaining distribution shift during training.",
  },
  {
    icon: Users,
    colorClass: "text-purple-500",
    bgClass: "bg-purple-50",
    title: "Young Adults Default Most",
    description: "Clients aged 21–25 default at 26.8% — 4.7 points above the overall average. Risk decreases steadily with age until 51–60 (18.9%), then rises slightly for 61+. Age is used as a continuous feature — no binning needed for MLP.",
  },
];

const pipelineSteps = [
  {
    title: "Load Raw Data",
    description: "30,000 rows × 24 columns from UCI Credit Card dataset (Taiwan, 2005)",
  },
  {
    title: "Fix Data Quality Issues",
    description: 'Collapse EDUCATION values 0,5,6 → "Other". Collapse MARRIAGE value 0 → "Other". Clip negative BILL_AMT values to 0.',
  },
  {
    title: "Encode Categoricals",
    description: "SEX remapped to binary (0/1). EDUCATION one-hot → EDU_2, EDU_3, EDU_4. MARRIAGE one-hot → MAR_2, MAR_3.",
  },
  {
    title: "Engineer 15 Features",
    description: "PAY_RATIO×6 (payment coverage per month), TOTAL_BILL, TOTAL_PAID, OVERALL_PAY_RATIO, UTIL_RATE (credit pressure), DELAY_COUNT, MAX_DELAY, AVG_DELAY, RECENT_DELAY (=PAY_0), ZERO_PAY_COUNT, BILL_TREND (BILL_AMT1 − BILL_AMT6)",
  },
  {
    title: "Clip Outliers",
    description: "Winsorize each continuous feature at 1st–99th percentile. Stores bounds in clip_bounds.pkl for inference-time reuse.",
  },
  {
    title: "Train / Val / Test Split",
    description: "70% / 15% / 15% stratified split. Stratification preserves the 22:78 class ratio in all three splits.",
  },
  {
    title: "Apply SMOTE",
    description: "Synthetic Minority Oversampling on training set only. Generates synthetic default samples to balance to 50:50. Validation and test sets remain untouched.",
  },
  {
    title: "StandardScaler",
    description: "Fit on training data only. Transform all three splits. Binary columns (SEX, EDU_, MAR_) are excluded from scaling.",
  },
];

// ─── Custom Recharts Subcomponents ───────────────────────────────────────────

interface CorrelationTooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      feature: string;
      correlation: number;
      type: string;
    };
  }[];
}

function CorrelationTooltip({ active, payload }: CorrelationTooltipProps) {
  if (!active || !payload?.length) return null;
  const { feature, correlation, type } = payload[0].payload;
  
  const typeBadgeColors = {
    Original: "bg-[#0071e3]/10 text-[#0071e3]",
    Engineered: "bg-[#34c759]/10 text-[#34c759]",
    New: "bg-[#ff6b35]/10 text-[#ff6b35]",
  }[type as "Original" | "Engineered" | "New"] || "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white border border-[#d2d2d7] rounded-xl p-3 shadow-md text-xs">
      <p className="font-bold text-[#1d1d1f] mb-1">{feature}</p>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[#6e6e73]">Correlation:</span>
        <span className="font-semibold text-[#0071e3]">{correlation.toFixed(4)}</span>
      </div>
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${typeBadgeColors}`}>
        {type}
      </span>
    </div>
  );
}

interface DemographicsTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
  }[];
  label?: string;
}

function DemographicsTooltip({ active, payload, label }: DemographicsTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#d2d2d7] rounded-xl p-3 shadow-md text-xs">
      <p className="font-bold text-[#1d1d1f] mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-[#6e6e73]">Default Rate:</span>
        <span className="font-semibold text-[#0071e3]">{payload[0].value}%</span>
      </div>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function EdaPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "strong" | "engineered">("all");
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  
  // Pipeline visibility (staggered animation)
  const [stepsVisible, setStepsVisible] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStepsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (stepsRef.current) {
      observer.observe(stepsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Filter feature correlations list
  const filteredCorrelations = featureCorrelations.filter((item) => {
    if (activeFilter === "strong") return item.correlation >= 0.10;
    if (activeFilter === "engineered") return item.type === "Engineered" || item.type === "New";
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Section 1 — Page Header */}
      <PageHeader
        title="Data Analysis"
        subtitle="Exploratory analysis of 30,000 credit card clients — Taiwan, April–September 2005"
      />

      {/* Section 2 — Dataset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {datasetStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Section 3 — Class Distribution */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50">
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Target Class Distribution</h2>
          <p className="text-sm text-[#6e6e73] mt-1 mb-6 max-w-3xl leading-relaxed">
            Severe imbalance — 3.52:1 ratio. A naive model predicting always no-default scores 77.9% accuracy while being completely useless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Donut Chart */}
          <div className="flex flex-col items-center">
            <div className="relative w-full h-[260px] flex justify-center items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#34c759" />
                    <Cell fill="#cf222e" />
                  </Pie>
                  <Tooltip formatter={(value) => value !== undefined ? [`${Number(value).toLocaleString()} clients`, "Count"] : ["", ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-[#1d1d1f]">30,000</span>
                <span className="text-sm text-[#6e6e73]">clients</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#34c759]" />
                <span className="text-xs font-medium text-[#6e6e73]">No Default (77.88%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#cf222e]" />
                <span className="text-xs font-medium text-[#6e6e73]">Default (22.12%)</span>
              </div>
            </div>
          </div>

          {/* Right: Stacked stats */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#f5f5f7] rounded-xl p-5 border border-[#d2d2d7]/50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f]">No Default</h4>
                  <p className="text-xs text-[#6e6e73]">23,364 clients</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#34c759]/10 text-[#34c759]">
                  77.88%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#34c759] h-full rounded-full transition-all duration-500" style={{ width: "77.88%" }} />
              </div>
            </div>

            <div className="bg-[#f5f5f7] rounded-xl p-5 border border-[#d2d2d7]/50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1d1d1f]">Default</h4>
                  <p className="text-xs text-[#6e6e73]">6,636 clients</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#cf222e]/10 text-[#cf222e]">
                  22.12%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#cf222e] h-full rounded-full transition-all duration-500" style={{ width: "22.12%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 — Feature Correlation */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Feature Correlation with Default (Pearson |r|)</h2>
            <p className="text-sm text-[#6e6e73] mt-1 max-w-2xl leading-relaxed">
              Engineered features DELAY_COUNT, RECENT_DELAY, MAX_DELAY rank higher than raw payment status features. Strong signal threshold at 0.10.
            </p>
          </div>
          
          {/* Tab Filters */}
          <div className="flex bg-[#f5f5f7] p-1 rounded-full self-start md:self-center">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-[#0071e3] text-white shadow-sm"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("strong")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeFilter === "strong"
                  ? "bg-[#0071e3] text-white shadow-sm"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              Strong (&gt;0.10)
            </button>
            <button
              onClick={() => setActiveFilter("engineered")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeFilter === "engineered"
                  ? "bg-[#0071e3] text-white shadow-sm"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              Engineered only
            </button>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex flex-wrap gap-5 justify-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0071e3]" />
            <span className="text-xs text-[#6e6e73]">Original Features</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#34c759]" />
            <span className="text-xs text-[#6e6e73]">Engineered Features</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff6b35]" />
            <span className="text-xs text-[#6e6e73]">New Features</span>
          </div>
        </div>

        <div className="w-full" style={{ height: "520px" }}>
          <ResponsiveContainer width="100%" height={520}>
            <BarChart
              layout="vertical"
              data={filteredCorrelations}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 0.45]}
                tickFormatter={(v) => v.toFixed(2)}
                tick={{ fontSize: 11, fill: "#6e6e73" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="feature"
                width={130}
                tick={{ fontSize: 11, fill: "#1d1d1f", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CorrelationTooltip />} cursor={{ fill: "rgba(0,113,227,0.03)" }} />
              <ReferenceLine
                x={0.10}
                stroke="#cf222e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "Signal threshold (0.10)",
                  position: "top",
                  fontSize: 11,
                  fill: "#cf222e",
                  fontWeight: 500,
                }}
              />
              <Bar dataKey="correlation" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {filteredCorrelations.map((entry) => {
                  const barColor = {
                    Original: "#0071e3",
                    Engineered: "#34c759",
                    New: "#ff6b35",
                  }[entry.type] || "#d2d2d7";
                  return <Cell key={entry.feature} fill={barColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 5 — Demographic Analysis */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50">
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Demographic Analysis</h2>
          <p className="text-sm text-[#6e6e73] mt-1 mb-6 max-w-3xl leading-relaxed">
            How gender, education, marital status, and age relate to default rates. Dashed line shows overall average (22.12%).
          </p>
        </div>

        {/* Row 1 — 3 side-by-side charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sex */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Default Rate by Sex</h3>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={genderData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 30]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: "#6e6e73" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<DemographicsTooltip />} cursor={{ fill: "rgba(0,113,227,0.03)" }} />
                  <ReferenceLine
                    y={22.12}
                    stroke="#1d1d1f"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{ value: "Avg (22.12%)", position: "right", fill: "#6e6e73", fontSize: 9 }}
                  />
                  <Bar dataKey="rate" fill="#0071e3" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#6e6e73] leading-relaxed mt-3 pt-3 border-t border-[#f0f0f5]">
              Female clients default less — 3.4 percentage points below male clients.
            </p>
          </div>

          {/* Education */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Default Rate by Education</h3>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={educationData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 30]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: "#6e6e73" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<DemographicsTooltip />} cursor={{ fill: "rgba(0,113,227,0.03)" }} />
                  <ReferenceLine
                    y={22.12}
                    stroke="#1d1d1f"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{ value: "Avg", position: "right", fill: "#6e6e73", fontSize: 9 }}
                  />
                  <Bar dataKey="rate" fill="#0071e3" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#6e6e73] leading-relaxed mt-3 pt-3 border-t border-[#f0f0f5]">
              Graduate school clients default least — better financial literacy and income stability.
            </p>
          </div>

          {/* Marriage */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Default Rate by Marriage</h3>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={marriageData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 30]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: "#6e6e73" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<DemographicsTooltip />} cursor={{ fill: "rgba(0,113,227,0.03)" }} />
                  <ReferenceLine
                    y={22.12}
                    stroke="#1d1d1f"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{ value: "Avg", position: "right", fill: "#6e6e73", fontSize: 9 }}
                  />
                  <Bar dataKey="rate" fill="#0071e3" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[#6e6e73] leading-relaxed mt-3 pt-3 border-t border-[#f0f0f5]">
              Single clients show slightly higher default rates.
            </p>
          </div>
        </div>

        {/* Row 2 — Full Width Age Group */}
        <div className="pt-6 border-t border-[#f0f0f5]">
          <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Default Rate by Age Group</h3>
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis dataKey="ageGroup" tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 30]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "#6e6e73" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DemographicsTooltip />} cursor={{ fill: "rgba(0,113,227,0.03)" }} />
                <ReferenceLine
                  y={22.12}
                  stroke="#1d1d1f"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{ value: "Avg (22.12%)", position: "right", fill: "#6e6e73", fontSize: 10 }}
                />
                <Bar dataKey="rate" fill="#0071e3" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#6e6e73] leading-relaxed mt-3 pt-3 border-t border-[#f0f0f5] max-w-3xl">
            Young adults (21–25) default most — lower income, less financial experience. Risk decreases with age then rises slightly for 61+.
          </p>
        </div>
      </div>

      {/* Section 6 — Data Quality Issues Found */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50">
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Data Quality Issues & Decisions</h2>
          <p className="text-sm text-[#6e6e73] mt-1 mb-6 max-w-3xl leading-relaxed">
            Issues discovered during EDA and how they were handled for ML vs Deep Learning.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#d2d2d7] text-left">
                <th className="pb-3 text-xs font-semibold text-[#6e6e73] uppercase tracking-wider pl-2">Issue</th>
                <th className="pb-3 text-xs font-semibold text-[#6e6e73] uppercase tracking-wider">ML Approach</th>
                <th className="pb-3 text-xs font-semibold text-[#6e6e73] uppercase tracking-wider">Deep Learning Approach</th>
              </tr>
            </thead>
            <tbody>
              {qualityIssues.map((item, index) => {
                const isExpanded = expandedIssue === index;
                return (
                  <tr key={index} className="contents">
                    <tr
                      onClick={() => setExpandedIssue(isExpanded ? null : index)}
                      className="hover:bg-[#f5f5f7] cursor-pointer transition-colors duration-200 border-b border-[#d2d2d7]/30"
                    >
                      <td className="py-4 pl-2 font-medium text-[#1d1d1f] text-sm flex items-center gap-2">
                        <span className="shrink-0 text-[#6e6e73]">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                        {item.issue}
                      </td>
                      <td className="py-4 text-xs font-mono text-[#6e6e73]">{item.ml}</td>
                      <td className="py-4 text-xs font-mono text-[#6e6e73]">{item.dl}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={3} className="bg-[#f0f7ff]/50 p-4 border-b border-[#d2d2d7]/30">
                          <div className="flex items-start gap-2.5 text-xs text-[#1d1d1f] max-w-4xl">
                            <Info className="w-4 h-4 text-[#0071e3] mt-0.5 shrink-0" />
                            <p className="leading-relaxed font-normal">{item.explanation}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 7 — Key Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {keyFindings.map((finding) => {
          const IconComponent = finding.icon;
          return (
            <div
              key={finding.title}
              className="bg-white rounded-2xl p-6 border border-[#d2d2d7]/50 shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${finding.bgClass} ${finding.colorClass} flex items-center justify-center shrink-0`}>
                  <IconComponent size={20} />
                </div>
                <h3 className="font-semibold text-sm text-[#1d1d1f]">{finding.title}</h3>
              </div>
              <p className="text-xs text-[#6e6e73] leading-relaxed flex-grow">{finding.description}</p>
            </div>
          );
        })}
      </div>

      {/* Section 8 — Preprocessing Pipeline */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/50">
        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Preprocessing Pipeline</h2>
          <p className="text-sm text-[#6e6e73] mt-1 mb-8 max-w-3xl leading-relaxed">
            Eight sequential steps applied before model training.
          </p>
        </div>

        <div ref={stepsRef} className="relative">
          {/* Vertical Dotted Connector Line */}
          <div className="absolute left-[20px] top-[32px] bottom-[32px] w-[2px] border-l-2 border-dotted border-[#d2d2d7] pointer-events-none" />
          
          <div className="space-y-6">
            {pipelineSteps.map((step, index) => {
              const stepNumber = index + 1;
              return (
                <div
                  key={index}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className={`flex gap-6 items-start transition-all duration-700 ease-out ${
                    stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {/* Step Number Circle */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0071e3] text-white shrink-0 font-bold z-10 shadow-[0_0_0_6px_#ffffff] text-sm">
                    {stepNumber}
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="font-semibold text-sm text-[#1d1d1f]">{step.title}</h4>
                    <p className="text-xs text-[#6e6e73] mt-1.5 leading-relaxed max-w-3xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
