import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { 
      text: "Hello! I can help you customize your dashboard. Try asking me to:\n\n" +
            "• Change chart colors\n" +
            "• Modify chart data\n" +
            "• Switch chart types\n" +
            "• Add new visualizations\n\n" +
            "What would you like to do?",
      isUser: false 
    },
  ]);
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");

    // Process the command
    const command = input.toLowerCase();
    let response = "";

    try {
      if (command.includes("color")) {
        const charts = document.querySelectorAll('.recharts-line-curve');
        const newColor = 'hsl(var(--accent))';
        charts.forEach(chart => {
          if (chart instanceof SVGElement) {
            chart.style.stroke = newColor;
          }
        });
        response = "I've updated the chart colors to use the accent color.";
      } 
      else if (command.includes("data")) {
        const chart = document.querySelector('.recharts-wrapper');
        if (chart) {
          // Modify chart data points
          const points = chart.querySelectorAll('.recharts-line-dot');
          points.forEach((point, index) => {
            if (point instanceof SVGElement) {
              const currentCy = point.getAttribute('cy');
              if (currentCy) {
                const newCy = Number(currentCy) + Math.sin(index) * 20;
                point.setAttribute('cy', newCy.toString());
              }
            }
          });
          response = "I've adjusted the data points to show a new pattern.";
        }
      }
      else if (command.includes("type")) {
        const chart = document.querySelector('.recharts-line');
        if (chart) {
          chart.classList.add('recharts-area');
          chart.classList.remove('recharts-line');
          response = "I've changed the chart type to an area chart.";
        }
      }
      else if (command.includes("add")) {
        response = "To add a new visualization, please specify what type of chart you'd like (line, bar, or area).";
      }
      else {
        response = "I can help you modify the dashboard. Try asking me to change colors, modify data, or switch chart types.";
      }

      // Add assistant response
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
      
      // Show toast notification
      toast({
        title: "Dashboard Updated",
        description: response,
      });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = "Sorry, I couldn't process that request. Please try again.";
      setMessages((prev) => [...prev, { text: errorMessage, isUser: false }]);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
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
          <h2 className="font-semibold">Dashboard Assistant</h2>
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
              placeholder="Ask about your dashboard..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </div>
        </form>
      </div>
    </div>
  );
};