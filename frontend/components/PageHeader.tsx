interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div
      style={{
        borderBottom: "1px solid #d2d2d7",
        paddingBottom: "20px",
        marginBottom: "32px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 600,
          color: "#1d1d1f",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: "15px",
            color: "#6e6e73",
            marginTop: "4px",
            marginBottom: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
