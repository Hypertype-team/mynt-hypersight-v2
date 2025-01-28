import { BarChart3, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./ChatPanel";
import { useState } from "react";

export const Sidebar = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const links = [
    { 
      icon: BarChart3, 
      label: "Charts", 
      path: "/" 
    }
  ];

  return (
    <div className="w-[400px] border-r bg-background flex flex-col">
      <div className="p-4 flex flex-col gap-2">
        {links.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "p-3 flex items-center gap-3 rounded-lg transition-colors hover:bg-accent",
              location.pathname === path && "bg-accent"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
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