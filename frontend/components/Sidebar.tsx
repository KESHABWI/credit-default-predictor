"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  BarChart2,
  FlaskConical,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/eda", icon: BarChart2, label: "Data Analysis" },
  { href: "/experiments", icon: FlaskConical, label: "Experiments" },
  { href: "/predict", icon: Zap, label: "Predict" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        height: "100vh",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #d2d2d7",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 20px 24px",
          borderBottom: "1px solid #d2d2d7",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#f5f5f7",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CreditCard size={16} color="#0071e3" />
        </div>
        <span
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "#1d1d1f",
            letterSpacing: "-0.01em",
          }}
        >
          CreditGuard
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                marginBottom: "2px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#0071e3" : "#6e6e73",
                backgroundColor: isActive ? "#f5f5f7" : "transparent",
                borderLeft: isActive
                  ? "2px solid #0071e3"
                  : "2px solid transparent",
                transition: "all 0.2s ease",
              }}
              className="sidebar-nav-link"
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #d2d2d7",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#6e6e73",
            margin: 0,
          }}
        >
          Powered by PyTorch
        </p>
      </div>

      <style>{`
        .sidebar-nav-link:hover {
          background-color: #f5f5f7!important;
          color: ${`#0071e3`}!important;
        }
      `}</style>
    </aside>
  );
}
