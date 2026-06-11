import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        border: "1px solid #d2d2d7",
        transition: "all 0.2s ease",
        cursor: "default",
        position: "relative",
      }}
      className="stat-card"
    >
      {icon && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "36px",
            height: "36px",
            backgroundColor: "#f5f5f7",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6e6e73",
          }}
        >
          {icon}
        </div>
      )}
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#6e6e73",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 10px 0",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: "28px",
          fontWeight: 600,
          color: "#1d1d1f",
          margin: "0",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          style={{
            fontSize: "13px",
            color: "#6e6e73",
            margin: "6px 0 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
      <style>{`
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(0,0,0,0.09);
        }
      `}</style>
    </div>
  );
}
