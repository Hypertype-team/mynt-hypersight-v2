import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const CategoryBreakdownChart = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('analyze-charts', {
        body: { prompt },
      });

      if (response.error) throw response.error;

      const { analysis, chartSuggestion, chartData } = response.data;
      setAnalysis(analysis);
      setChartData(chartData);
      setChartType(chartSuggestion.toLowerCase().includes('bar') ? 'bar' : 'line');
    } catch (error) {
      console.error('Error:', error);
      setAnalysis("Failed to analyze the data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    return chartType === 'bar' ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="hsl(var(--primary))"
            name="Count"
          />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            name="Count"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Data Analysis</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ask questions about your ticket data
        </p>
        <div className="flex gap-2 mb-4">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Show me ticket priorities distribution"
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
        {analysis && (
          <p className="text-sm text-muted-foreground mb-4">{analysis}</p>
        )}
      </div>
      <div className="h-[300px]">
        {renderChart()}
      </div>
    </Card>
  );
};