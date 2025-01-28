import { cn } from "@/lib/utils";
import { ChatPanel } from "./ChatPanel";
import { useState } from "react";

export const Sidebar = () => {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="w-[450px] bg-black flex flex-col">
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};