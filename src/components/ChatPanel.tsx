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
      text: `# 👋 Welcome to Your Ticket Analysis Assistant!

I'm here to help you understand patterns and insights from your ticket data. I can analyze trends, summarize issues, and provide valuable insights to help you make informed decisions.

## 💡 Try asking questions like:

* 📊 "What are the most common issues we're seeing?"
* 📑 "Can you summarize tickets by category?"
* 🏢 "What are the department justifications for specific issues?"
* 📚 "Are there any documentation links I should know about?"
* 🔍 "How do categories and subcategories relate to each other?"

I'll provide organized, easy-to-read responses with relevant insights from your ticket data. Feel free to ask anything!`,
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
      const { data, error } = await supabase.functions.invoke('analyze-tickets', {
        body: { query: input }
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          text: data.answer,
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
        description: "I couldn't analyze the data right now. Please try asking again.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but I encountered an error while analyzing the data. Could you please try rephrasing your question or asking something else?",
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