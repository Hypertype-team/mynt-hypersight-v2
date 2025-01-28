import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./types";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export const ChatContainer = () => {
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");

    try {
      console.log('Sending request to analyze-tickets function');
      const { data, error } = await supabase.functions.invoke('analyze-tickets', {
        body: { query: input },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Response from analyze-tickets:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.answer) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

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
      console.error('Error in chat submission:', error);
      toast({
        title: "Chat Error",
        description: "I couldn't process your message right now. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but I encountered an error while processing your message. Could you please try again?",
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
    <div className="flex flex-col h-full bg-white shadow-lg">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Ticket Analysis Assistant</h2>
        <p className="text-sm text-gray-700">Ask me anything about your tickets</p>
      </div>
      <ChatMessages 
        messages={messages} 
        onFollowUpClick={handleFollowUpClick} 
        scrollRef={scrollRef}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />
    </div>
  );
};