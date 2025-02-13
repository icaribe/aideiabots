
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { format } from "date-fns";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

type ConversationListProps = {
  conversations: Conversation[];
  currentConversation: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onBack: () => void;
};

export const ConversationList = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation,
  onBack,
}: ConversationListProps) => {
  return (
    <div className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button onClick={onNewConversation}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 ${
              currentConversation === conv.id ? "bg-gray-100" : ""
            }`}
            onClick={() => onConversationSelect(conv.id)}
          >
            {conv.title}
          </div>
        ))}
      </div>
    </div>
  );
};
