import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./Message";
import { ChatMessage } from "./types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  onFollowUpClick: (question: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({ messages, onFollowUpClick, scrollRef }: ChatMessagesProps) => {
  return (
    <ScrollArea className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-purple-50/30">
      <div className="p-4 space-y-6">
        {messages.map((message, i) => (
          <Message
            key={i}
            message={message}
            onFollowUpClick={onFollowUpClick}
          />
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};