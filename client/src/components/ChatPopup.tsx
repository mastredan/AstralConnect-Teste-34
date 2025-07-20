import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, X, ImagePlus, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  imageUrl?: string;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Get target user profile data
  const { data: targetUser } = useQuery({
    queryKey: ['/api/users', targetUserId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${targetUserId}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch target user data');
      }
      return response.json();
    },
    enabled: !!targetUserId && isOpen,
    staleTime: 0 // Always fetch fresh data
  });

  // Get or create conversation - Using real backend
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['/api/conversations', targetUserId],
    queryFn: async () => {
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

  // Get messages for the conversation - Using real backend
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/conversations', conversation?.id, 'messages'],
    queryFn: async () => {
      if (!conversation?.id) return [];
      
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      
      if (!response.ok) {
        throw new Error('Failed to get messages');
      }
      
      return await response.json() as Message[];
    },
    enabled: !!conversation?.id,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  // Send message mutation - Using real backend
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string, imageUrl?: string }) => {
      if (!conversation?.id) throw new Error('No conversation found');
      
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setMessageContent("");
      setSelectedImage(null);
      setPreviewImage(null);
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', conversation?.id, 'messages'] 
      });
      
      // Focus back to input after successful send
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive",
      });
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/chat', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return await response.json();
    },
  });

  // Clear conversation mutation
  const clearConversationMutation = useMutation({
    mutationFn: async () => {
      if (!conversation?.id) throw new Error('No conversation found');
      
      const response = await fetch(`/api/conversations/${conversation.id}/clear`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear conversation');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', conversation?.id, 'messages'] 
      });
      toast({
        title: "Conversa limpa",
        description: "Todas as mensagens foram excluídas",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir mensagens",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() && !selectedImage) return;

    let imageUrl = '';
    
    // Upload image first if selected
    if (selectedImage) {
      try {
        const uploadResult = await uploadImageMutation.mutateAsync(selectedImage);
        imageUrl = uploadResult.imageUrl;
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao enviar imagem",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Send message with or without image
    sendMessageMutation.mutate({ 
      content: messageContent.trim() || (imageUrl ? "" : ""), 
      imageUrl: imageUrl || undefined 
    });
    
    // Return focus to input
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

  const handleClearConversation = () => {
    clearConversationMutation.mutate();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
  };

  // Download image function
  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `imagem_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="fixed bottom-0 right-20 z-50">
      <Card className="w-96 h-[600px] flex flex-col shadow-2xl border-2 border-[#257b82]">
        {/* Header */}
        <div className="p-4 border-b bg-[#257b82] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={targetUser?.profileImageUrl || targetUserProfileImage} 
                  className="object-cover w-full h-full"
                  style={{ imageRendering: 'auto' }}
                />
                <AvatarFallback className="bg-[#7fc7ce] text-[#257b82]">
                  {(targetUser?.fullName || targetUserName).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white font-semibold">{targetUser?.fullName || targetUserName}</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Close button */}
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
                messages.map((message) => {
                  const isCurrentUser = message.senderId === user?.id;
                  const avatar = isCurrentUser ? user?.profileImageUrl : (targetUser?.profileImageUrl || targetUserProfileImage);
                  const userName = isCurrentUser ? user?.fullName : (targetUser?.fullName || targetUserName);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar correto para cada usuário */}
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage 
                          src={avatar} 
                          className="object-cover w-full h-full"
                          style={{ imageRendering: 'auto' }}
                        />
                        <AvatarFallback className="bg-[#7fc7ce] text-[#257b82] text-xs">
                          {userName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div
                        className={`max-w-[70%] ${
                          message.imageUrl 
                            ? 'rounded-lg' 
                            : `p-3 rounded-lg ${isCurrentUser
                                ? 'bg-[#257b82] text-white'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                              }`
                        }`}
                      >
                        {/* Show image if exists */}
                        {message.imageUrl && (
                          <img 
                            src={message.imageUrl} 
                            alt="Imagem enviada" 
                            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setExpandedImage(message.imageUrl)}
                          />
                        )}
                        {/* Only show text content if message has content AND it's not "Imagem enviada" */}
                        {message.content && message.content !== "Imagem enviada" && (
                          <p className={`text-sm ${message.imageUrl ? 'mt-2 p-3 rounded-lg ' + (isCurrentUser ? 'bg-[#257b82] text-white' : 'bg-gray-100 text-gray-800 border border-gray-200') : ''}`}>
                            {message.content}
                          </p>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Expanded Image Modal */}
        {expandedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <div 
              className="relative max-w-[90vw] max-h-[90vh] bg-transparent rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 z-[70] flex gap-2">
                <Button
                  onClick={() => downloadImage(expandedImage)}
                  className="bg-[#257b82] hover:bg-[#1e626a] text-white p-2 rounded-full shadow-lg"
                  size="sm"
                >
                  <Download size={16} />
                </Button>
                <Button
                  onClick={() => setExpandedImage(null)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                  size="sm"
                >
                  <X size={16} />
                </Button>
              </div>
              <img 
                src={expandedImage} 
                alt="Imagem expandida" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxWidth: '80vw', maxHeight: '80vh' }}
              />
            </div>
          </div>
        )}

        {/* Image preview */}
        {previewImage && (
          <div className="p-4 border-t bg-gray-50">
            <div className="relative inline-block">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-lg"
              />
              <Button
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 rounded-full"
                size="sm"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons and message input */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          {/* Action buttons */}
          <div className="flex justify-between mb-3">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="border-[#7fc7ce] text-[#257b82] hover:bg-[#e7f5f6] p-2"
                disabled={uploadImageMutation.isPending}
              >
                <ImagePlus size={16} />
              </Button>
            </div>
            
            {/* Trash button moved here */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-300 text-red-600 hover:bg-red-50 p-2"
                  disabled={clearConversationMutation.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir todas as mensagens?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todas as mensagens desta conversa serão permanentemente excluídas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearConversation}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Message input */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 border-[#7fc7ce] focus:ring-[#257b82]"
              disabled={sendMessageMutation.isPending || uploadImageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!messageContent.trim() && !selectedImage) || sendMessageMutation.isPending || uploadImageMutation.isPending}
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