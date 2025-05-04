
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Agents from "@/pages/Agents";
import CreateAgent from "@/pages/CreateAgent";
import EditAgent from "@/pages/EditAgent";
import Chat from "@/pages/Chat";
import ChatConversation from "@/pages/ChatConversation";
import Settings from "@/pages/Settings";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/create-agent" element={<CreateAgent />} />
        <Route path="/edit-agent/:id" element={<EditAgent />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:agentId" element={<ChatConversation />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors />
    </>
  );
}

export default App;
