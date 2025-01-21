import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import OpenAI from "openai";

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
  const [apiKey, setApiKey] = useState(localStorage.getItem("openai_key") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");

    try {
      if (!apiKey) {
        setMessages((prev) => [...prev, { 
          text: "Please enter your OpenAI API key first.", 
          isUser: false 
        }]);
        return;
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Process user input with OpenAI
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that modifies charts. When users ask to modify charts, respond with specific JavaScript commands that can be executed to modify chart elements. For example, if they ask to change colors, suggest specific color values. Keep responses concise and focused on actionable changes."
          },
          {
            role: "user",
            content: input
          }
        ],
        model: "gpt-4o",
      });

      const aiResponse = completion.choices[0]?.message?.content || "I couldn't process that request.";
      
      // Add AI response
      setMessages((prev) => [...prev, { text: aiResponse, isUser: false }]);

      // Process chart modifications based on AI response
      const userInput = input.toLowerCase();
      if (userInput.includes("color")) {
        const chartElements = document.querySelectorAll('.recharts-line-curve');
        chartElements.forEach((element) => {
          element.setAttribute('stroke', 'hsl(var(--accent))');
        });
      } 
      else if (userInput.includes("data")) {
        const chartContainer = document.querySelector('.recharts-wrapper');
        if (chartContainer) {
          const chart = document.querySelector('.recharts-line');
          if (chart) {
            const points = chart.querySelectorAll('.recharts-line-dot');
            points.forEach((point) => {
              const cy = point.getAttribute('cy');
              if (cy) {
                point.setAttribute('cy', String(Number(cy) - 20));
              }
            });
          }
        }
      }
      else if (userInput.includes("type")) {
        const lineChart = document.querySelector('.recharts-line');
        if (lineChart) {
          lineChart.classList.add('recharts-area');
          lineChart.classList.remove('recharts-line');
        }
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { 
        text: "Sorry, there was an error processing your request.", 
        isUser: false 
      }]);
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("openai_key", apiKey);
    setMessages((prev) => [...prev, { 
      text: "API key saved! You can now interact with the AI assistant.", 
      isUser: false 
    }]);
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

        {!apiKey && (
          <form onSubmit={handleApiKeySubmit} className="p-4 border-b">
            <div className="space-y-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter OpenAI API Key"
                className="flex-1"
              />
              <Button type="submit" className="w-full">Save API Key</Button>
            </div>
          </form>
        )}

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