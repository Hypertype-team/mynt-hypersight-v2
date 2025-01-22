import { Layout } from "@/components/Layout";
import { ChatPanel } from "@/components/ChatPanel";

const Chat = () => {
  return (
    <Layout>
      <div className="h-[calc(100vh-3rem)]">
        <ChatPanel isOpen={true} onClose={() => {}} />
      </div>
    </Layout>
  );
};

export default Chat;