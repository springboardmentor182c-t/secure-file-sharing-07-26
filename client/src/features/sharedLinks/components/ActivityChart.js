import React, { useMemo } from "react";

const WIDTH = 720;
const HEIGHT = 260;
const PADDING_L = 40;
const PADDING_B = 30;
const PADDING_T = 16;

export default function ActivityChart({ data }) {
  const maxVal = useMemo(() => {
    const max = Math.max(1, ...data.flatMap((d) => [d.created, d.access]));
    // round up to a "nice" number for gridlines
    const magnitude = Math.pow(10, Math.floor(Math.log10(max || 1)));
    return Math.ceil(max / magnitude) * magnitude || 10;
  }, [data]);

  const chartH = HEIGHT - PADDING_T - PADDING_B;
  const groupWidth = (WIDTH - PADDING_L) / data.length;
  const barWidth = Math.min(28, groupWidth * 0.28);
  const gridLines = 4;

  const yFor = (v) => PADDING_T + chartH - (v / maxVal) * chartH;

  return (
    <div className="activity-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="activity-chart__svg" role="img"
        aria-label="Bar chart comparing links created and access events per month">
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const v = (maxVal / gridLines) * i;
          const y = yFor(v);
          return (
            <g key={i}>
              <line x1={PADDING_L} x2={WIDTH} y1={y} y2={y} className="activity-chart__gridline" />
              <text x={PADDING_L - 10} y={y + 4} textAnchor="end" className="activity-chart__axis-label">
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const groupX = PADDING_L + i * groupWidth + groupWidth / 2;
          const createdH = (d.created / maxVal) * chartH;
          const accessH = (d.access / maxVal) * chartH;
          const barGap = 5;
          return (
            <g key={d.label + i}>
              <rect
                x={groupX - barWidth - barGap / 2}
                y={PADDING_T + chartH - createdH}
                width={barWidth}
                height={createdH}
                rx={4}
                className="activity-chart__bar activity-chart__bar--created"
              >
                <title>{`${d.label}: ${d.created} links created`}</title>
              </rect>
              <rect
                x={groupX + barGap / 2}
                y={PADDING_T + chartH - accessH}
                width={barWidth}
                height={accessH}
                rx={4}
                className="activity-chart__bar activity-chart__bar--access"
              >
                <title>{`${d.label}: ${d.access} access events`}</title>
              </rect>
              <text x={groupX} y={HEIGHT - 8} textAnchor="middle" className="activity-chart__axis-label">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
