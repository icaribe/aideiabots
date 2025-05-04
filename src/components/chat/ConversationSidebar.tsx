
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationList } from "./ConversationList";
import { Conversation } from "@/types/chat";

type ConversationSidebarProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
};

export const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelect,
  onNewConversation,
}: ConversationSidebarProps) => {
  const navigate = useNavigate();

  return (
    <aside className="w-full md:w-64 border-r bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/chat')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Conversas</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewConversation}
        >
          Nova
        </Button>
      </div>
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={onSelect}
      />
    </aside>
  );
};
