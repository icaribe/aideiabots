
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";

type MessageListProps = {
  messages: Message[];
};

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Inicie uma conversa enviando uma mensagem</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex",
            message.is_from_user ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-lg p-4",
              message.is_from_user
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-900"
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};
