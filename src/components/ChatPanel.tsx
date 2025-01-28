import { ChatContainer } from "./chat/ChatContainer";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="h-full">
      <ChatContainer />
    </div>
  );
};