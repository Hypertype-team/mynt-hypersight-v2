import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface Ticket {
  id: number;
  company_name?: string;
  issue?: string;
  category?: string;
  priority?: string;
  state?: string;
  sentiment?: string;
}

interface TicketChartsProps {
  tickets: Ticket[];
}

export const TicketCharts = ({ tickets }: TicketChartsProps) => {
  // Prepare data for Priority Distribution
  const priorityData = tickets.reduce((acc: { name: string; value: number }[], ticket) => {
    const priority = ticket.priority || "Unknown";
    const existingPriority = acc.find((item) => item.name === priority);
    
    if (existingPriority) {
      existingPriority.value += 1;
    } else {
      acc.push({ name: priority, value: 1 });
    }
    
    return acc;
  }, []);

  // Prepare data for Category Distribution
  const categoryData = tickets.reduce((acc: { name: string; value: number }[], ticket) => {
    const category = ticket.category || "Unknown";
    const existingCategory = acc.find((item) => item.name === category);
    
    if (existingCategory) {
      existingCategory.value += 1;
    } else {
      acc.push({ name: category, value: 1 });
    }
    
    return acc;
  }, []);

  // Prepare data for Sentiment Analysis
  const sentimentData = tickets.reduce((acc: { name: string; value: number }[], ticket) => {
    const sentiment = ticket.sentiment || "Unknown";
    const existingSentiment = acc.find((item) => item.name === sentiment);
    
    if (existingSentiment) {
      existingSentiment.value += 1;
    } else {
      acc.push({ name: sentiment, value: 1 });
    }
    
    return acc;
  }, []);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};