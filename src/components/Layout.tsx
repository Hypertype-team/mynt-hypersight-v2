import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./ChatPanel";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto px-6 py-6">
          {children}
        </div>
        <div className="w-[400px] border-l">
          <ChatPanel isOpen={true} onClose={() => {}} />
        </div>
      </main>
    </div>
  );
};