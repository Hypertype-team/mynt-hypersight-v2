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

interface TicketData {
  created_at: string;
  // Add other fields from your ticket_analysis table as needed
  [key: string]: any;
}

interface SampleChartProps {
  data?: TicketData[];
}

export const SampleChart = ({ data = [] }: SampleChartProps) => {
  // Transform the data for the chart
  const chartData = data?.map(ticket => ({
    name: new Date(ticket.created_at).toLocaleDateString(),
    value: 1, // You can modify this based on what value you want to show
  })) || [];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Ticket Analysis</h3>
        <p className="text-sm text-muted-foreground">Ticket creation over time</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};