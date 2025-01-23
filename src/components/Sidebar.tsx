import { BarChart3, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const location = useLocation();

  const links = [
    { 
      icon: BarChart3, 
      label: "Charts", 
      description: "View analytics and data visualizations",
      path: "/" 
    },
    { 
      icon: MessageCircle, 
      label: "Chat", 
      description: "Interact with AI assistant",
      path: "/chat" 
    },
  ];

  return (
    <div className="w-64 border-r bg-background p-4 flex flex-col gap-2">
      {links.map(({ icon: Icon, label, description, path }) => (
        <Link
          key={path}
          to={path}
          className={cn(
            "p-3 flex flex-col gap-1 rounded-lg transition-colors hover:bg-accent",
            location.pathname === path && "bg-accent"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </div>
          <span className="text-sm text-muted-foreground pl-8">
            {description}
          </span>
        </Link>
      ))}
    </div>
  );
};