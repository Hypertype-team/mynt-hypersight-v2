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
      text: `# Welcome! 👋

I'm your Ticket Analysis Assistant. Ask me about:

* 📊 Common issues and trends
* 📑 Ticket summaries by category
* 🏢 Department justifications
* 📚 Documentation links

How can I help you today?`,
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
    <div className="flex flex-col h-full bg-black">
      <ScrollArea className="flex-1 bg-black">
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
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};