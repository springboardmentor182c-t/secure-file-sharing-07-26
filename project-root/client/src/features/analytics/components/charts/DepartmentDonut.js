// client/src/features/analytics/components/charts/DepartmentDonut.js
/**
 * Sharing by Department — donut chart + legend.
 * Data + colors come from backend (data.sharing.by_department[].color).
 * Title from ui_config.charts.department.
 */

import React from "react";
import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { motion }   from "framer-motion";
import Card         from "../shared/Card";
import ChartTooltip from "./ChartTooltip";
import Skeleton     from "../shared/Skeleton";
import EmptyState   from "../shared/EmptyState";

export default function DepartmentDonut({
  byDepartment = [],
  loading      = false,
  config       = {},
}) {
  const title = config.title || "Sharing by Department";

  return (
    <Card delay={0.2}>
      <h3 className="an-card-title" style={{ marginBottom: "16px" }}>
        {title}
      </h3>

      {loading ? (
        <div className="an-donut-skeleton">
          <Skeleton className="an-skeleton--donut" />
          <div className="an-donut-legend-skeleton">
            {[80, 60, 50, 40, 30].map((w, i) => (
              <Skeleton
                key={i}
                className="an-skeleton--legend-row"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ) : !byDepartment.length ? (
        <EmptyState message="No sharing data yet." />
      ) : (
        <motion.div
          className="an-donut-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Donut */}
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={byDepartment}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={54}
                dataKey="value"
                paddingAngle={2}
                animationDuration={1200}
              >
                {byDepartment.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="an-donut-legend">
            {byDepartment.map((d) => (
              <div key={d.name} className="an-donut-legend-row">
                <span
                  className="an-donut-legend-dot"
                  style={{ background: d.color }}
                />
                <span className="an-donut-legend-name">{d.name}</span>
                <span className="an-donut-legend-value">
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  );
}