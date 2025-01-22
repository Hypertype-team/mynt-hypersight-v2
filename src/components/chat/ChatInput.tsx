import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <form onSubmit={onSubmit} className="border-t p-4 bg-background">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about your ticket data..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Send"}
        </Button>
      </div>
    </form>
  );
};