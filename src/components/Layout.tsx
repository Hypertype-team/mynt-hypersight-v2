import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./ChatPanel";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container w-full max-w-[calc(100%-2rem)] mx-auto py-6">
          {children}
        </div>
      </main>
      <ChatPanel isOpen={true} onClose={() => {}} />
    </div>
  );
};