
import { Bot } from "lucide-react";

type ChatHeaderProps = {
  agentName: string;
};

export const ChatHeader = ({ agentName }: ChatHeaderProps) => {
  return (
    <header className="p-4 border-b bg-white flex items-center">
      <Bot className="h-6 w-6 text-purple-600 mr-2" />
      <h1 className="text-xl font-bold">{agentName}</h1>
    </header>
  );
};
