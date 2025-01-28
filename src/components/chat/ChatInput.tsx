import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t bg-white">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about your ticket data..."
          className="flex-1 bg-purple-50/50 border-purple-100 text-purple-900 placeholder:text-purple-400 focus:ring-purple-200 focus:border-purple-300"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-600 text-white border-none shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? (
            "Analyzing..."
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>
    </form>
  );
};