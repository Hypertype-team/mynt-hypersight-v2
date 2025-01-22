import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  text: string;
  isUser: boolean;
  chartData?: any;
  chartType?: 'line' | 'bar';
  analysis?: string;
  followUpQuestions?: string[];
}

export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hello! I can help you analyze your ticket data. Try asking questions like:\n\n" +
            "- Show me the distribution of ticket priorities\n" +
            "- What are the most common categories?\n" +
            "- How are sentiments distributed across departments?\n" +
            "- Which companies have the most tickets?\n" +
            "- What are the common issues reported?",
      isUser: false 
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");

    try {
      const response = await supabase.functions.invoke('analyze-charts', {
        body: { prompt: input },
      });

      if (response.error) throw response.error;

      const { analysis, chartSuggestion, chartData, followUpQuestions } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          text: analysis,
          isUser: false,
          chartData: chartData,
          chartType: chartSuggestion.toLowerCase().includes('bar') ? 'bar' : 'line',
          analysis: analysis,
          followUpQuestions: followUpQuestions,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the data. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error while analyzing the data. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInput(question);
  };

  const renderChart = (message: Message) => {
    if (!message.chartData) return null;

    return message.chartType === 'bar' ? (
      <div className="h-[200px] w-full mt-4">
        <ResponsiveContainer>
          <BarChart data={message.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              type="monotone"
              dataKey="value"
              fill="hsl(var(--primary))"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="h-[200px] w-full mt-4">
        <ResponsiveContainer>
          <LineChart data={message.chartData}>
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
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-96 bg-background border-l transform transition-transform duration-300 ease-in-out flex flex-col max-h-screen",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="border-b p-4 flex items-center justify-between shrink-0">
          <h2 className="font-semibold">Ticket Analysis Assistant</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {messages.map((message, i) => (
              <div key={i} className="break-words">
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    message.isUser
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  )}
                >
                  {message.text}
                </div>
                {message.chartData && (
                  <div className="mt-4 bg-background p-2 rounded-lg">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer>
                        {message.chartType === 'bar' ? (
                          <BarChart data={message.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        ) : (
                          <LineChart data={message.chartData}>
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
                )}
                {!message.isUser && message.followUpQuestions && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Follow-up questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.followUpQuestions.map((question, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="text-sm"
                          onClick={() => handleFollowUpClick(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4 shrink-0 bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your ticket data..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};