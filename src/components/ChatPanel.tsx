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

const QUICK_RESPONSES = [
  "Show me common issues by category",
  "What are the top priorities?",
  "Summarize recent tickets",
  "Show department responsibilities",
];

const INITIAL_MESSAGE: ChatMessage = {
  text: `# 👋 Welcome to Your Ticket Analysis Assistant!

I can help you analyze your ticket data quickly and efficiently. Here are some quick insights you can ask for:

## 🔍 Quick Access:
* 📊 Categories & Trends
* 🎯 Priority Analysis
* 👥 Department Overview
* 📑 Recent Summaries

Just click one of the quick response buttons below or type your own question!`,
  isUser: false,
  followUpQuestions: QUICK_RESPONSES,
};

export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async (query: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text: query, isUser: true }]);
    setInput("");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-tickets', {
        body: { query }
      });

      if (error) throw error;

      const followUpQuestions = [
        "What are the trends in this category?",
        "Show me related issues",
        "Compare with previous period",
        "Any documentation available?",
      ];

      setMessages((prev) => [
        ...prev,
        {
          text: data.answer,
          isUser: false,
          followUpQuestions,
          chartData: data.chartData,
          chartType: data.chartType,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await handleAnalysis(input);
  };

  const handleQuickResponse = async (question: string) => {
    await handleAnalysis(question);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message, i) => (
            <Message
              key={i}
              message={message}
              onFollowUpClick={handleQuickResponse}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_RESPONSES.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickResponse(question)}
              disabled={isLoading}
            >
              {question}
            </Button>
          ))}
        </div>
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