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
      // Query the ticket_analysis table based on user input
      const lowercaseInput = input.toLowerCase();
      let data;
      let error;
      
      if (lowercaseInput.includes('priority') || lowercaseInput.includes('priorities')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('priority')
          .not('priority', 'is', null);
        data = result.data;
        error = result.error;
        
        // Count occurrences of each priority
        if (data) {
          const counts = data.reduce((acc: Record<string, number>, item) => {
            acc[item.priority] = (acc[item.priority] || 0) + 1;
            return acc;
          }, {});
          data = Object.entries(counts).map(([priority, count]) => ({
            name: priority,
            value: count
          }));
        }
      } else if (lowercaseInput.includes('category') || lowercaseInput.includes('categories')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('category')
          .not('category', 'is', null);
        data = result.data;
        error = result.error;
        
        // Count occurrences of each category
        if (data) {
          const counts = data.reduce((acc: Record<string, number>, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
          }, {});
          data = Object.entries(counts).map(([category, count]) => ({
            name: category,
            value: count
          }));
        }
      } else if (lowercaseInput.includes('sentiment')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('sentiment, responsible_department')
          .not('sentiment', 'is', null);
        data = result.data;
        error = result.error;
        
        // Count occurrences of each sentiment per department
        if (data) {
          const counts = data.reduce((acc: Record<string, number>, item) => {
            const key = `${item.sentiment} (${item.responsible_department})`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
          data = Object.entries(counts).map(([key, count]) => ({
            name: key,
            value: count
          }));
        }
      }

      if (error) throw error;

      // Process the data and create a response
      let analysis = "Based on the ticket analysis:\n\n";
      let chartData = data || [];
      let chartType: "bar" | "line" = "bar";

      if (data && data.length > 0) {
        if (lowercaseInput.includes('priority')) {
          analysis += `Distribution of ticket priorities:\n${data.map(item => 
            `- ${item.name}: ${item.value} tickets`
          ).join('\n')}`;
        } else if (lowercaseInput.includes('category')) {
          analysis += `Category distribution:\n${data.map(item => 
            `- ${item.name}: ${item.value} tickets`
          ).join('\n')}`;
        } else if (lowercaseInput.includes('sentiment')) {
          analysis += `Sentiment distribution by department:\n${data.map(item => 
            `- ${item.name}: ${item.value} tickets`
          ).join('\n')}`;
        }
      } else {
        analysis = "No relevant data found for your query.";
      }

      setMessages((prev) => [
        ...prev,
        {
          text: analysis,
          isUser: false,
          chartData: chartData,
          chartType: chartType,
          followUpQuestions: [
            "What are the most common categories?",
            "Show me the priority distribution",
            "How are sentiments distributed?",
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