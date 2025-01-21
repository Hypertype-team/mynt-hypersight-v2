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
      text: "Hello! I can help you analyze and customize your charts. First, please enter your OpenAI API key to enable chart modifications.\n\n" +
            "After that, you can ask me to:\n" +
            "• Change chart colors or styles\n" +
            "• Add or modify data points\n" +
            "• Switch chart types\n" +
            "• Explain chart trends",
      isUser: false 
    },
  ]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Please enter your OpenAI API key first to enable chart modifications.",
          isUser: false,
        },
      ]);
      return;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that helps users modify and analyze charts. You can help with changing colors, styles, data points, and explaining trends.",
            },
            {
              role: "user",
              content: input,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from OpenAI");
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages((prev) => [...prev, { text: aiResponse, isUser: false }]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please check your API key and try again.",
        variant: "destructive",
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
          <h2 className="font-semibold">Chart Assistant</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!apiKey && (
          <div className="p-4 border-b">
            <Input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Your API key will be stored temporarily in memory and will not be saved.
            </p>
          </div>
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