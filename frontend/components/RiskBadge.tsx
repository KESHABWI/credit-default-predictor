interface RiskBadgeProps {
  risk: "Low" | "Medium" | "High";
}

const riskStyles: Record<
  string,
  { background: string; color: string }
> = {
  Low: { background: "#f0faf0", color: "#1a7f37" },
  Medium: { background: "#fff8f0", color: "#b45309" },
  High: { background: "#fff0f0", color: "#cf222e" },
};

export default function RiskBadge({ risk }: RiskBadgeProps) {
  const styles = riskStyles[risk] ?? riskStyles.Medium;
  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: styles.background,
        color: styles.color,
        fontSize: "13px",
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: "999px",
      }}
    >
      {risk} Risk
    </span>
  );
}
