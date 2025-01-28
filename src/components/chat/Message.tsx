import { cn } from "@/lib/utils";
import { ChatMessage } from "./types";
import { MessageChart } from "./MessageChart";
import { FollowUpQuestions } from "./FollowUpQuestions";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  message: ChatMessage;
  onFollowUpClick: (question: string) => void;
}

export const Message = ({ message, onFollowUpClick }: MessageProps) => {
  return (
    <div className="break-words">
      <div
        className={cn(
          "p-2 rounded-lg max-w-[90%] text-sm",
          message.isUser
            ? "bg-primary text-primary-foreground ml-auto"
            : "bg-muted"
        )}
      >
        {message.isUser ? (
          message.text
        ) : (
          <ReactMarkdown
            className="prose prose-sm dark:prose-invert max-w-none"
            components={{
              h1: ({ children }) => <h1 className="text-lg font-bold mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
              a: ({ href, children }) => (
                <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        )}
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