import { Button } from "@/components/ui/button";

interface FollowUpQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export const FollowUpQuestions = ({
  questions,
  onQuestionClick,
}: FollowUpQuestionsProps) => {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-purple-600 font-medium">Follow-up questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="text-sm bg-white hover:bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300 shadow-sm"
            onClick={() => onQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};