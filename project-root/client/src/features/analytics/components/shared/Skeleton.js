// client/src/features/analytics/components/shared/Skeleton.js
/**
 * Shimmer skeleton primitives — matches Figma loading states.
 */

import React from "react";

export default function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`an-skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Chart skeleton — animated bars like Figma ChartSkeleton.
 */
export function ChartSkeleton({ height = 200 }) {
  const bars = [55, 72, 48, 85, 63, 90, 77];
  return (
    <div className="an-chart-skeleton" style={{ height }}>
      <div className="an-chart-skeleton-bars">
        {bars.map((h, i) => (
          <div
            key={i}
            className="an-chart-skeleton-bar"
            style={{
              height:          `${h}%`,
              animationDelay:  `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div className="an-chart-skeleton-labels">
        {bars.map((_, i) => (
          <Skeleton key={i} className="an-skeleton-label" />
        ))}
      </div>
    </div>
  );
}