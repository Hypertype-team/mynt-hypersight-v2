import { cn } from "@/lib/utils";
import { ChatPanel } from "./ChatPanel";
import { useState } from "react";

export const Sidebar = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="w-[450px] border-r border-[#333] bg-[hsl(240,21%,12%)] flex flex-col">
      {isChatOpen && (
        <div className="flex-1">
          <ChatPanel isOpen={true} onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
};