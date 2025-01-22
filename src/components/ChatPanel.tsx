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
      let query = supabase.from('ticket_analysis').select('*');
      
      // Basic keyword matching for different types of analysis
      const lowercaseInput = input.toLowerCase();
      
      if (lowercaseInput.includes('priority') || lowercaseInput.includes('priorities')) {
        query = supabase.from('ticket_analysis')
          .select('priority, count')
          .not('priority', 'is', null);
      } else if (lowercaseInput.includes('category') || lowercaseInput.includes('categories')) {
        query = supabase.from('ticket_analysis')
          .select('category, count')
          .not('category', 'is', null);
      } else if (lowercaseInput.includes('sentiment')) {
        query = supabase.from('ticket_analysis')
          .select('sentiment, responsible_department, count')
          .not('sentiment', 'is', null);
      } else if (lowercaseInput.includes('company') || lowercaseInput.includes('companies')) {
        query = supabase.from('ticket_analysis')
          .select('company_name, count')
          .not('company_name', 'is', null);
      } else if (lowercaseInput.includes('issue') || lowercaseInput.includes('issues')) {
        query = supabase.from('ticket_analysis')
          .select('common_issue, count')
          .not('common_issue', 'is', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data and create a response
      let analysis = "Based on the ticket analysis:\n\n";
      let chartData = [];
      let chartType = 'bar';

      if (data && data.length > 0) {
        // Format data based on query type
        if (lowercaseInput.includes('priority')) {
          chartData = data.map(item => ({
            name: item.priority || 'Unspecified',
            value: item.count
          }));
          analysis += `Distribution of ticket priorities:\n${data.map(item => 
            `- ${item.priority || 'Unspecified'}: ${item.count} tickets`
          ).join('\n')}`;
        } else if (lowercaseInput.includes('category')) {
          chartData = data.map(item => ({
            name: item.category || 'Unspecified',
            value: item.count
          }));
          analysis += `Category distribution:\n${data.map(item => 
            `- ${item.category || 'Unspecified'}: ${item.count} tickets`
          ).join('\n')}`;
        }
        // Add similar processing for other query types
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