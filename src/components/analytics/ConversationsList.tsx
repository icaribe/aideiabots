
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageCircle, Star, CheckCircle } from "lucide-react";
import { ConversationMetric } from "@/hooks/useAnalytics";

interface ConversationsListProps {
  conversations: ConversationMetric[];
  loading?: boolean;
}

export const ConversationsList = ({ conversations, loading }: ConversationsListProps) => {
  const formatDuration = (started: string, ended: string | null) => {
    if (!ended) return "Em andamento";
    
    const duration = new Date(ended).getTime() - new Date(started).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const formatResponseTime = (avgTime: number) => {
    return avgTime < 60 ? `${avgTime.toFixed(1)}s` : `${(avgTime / 60).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma conversa encontrada no período
            </p>
          ) : (
            conversations.slice(0, 10).map((conversation) => (
              <div key={conversation.id} className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={conversation.ended_at ? "default" : "secondary"}>
                      {conversation.ended_at ? "Finalizada" : "Em andamento"}
                    </Badge>
                    {conversation.resolved && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolvida
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.started_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {conversation.message_count} mensagens
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(conversation.started_at, conversation.ended_at)}
                  </div>
                  
                  {conversation.response_time_avg > 0 && (
                    <div className="flex items-center gap-1">
                      ⚡ {formatResponseTime(conversation.response_time_avg)}
                    </div>
                  )}
                  
                  {conversation.satisfaction_score && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {conversation.satisfaction_score}/5
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
