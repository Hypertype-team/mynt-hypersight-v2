import { BarChart3, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const location = useLocation();

  const links = [
    { icon: BarChart3, label: "Charts", path: "/" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
  ];

  return (
    <div className="w-16 border-r border-white/10 bg-secondary flex flex-col items-center py-4 gap-4">
      {links.map(({ icon: Icon, label, path }) => (
        <Link
          key={path}
          to={path}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10",
            location.pathname === path && "bg-white/10"
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </Link>
      ))}
    </div>
  );
};