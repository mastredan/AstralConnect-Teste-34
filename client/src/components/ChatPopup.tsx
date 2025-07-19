import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  targetUserProfileImage?: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

interface Conversation {
  id: number;
  user1Id: string;
  user2Id: string;
  lastMessageAt: string;
  createdAt: string;
}

export function ChatPopup({ isOpen, onClose, targetUserId, targetUserName, targetUserProfileImage }: ChatPopupProps) {
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get or create conversation - Demo mode for testing
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['/api/conversations', targetUserId],
    queryFn: async () => {
      // Para demonstração, vamos simular uma conversa sem backend
      if (targetUserId.startsWith('demo_user_')) {
        return {
          id: 999,
          user1Id: 'current_user',
          user2Id: targetUserId,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        } as Conversation;
      }
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get conversation');
      }
      
      return await response.json() as Conversation;
    },
    enabled: isOpen,
  });

  // Get messages for the conversation - Demo mode with persistence
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/conversations', conversation?.id, 'messages'],
    queryFn: async () => {
      if (!conversation?.id) return [];
      
      // Para demonstração, usar localStorage para persistir mensagens
      if (conversation.id === 999) {
        const storageKey = `orlev_chat_messages_${targetUserId}`;
        const savedMessages = localStorage.getItem(storageKey);
        return savedMessages ? JSON.parse(savedMessages) : [];
      }
      
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to get messages');
      }
      
      return await response.json() as Message[];
    },
    enabled: !!conversation?.id,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  // Send message mutation - Demo mode for testing
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversation?.id) throw new Error('No conversation found');
      
      // Para demonstração, simular envio sem backend
      if (conversation.id === 999) {
        return {
          id: Date.now(),
          conversationId: 999,
          senderId: 'current_user',
          content,
          readAt: null,
          createdAt: new Date().toISOString(),
        };
      }
      
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    },
    onSuccess: (newMessage) => {
      setMessageContent("");
      
      // Para demonstração, salvar mensagem no localStorage e atualizar cache
      if (conversation?.id === 999) {
        const storageKey = `orlev_chat_messages_${targetUserId}`;
        const savedMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedMessages = [...savedMessages, newMessage];
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
        
        queryClient.setQueryData(
          ['/api/conversations', conversation.id, 'messages'],
          updatedMessages
        );
      } else {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/conversations', conversation?.id, 'messages'] 
        });
      }
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate(messageContent.trim());
    // Retornar foco para o input após enviar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-focus no input quando o chat abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[600px] flex flex-col shadow-2xl border-2 border-[#257b82]">
        {/* Header */}
        <div className="p-4 border-b bg-[#257b82] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={targetUserProfileImage} />
                <AvatarFallback className="bg-[#7fc7ce] text-[#257b82]">
                  {targetUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white font-semibold">{targetUserName}</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-[#6ea1a7] h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4 bg-white">
          {conversationLoading || messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-[#6ea1a7]">Carregando mensagens...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-[#6ea1a7] mt-8">
                  Inicie a conversa enviando uma mensagem
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start gap-2"
                  >
                    {/* Avatar - sempre do lado esquerdo de cada mensagem */}
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={targetUserProfileImage} />
                      <AvatarFallback className="bg-[#7fc7ce] text-[#257b82] text-xs">
                        {targetUserName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderId === targetUserId
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-[#257b82] text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === targetUserId
                            ? 'text-gray-500'
                            : 'text-[#e7f5f6]'
                        }`}
                      >
                        {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message input */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 border-[#7fc7ce] focus:ring-[#257b82]"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || sendMessageMutation.isPending}
              className="bg-[#257b82] hover:bg-[#6ea1a7] text-white"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}