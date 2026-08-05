import "./StorageChart.css";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6C63FF",
  "#8D84FF",
  "#B0A9FF",
  "#D2CDFF",
  "#E6E3FF",
];

export default function StorageChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="storage-card">
      <h3>Storage by Type</h3>

      <div className="storage-content">
        <div className="chart-wrapper">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-center">
            <h2>{total}</h2>
            <p>GB Used</p>
          </div>
        </div>

        <div className="storage-list">
          {data.map((item, index) => (
            <div className="storage-item" key={item.name}>
              <div className="left">
                <span
                  className="dot"
                  style={{
                    background: COLORS[index % COLORS.length],
                  }}
                ></span>

                {item.name}
              </div>

              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}