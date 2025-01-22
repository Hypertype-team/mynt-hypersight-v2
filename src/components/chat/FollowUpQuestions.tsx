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
    <div className="mt-2 space-y-2">
      <p className="text-sm text-muted-foreground">Follow-up questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="text-sm"
            onClick={() => onQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};