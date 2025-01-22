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
        "- What are the most common issues and their patterns?\n" +
        "- Can you summarize the tickets by category?\n" +
        "- What are the department justifications for specific issues?\n" +
        "- Are there any relevant documentation links?\n" +
        "- What are the relationships between categories and subcategories?\n",
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
      // Call the analyze-tickets function
      const response = await fetch(
        'https://pzppkiwucwxdopggylmd.supabase.co/functions/v1/analyze-tickets',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ query: input }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze tickets');
      }

      const { answer } = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          text: answer,
          isUser: false,
          followUpQuestions: [
            "What are the most common issues?",
            "Show me ticket summaries by category",
            "What are the department justifications?",
            "Are there any relevant documentation links?",
          ],
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
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message, i) => (
            <Message
              key={i}
              message={message}
              onFollowUpClick={handleFollowUpClick}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="border-t">
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