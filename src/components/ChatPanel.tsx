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

    // Process user input and modify UI
    const userInput = input.toLowerCase();
    let response = "";

    if (userInput.includes("color")) {
      // Find all chart lines and modify their colors
      const chartElements = document.querySelectorAll('.recharts-line-curve');
      chartElements.forEach((element) => {
        element.setAttribute('stroke', 'hsl(var(--accent))');
      });
      response = "I've updated the chart colors to use the accent color. How does that look?";
    } 
    else if (userInput.includes("data")) {
      // Find and modify chart data
      const chartContainer = document.querySelector('.recharts-wrapper');
      if (chartContainer) {
        // Update chart data by finding the component's data prop
        const chart = document.querySelector('.recharts-line');
        if (chart) {
          // Simulate data update by modifying DOM
          const points = chart.querySelectorAll('.recharts-line-dot');
          points.forEach((point) => {
            const cy = point.getAttribute('cy');
            if (cy) {
              point.setAttribute('cy', String(Number(cy) - 20));
            }
          });
        }
        response = "I've adjusted the data points to show a different trend. Is this what you were looking for?";
      }
    }
    else if (userInput.includes("type")) {
      // Change chart type by modifying class names
      const lineChart = document.querySelector('.recharts-line');
      if (lineChart) {
        lineChart.classList.add('recharts-area');
        lineChart.classList.remove('recharts-line');
      }
      response = "I've changed the chart type. Would you like to try another type?";
    }
    else if (userInput.includes("trend")) {
      response = "Looking at your data, I can see an upward trend from March to April, followed by a slight decrease in May. Would you like me to analyze any specific period?";
    }
    else {
      response = "I understand you want to work with the charts. What specific aspect would you like to modify? You can ask me to change colors, modify data, or switch chart types.";
    }

    // Add AI response
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