import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MessageChartProps {
  chartData: any;
  chartType?: 'line' | 'bar';
}

export const MessageChart = ({ chartData, chartType }: MessageChartProps) => {
  return (
    <div className="mt-4 bg-background p-2 rounded-lg">
      <div className="h-[200px] w-full">
        <ResponsiveContainer>
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};