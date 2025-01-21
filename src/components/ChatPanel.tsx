import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { 
      text: "Hello! I can help you customize your charts. Try asking me to:\n\n" +
            "• Change chart colors\n" +
            "• Modify data points\n" +
            "• Switch chart types\n" +
            "• Explain trends\n\n" +
            "What would you like to do?",
      isUser: false 
    },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");

    // Simulate AI response based on chart-related keywords
    const userInput = input.toLowerCase();
    let response = "";

    if (userInput.includes("color")) {
      const chartElement = document.querySelector('.recharts-line-curve');
      if (chartElement) {
        const newColor = "hsl(var(--accent))";
        chartElement.setAttribute('stroke', newColor);
        response = "I've updated the chart color to a softer accent tone. How does that look?";
      }
    } else if (userInput.includes("data")) {
      // Update the chart data directly
      const chartContainer = document.querySelector('.recharts-wrapper');
      if (chartContainer) {
        response = "I can help modify the data points. What specific changes would you like to make?";
      }
    } else if (userInput.includes("type")) {
      response = "I can help switch between different chart types. Would you prefer a bar chart, line chart, or area chart?";
    } else if (userInput.includes("trend")) {
      response = "Looking at your data, I can see an upward trend from March to April, followed by a slight decrease in May. Would you like me to analyze any specific period?";
    } else {
      response = "I understand you want to work with the charts. What specific aspect would you like to modify or analyze?";
    }

    setMessages((prev) => [...prev, { text: response, isUser: false }]);
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-96 bg-background border-l transform transition-transform duration-300 ease-in-out shadow-lg",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="border-b p-4 flex items-center justify-between bg-muted/30">
          <h2 className="font-semibold">Chart Assistant</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg max-w-[85%] whitespace-pre-wrap animate-fadeIn",
                  message.isUser
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                )}
              >
                {message.text}
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your charts..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </div>
        </form>
      </div>
    </div>
  );
};