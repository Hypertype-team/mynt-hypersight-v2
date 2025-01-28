import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./ChatPanel";
import { useState } from "react";

export const Sidebar = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="w-[400px] border-r bg-background flex flex-col">
      <div className="p-4">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "p-3 flex items-center gap-3 rounded-lg transition-colors hover:bg-accent w-full text-left",
            isChatOpen && "bg-accent"
          )}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Chat</span>
        </button>
      </div>

      {isChatOpen && (
        <div className="flex-1 border-t">
          <ChatPanel isOpen={true} onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
};