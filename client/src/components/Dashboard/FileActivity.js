import "./FileActivity.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function FileActivity({ activity }) {
  const chartData = activity.days.map((day, index) => ({
    day,
    Uploads: activity.uploads[index],
    Downloads: activity.downloads[index],
  }));

  return (
    <div className="file-activity">
      <h3>File Activity — This Week</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="Uploads"
            stroke="#6d5dfc"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="Downloads"
            stroke="#b9a994"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}