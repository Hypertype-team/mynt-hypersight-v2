import { cn } from "@/lib/utils";
import { ChatMessage } from "./types";
import { MessageChart } from "./MessageChart";
import { FollowUpQuestions } from "./FollowUpQuestions";

interface MessageProps {
  message: ChatMessage;
  onFollowUpClick: (question: string) => void;
}

export const Message = ({ message, onFollowUpClick }: MessageProps) => {
  return (
    <div className="break-words">
      <div
        className={cn(
          "p-3 rounded-lg max-w-[80%]",
          message.isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted"
        )}
      >
        {message.text}
      </div>
      {message.chartData && (
        <MessageChart
          chartData={message.chartData}
          chartType={message.chartType}
        />
      )}
      {!message.isUser && message.followUpQuestions && (
        <FollowUpQuestions
          questions={message.followUpQuestions}
          onQuestionClick={onFollowUpClick}
        />
      )}
    </div>
  );
};