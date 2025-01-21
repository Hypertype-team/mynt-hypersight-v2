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
      text: "Hello! I can help you analyze and customize your charts. Try asking me to:\n\n" +
            "• Change chart colors or styles\n" +
            "• Add or modify data points\n" +
            "• Switch chart types\n" +
            "• Explain chart trends\n" +
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
    setTimeout(() => {
      const userInput = input.toLowerCase();
      let response = "";

      if (userInput.includes("color")) {
        response = "I can help you change the chart colors! Would you like to use a specific color palette or theme?";
      } else if (userInput.includes("data")) {
        response = "I can help you modify the chart data. Would you like to add new data points or modify existing ones?";
      } else if (userInput.includes("type")) {
        response = "I can help you switch between different chart types like line, bar, or pie charts. What type interests you?";
      } else if (userInput.includes("trend")) {
        response = "Let me analyze the trends in your data. I notice there's an upward trend between March and April. Would you like me to explain more?";
      } else {
        response = "I understand you want to work with the charts. What specific aspect would you like to modify or analyze?";
      }

      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    }, 1000);
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