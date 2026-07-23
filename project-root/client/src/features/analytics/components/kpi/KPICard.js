// client/src/features/analytics/components/kpi/KPICard.js
/**
 * Single KPI card — Figma layout.
 * Reads:
 *   - Icon NAME from backend ui_config
 *   - Color/BG CSS variable names from backend ui_config
 *   - Value from live analytics data
 *   - Subtitle from derived string in useAnalytics
 *
 * Zero hardcoded colors or labels.
 */

import React from "react";
import { motion } from "framer-motion";
import useCountUp from "../../hooks/useCountUp";
import { getIcon } from "../../config/iconRegistry";

export default function KPICard({
  iconName,
  colorVar,
  bgVar,
  label,
  value    = 0,
  suffix   = "",
  decimals = 0,
  sub      = "",
  delay    = 0,
}) {
  const numericValue = typeof value === "number" ? value : 0;
  const displayed    = useCountUp(numericValue, 1400, decimals);
  const Icon         = getIcon(iconName);

  const formatted =
    decimals > 0
      ? displayed.toFixed(decimals)
      : Math.round(displayed).toLocaleString();

  return (
    <motion.div
      className="an-kpi-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.32, 0.72, 0, 1],
      }}
      whileHover={{
        y: -4,
        boxShadow: "var(--an-card-shadow-hover)",
        borderColor: "var(--an-card-border-hover)",
        transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
      }}
    >
      <div
        className="an-kpi-icon"
        style={{
          background: `var(${bgVar})`,
          color:      `var(${colorVar})`,
        }}
      >
        {Icon && <Icon size={18} />}
      </div>

      <div className="an-kpi-body">
        <p className="an-kpi-value">
          {formatted}{suffix}
        </p>
        <p className="an-kpi-label">{label}</p>
      </div>

      {sub && <p className="an-kpi-sub">{sub}</p>}
    </motion.div>
  );
}