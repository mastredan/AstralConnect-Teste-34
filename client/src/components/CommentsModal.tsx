import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, Send, User, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommentsModalProps {
  post: any;
  children: React.ReactNode;
}

export function CommentsModal({ post, children }: CommentsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [showReplyFor, setShowReplyFor] = useState<string | null>(null);

  // Fetch comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['/api/posts', post.id, 'comments'],
  });

  // Fetch post stats
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0, userLiked: false }, refetch: refetchStats } = useQuery({
    queryKey: ['/api/posts', post.id, 'stats'],
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest(`/api/posts/${post.id}/comments`, "POST", { content });
    },
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
        variant: "destructive",
      });
    }
  });

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleReply = (commentId: string) => {
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) return;
    
    // For now, we'll add replies as regular comments
    // In a full implementation, you'd have a separate replies table
    commentMutation.mutate(`@Usuário ${replyText}`);
    setReplyTexts({ ...replyTexts, [commentId]: "" });
    setShowReplyFor(null);
  };

  // Comment like mutation
  const commentLikeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiRequest(`/api/comments/${commentId}/like`, "POST");
    },
    onSuccess: () => {
      refetchComments();
      toast({
        title: "Amém!",
        description: "Seu Amém foi registrado",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o Amém",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-gray-200">
          <DialogTitle className="text-center text-lg font-semibold text-gray-800">
            Post de {post.userName || "Irmão(ã) em Cristo"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[80vh]">
          {/* First Image Display */}
          {(post.imageUrls && post.imageUrls.length > 0) && (
            <div className="flex justify-center bg-black p-4">
              <img
                src={post.imageUrls[0]}
                alt="Post image"
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Video Display */}
          {post.videoUrl && (
            <div className="flex justify-center bg-black p-4">
              <video
                src={post.videoUrl}
                controls
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Post Stats */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span className="font-medium">{postStats.likesCount}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{postStats.commentsCount} comentários</span>
                <span>{postStats.sharesCount} compartilhamentos</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Comment Input */}
            <div className="flex space-x-3 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 bg-[#257b82] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 flex space-x-2">
                <Textarea
                  placeholder="Escreva um comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 min-h-[2.5rem] max-h-32 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <Button
                  onClick={handleComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  size="sm"
                  className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Seja o primeiro a comentar</p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="space-y-3">
                    {/* Main Comment */}
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-[#6ea1a7] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <div className="font-medium text-sm text-[#257b82]">
                            {comment.userName || comment.userEmail?.split('@')[0] || 'Usuário'}
                          </div>
                          <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                        </div>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center space-x-4 mt-2 ml-1">
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                          <button 
                            className="text-xs font-medium text-gray-600 hover:text-red-500 flex items-center space-x-1"
                            onClick={() => commentLikeMutation.mutate(comment.id)}
                            disabled={commentLikeMutation.isPending}
                          >
                            <Heart className="w-3 h-3" />
                            <span>Amém</span>
                          </button>
                          <button 
                            className="text-xs font-medium text-gray-600 hover:text-[#257b82]"
                            onClick={() => setShowReplyFor(showReplyFor === comment.id ? null : comment.id)}
                          >
                            Responder
                          </button>
                        </div>

                        {/* Reply Input */}
                        {showReplyFor === comment.id && (
                          <div className="mt-3 ml-4 flex space-x-2">
                            <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1 flex space-x-2">
                              <Textarea
                                placeholder="Escreva uma resposta..."
                                value={replyTexts[comment.id] || ""}
                                onChange={(e) => setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })}
                                className="flex-1 min-h-[2rem] max-h-20 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReply(comment.id);
                                  }
                                }}
                              />
                              <Button
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyTexts[comment.id]?.trim() || commentMutation.isPending}
                                size="sm"
                                className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-2 py-1 h-8"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}