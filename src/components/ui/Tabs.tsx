"use client";
import React, { useState } from "react";
import {
  RiAddLine,
  RiBarChart2Line,
  RiDashboardLine,
  RiFlag2Line,
  RiWallet3Line,
} from "react-icons/ri";

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: RiDashboardLine },
  { key: "budget", label: "Budget", icon: RiWallet3Line },
  { key: "add", label: "Add", icon: RiAddLine, isAction: true },
  { key: "advisor", label: "Advisor", icon: RiBarChart2Line },
  { key: "goals", label: "Goals", icon: RiFlag2Line },
];

const TabsComponent: React.FC = () => {
  const [activeKey, setActiveKey] = useState("dashboard");

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 0,
        transform: "translateX(-50%)",
        width: "100%",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        padding: "0 12px 10px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background:
            "linear-gradient(135deg, rgba(17, 25, 40, 0.98), rgba(20, 32, 52, 0.98))",
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.26)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 6,
            alignItems: "stretch",
            padding: "10px 8px 12px",
          }}
        >
          {tabs.map(({ key, label, icon: Icon, isAction }) => {
            const isActive = activeKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveKey(key)}
                aria-label={label}
                style={{
                  appearance: "none",
                  border: "none",
                  background: "transparent",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                  padding: isAction ? 0 : "10px 8px 6px",
                  borderRadius: isAction ? 999 : 18,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                  textAlign: "center",
                  transition: "all 0.2s ease",
                  minHeight: isAction ? 74 : 72,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: isAction ? 64 : 26,
                    height: isAction ? 64 : 26,
                    borderRadius: isAction ? "50%" : 8,
                    background: isAction
                      ? "linear-gradient(135deg, #34d399, #10b981)"
                      : "transparent",
                    boxShadow: isAction
                      ? "0 12px 28px rgba(16, 185, 129, 0.45)"
                      : "none",
                    transform: isAction ? "translateY(-12px)" : "none",
                    fontSize: isAction ? 28 : 24,
                    lineHeight: 1,
                    color: isAction ? "#ffffff" : isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                  }}
                >
                  <Icon />
                </span>

                {!isAction && (
                  <span
                    style={{
                      fontSize: 12,
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                    }}
                  >
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabsComponent;
