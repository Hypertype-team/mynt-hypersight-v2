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
    <div className="break-words animate-fadeIn">
      <div
        className={cn(
          "p-4 rounded-2xl max-w-[90%] text-sm shadow-sm",
          message.isUser
            ? "bg-purple-500/10 ml-auto rounded-br-none border border-purple-500/20 text-purple-900"
            : "bg-white rounded-bl-none border border-purple-100/50 text-gray-800 shadow-md"
        )}
      >
        {message.isUser ? (
          message.text
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            components={{
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-purple-900">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-purple-800">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-purple-700">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-gray-700">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-gray-700">{children}</ol>,
              a: ({ href, children }) => (
                <a href={href} className="text-purple-600 hover:text-purple-500 underline transition-colors" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs">
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