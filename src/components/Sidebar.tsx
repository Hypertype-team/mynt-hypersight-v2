import { BarChart3, MessageSquare, Table } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onChatOpen: () => void;
}

export const Sidebar = ({ onChatOpen }: SidebarProps) => {
  const location = useLocation();

  const links = [
    { icon: BarChart3, label: "Charts", path: "/" },
    { icon: Table, label: "Tables", path: "/tables" },
  ];

  return (
    <div className="w-16 border-r bg-background flex flex-col items-center py-4 gap-4">
      {links.map(({ icon: Icon, label, path }) => (
        <Link
          key={path}
          to={path}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-accent",
            location.pathname === path && "bg-accent"
          )}
        >
          <Icon className="w-5 h-5" />
        </Link>
      ))}
      <button
        onClick={onChatOpen}
        className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-accent mt-auto"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
  );
};