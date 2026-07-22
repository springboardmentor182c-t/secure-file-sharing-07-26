// client/src/features/analytics/components/kpi/KPIGrid.js
/**
 * Renders a KPI grid from config + data.
 * Config drives structure — data drives values.
 *
 * @param {Array}  config       - from ui_config.file_kpis or security_kpis
 * @param {Object} data         - keyed by config[].key
 * @param {Object} subtitles    - keyed by config[].sub_key (optional)
 * @param {number} skeletonCount - number of skeletons to show while loading
 * @param {boolean} loading
 */

import React from "react";
import KPICard from "./KPICard";

export default function KPIGrid({
  config        = [],
  data          = {},
  subtitles     = {},
  skeletonCount = 4,
  loading       = false,
}) {
  if (loading) {
    // Use provided skeletonCount, or fall back to actual config length, or 4
    const count = skeletonCount || config.length || 4;

    return (
      <div className="an-kpi-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="an-kpi-card an-kpi-card--skeleton">
            <div className="an-skeleton an-skeleton--icon" />
            <div className="an-kpi-body">
              <div className="an-skeleton an-skeleton--value" />
              <div className="an-skeleton an-skeleton--label" />
            </div>
            <div className="an-skeleton an-skeleton--sub" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="an-kpi-grid">
      {config.map((cfg, i) => (
        <KPICard
          key={cfg.key}
          delay={i * 0.06}
          iconName={cfg.icon}
          colorVar={cfg.color_var}
          bgVar={cfg.bg_var}
          label={cfg.label}
          value={data?.[cfg.key] ?? 0}
          suffix={cfg.suffix ?? ""}
          decimals={cfg.decimals ?? 0}
          sub={subtitles?.[cfg.sub_key] ?? ""}
        />
      ))}
    </div>
  );
}