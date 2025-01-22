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
        "- What are the common issues reported?\n" +
        "- Show me ticket summaries by category\n" +
        "- What are the subcategories?\n" +
        "- Show me department justifications\n" +
        "- What are the related links?\n",
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
      const lowercaseInput = input.toLowerCase();
      let data;
      let error;
      let analysis = "Based on the ticket analysis:\n\n";
      let chartData: any[] = [];
      let chartType: "bar" | "line" = "bar";

      if (lowercaseInput.includes('issue') || lowercaseInput.includes('problem')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('issue, common_issue')
          .not('issue', 'is', null);
        data = result.data;
        error = result.error;

        if (data) {
          const issueCount = data.reduce((acc: Record<string, number>, item) => {
            if (item.common_issue) {
              acc[item.common_issue] = (acc[item.common_issue] || 0) + 1;
            }
            return acc;
          }, {});

          chartData = Object.entries(issueCount).map(([name, value]) => ({
            name,
            value
          }));

          analysis += "Common issues reported:\n" + 
            Object.entries(issueCount)
              .map(([issue, count]) => `- ${issue}: ${count} tickets`)
              .join('\n');
        }
      } else if (lowercaseInput.includes('summary') || lowercaseInput.includes('category')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('summary, category')
          .not('summary', 'is', null);
        data = result.data;
        error = result.error;

        if (data) {
          const categoryCount = data.reduce((acc: Record<string, number>, item) => {
            if (item.category) {
              acc[item.category] = (acc[item.category] || 0) + 1;
            }
            return acc;
          }, {});

          chartData = Object.entries(categoryCount).map(([name, value]) => ({
            name,
            value
          }));

          analysis += "Summaries by category:\n" +
            Object.entries(categoryCount)
              .map(([category, count]) => `- ${category}: ${count} tickets`)
              .join('\n');
        }
      } else if (lowercaseInput.includes('subcategory')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('category, subcategory')
          .not('subcategory', 'is', null);
        data = result.data;
        error = result.error;

        if (data) {
          const subcategoryCount = data.reduce((acc: Record<string, number>, item) => {
            if (item.subcategory) {
              acc[item.subcategory] = (acc[item.subcategory] || 0) + 1;
            }
            return acc;
          }, {});

          chartData = Object.entries(subcategoryCount).map(([name, value]) => ({
            name,
            value
          }));

          analysis += "Subcategories distribution:\n" +
            Object.entries(subcategoryCount)
              .map(([subcategory, count]) => `- ${subcategory}: ${count} tickets`)
              .join('\n');
        }
      } else if (lowercaseInput.includes('justification') || lowercaseInput.includes('department')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('responsible_department, responsible_department_justification')
          .not('responsible_department_justification', 'is', null);
        data = result.data;
        error = result.error;

        if (data) {
          analysis += "Department justifications:\n" +
            data.map(item => 
              `- ${item.responsible_department}: ${item.responsible_department_justification}`
            ).join('\n');
        }
      } else if (lowercaseInput.includes('link')) {
        const result = await supabase
          .from('ticket_analysis')
          .select('category, link')
          .not('link', 'is', null);
        data = result.data;
        error = result.error;

        if (data) {
          analysis += "Related links by category:\n" +
            data.map(item => 
              `- ${item.category}: ${item.link}`
            ).join('\n');
        }
      }

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          text: analysis || "No relevant data found for your query.",
          isUser: false,
          chartData: chartData,
          chartType: chartType,
          followUpQuestions: [
            "What are the common issues reported?",
            "Show me ticket summaries by category",
            "What are the subcategories?",
            "Show me department justifications",
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