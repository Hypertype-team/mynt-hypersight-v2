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
    <Card className="p-6 bg-white border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-black">Monthly Performance</h3>
        <p className="text-sm text-gray-600 mt-1">Last 6 months of data</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#000000"
              tick={{ fill: '#000000' }}
            />
            <YAxis 
              stroke="#000000"
              tick={{ fill: '#000000' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              itemStyle={{
                color: '#000000',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#F8D7E8"
              strokeWidth={3}
              dot={{ fill: '#F8D7E8', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#E5DEFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};