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
    <form onSubmit={onSubmit} className="p-4">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about your ticket data..."
          className="flex-1 bg-[#2a2a2a]/50 border-[#333] text-purple-100 placeholder:text-gray-500 focus:ring-purple-500/30 focus:border-purple-500/30"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border border-purple-500/30"
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