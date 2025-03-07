
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversation: Conversation) => void;
};

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        Nenhuma conversa encontrada
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors",
            conversation.id === activeConversationId && "bg-purple-100"
          )}
          onClick={() => onSelect(conversation)}
        >
          <div className="truncate font-medium">
            {conversation.title}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(conversation.created_at).toLocaleDateString()}
          </div>
        </button>
      ))}
    </div>
  );
};
