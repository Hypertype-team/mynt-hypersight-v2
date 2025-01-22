import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "./chat/Message";
import { ChatInput } from "./chat/ChatInput";
import { ChatMessage } from "./chat/types";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hello! I can help you analyze your ticket data. Try asking questions like:\n\n" +
        "- Show me the distribution of ticket priorities\n" +
        "- What are the most common categories?\n" +
        "- How are sentiments distributed across departments?\n" +
        "- Which companies have the most tickets?\n" +
        "- What are the common issues reported?",
      isUser: false,
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

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-background border-l",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="font-semibold">Ticket Analysis Assistant</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {messages.map((message, i) => (
            <Message
              key={i}
              message={message}
              onFollowUpClick={handleFollowUpClick}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="border-t mt-auto">
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};