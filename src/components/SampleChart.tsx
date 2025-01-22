import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

export const SampleChart = () => {
  return (
    <Card className="p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-[#1a1a1a]">Monthly Performance</h3>
        <p className="text-base text-[#666666] mt-1">
          Last 6 months of data
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#1a1a1a"
              tick={{ fill: '#1a1a1a' }}
            />
            <YAxis 
              stroke="#1a1a1a"
              tick={{ fill: '#1a1a1a' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              itemStyle={{
                color: '#1a1a1a',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#E88D7D"
              strokeWidth={3}
              dot={{ fill: '#E88D7D', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FFE5D3' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};