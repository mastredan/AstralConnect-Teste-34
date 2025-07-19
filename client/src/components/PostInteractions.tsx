import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, Share, Bookmark, Send, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommentsModal } from "@/components/CommentsModal";
import { Link } from "wouter";

interface PostInteractionsProps {
  post: any;
}

export function PostInteractions({ post }: PostInteractionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Fetch post stats
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0, userLiked: false }, refetch: refetchStats } = useQuery({
    queryKey: ['/api/posts', post.id, 'stats'],
  });

  // Fetch comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['/api/posts', post.id, 'comments'],
  });

  // Fetch comment stats for the first comment
  const firstComment = comments[0];
  const { data: commentStats = { likesCount: 0, userLiked: false }, refetch: refetchCommentStats } = useQuery({
    queryKey: ['/api/comments', firstComment?.id, 'stats'],
    enabled: !!firstComment?.id,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/posts/${post.id}/like`, "POST");
    },
    onSuccess: () => {
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Amém!",
        description: postStats.userLiked ? "Amém removido" : "Você disse Amém para esta postagem",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível curtir a postagem",
        variant: "destructive",
      });
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/posts/${post.id}/share`, "POST");
    },
    onSuccess: () => {
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Compartilhado!",
        description: "Postagem compartilhada com seus seguidores",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar a postagem",
        variant: "destructive",
      });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; parentCommentId?: number }) => {
      await apiRequest(`/api/posts/${post.id}/comments`, "POST", data);
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

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest(`/api/comments/${commentId}`, "DELETE");
    },
    onSuccess: () => {
      refetchComments();
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Comentário excluído",
        description: "Seu comentário foi removido com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário",
        variant: "destructive",
      });
    }
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      await apiRequest(`/api/comments/${commentId}`, "PUT", { content });
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditingText("");
      refetchComments();
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Comentário editado",
        description: "Comentário foi editado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível editar o comentário",
        variant: "destructive",
      });
    }
  });

  // Like comment mutation
  const commentLikeMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest(`/api/comments/${commentId}/like`, "POST");
    },
    onSuccess: () => {
      refetchCommentStats();
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
      toast({
        title: "Amém!",
        description: commentStats.userLiked ? "Amém removido" : "Você disse Amém para este comentário",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível curtir o comentário",
        variant: "destructive",
      });
    }
  });

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ content: commentText });
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editingText.trim()) return;
    editCommentMutation.mutate({ commentId: editingCommentId!, content: editingText });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  // Get unique commenters for tooltip
  const getCommentersNames = () => {
    const uniqueCommenters = comments.reduce((acc: any[], comment: any) => {
      if (!acc.find(c => c.userId === comment.userId)) {
        acc.push(comment);
      }
      return acc;
    }, []);
    return uniqueCommenters.map(comment => comment.userName || comment.userEmail?.split('@')[0] || 'Usuário').join(', ');
  };

  return (
    <>
      {/* Post Stats */}
      {(postStats.likesCount > 0 || postStats.commentsCount > 0 || postStats.sharesCount > 0) && (
        <div className="flex items-center justify-between py-3 px-1 text-sm text-gray-600">
          {/* Left side - Heart emoji + Amém count or empty div for spacing */}
          <div className="flex items-center space-x-2">
            {postStats.likesCount > 0 && (
              <>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span className="font-medium">{postStats.likesCount}</span>
              </>
            )}
          </div>
          
          {/* Right side - Comments and shares count */}
          <div className="flex items-center space-x-4 ml-auto">
            {postStats.commentsCount > 0 && (
              <CommentsModal post={post}>
                <span 
                  className="cursor-pointer hover:underline"
                  title={comments.length > 0 ? `Comentários de: ${getCommentersNames()}` : "Nenhum comentário"}
                >
                  {postStats.commentsCount} comentários
                </span>
              </CommentsModal>
            )}
            {postStats.sharesCount > 0 && (
              <span>{postStats.sharesCount} compartilhamentos</span>
            )}
          </div>
        </div>
      )}
      
      {/* Divider */}
      <div className="border-t border-gray-200"></div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-1 py-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
            postStats.userLiked 
              ? 'text-red-500 bg-red-50 hover:bg-red-100' 
              : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Heart className={`w-5 h-5 ${postStats.userLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">Amém</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center justify-center space-x-2 py-3 rounded-lg text-gray-600 hover:text-[#257b82] hover:bg-[#e7f5f6] transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comentar</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => shareMutation.mutate()}
          disabled={shareMutation.isPending}
          className="flex items-center justify-center space-x-2 py-3 rounded-lg text-gray-600 hover:text-[#257b82] hover:bg-[#e7f5f6] transition-colors"
        >
          <Share className="w-5 h-5" />
          <span className="text-sm font-medium">Compartilhar</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center justify-center space-x-2 py-3 rounded-lg text-gray-600 hover:text-[#257b82] hover:bg-[#e7f5f6] transition-colors"
          onClick={() => {
            toast({
              title: "Salvo!",
              description: "Postagem salva nos seus favoritos",
            });
          }}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-sm font-medium">Salvar</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          {/* Comment Input */}
          <div className="flex space-x-3">
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

          {/* Comments List - Show only 1 comment */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Seja o primeiro a comentar</p>
            ) : (
              <>
                {/* Show only the first comment */}
                {comments.slice(0, 1).map((comment: any) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-[#6ea1a7] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-3 py-1.5 inline-block">
                          <Link href={`/profile/${comment.userId}`}>
                            <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                              {comment.user?.fullName || 'Irmão(ã) em Cristo'}
                            </div>
                          </Link>
                          {editingCommentId === comment.id ? (
                            <div className="mt-2">
                              <div className="flex space-x-2">
                                <Textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="flex-1 min-h-[2.5rem] max-h-32 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82]"
                                  placeholder="Edite seu comentário..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEdit();
                                    }
                                  }}
                                />
                                <div className="flex flex-col space-y-1">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={!editingText.trim() || editCommentMutation.isPending}
                                    className="bg-[#257b82] hover:bg-[#1a5a61] text-white text-xs px-2 py-1 h-6"
                                  >
                                    {editCommentMutation.isPending ? 'Salvando...' : 'Salvar'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="text-xs px-2 py-1 h-6"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-800">{comment.content}</p>
                              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                <span className="text-xs text-gray-400 ml-2">Editado</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4 ml-1">
                            <div className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </div>
                            <button 
                              className={`text-xs font-medium flex items-center space-x-1 transition-colors ${
                                commentStats.likesCount > 0 && commentStats.userLiked 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-gray-600 hover:text-red-500'
                              }`}
                              onClick={() => commentLikeMutation.mutate(comment.id)}
                              disabled={commentLikeMutation.isPending}
                            >
                              <Heart className={`w-3 h-3 ${
                                commentStats.likesCount > 0 && commentStats.userLiked 
                                  ? 'fill-current' 
                                  : ''
                              }`} />
                              <span>Amém</span>
                            </button>
                            <button 
                              className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                              onClick={() => {
                                toast({
                                  title: "Responder",
                                  description: "Funcionalidade de resposta será implementada",
                                });
                              }}
                            >
                              Responder
                            </button>
                            {comment.userId === user?.id && (
                              <>
                                <button 
                                  className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                                  onClick={() => handleEditComment(comment)}
                                  disabled={editingCommentId === comment.id}
                                >
                                  Editar
                                </button>
                                <button 
                                  className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  disabled={deleteCommentMutation.isPending}
                                >
                                  {deleteCommentMutation.isPending ? 'Excluindo...' : 'Excluir'}
                                </button>
                              </>
                            )}
                          </div>
                          
                          {commentStats.likesCount > 0 && (
                            <div className="flex items-center space-x-1 mr-1">
                              <span className="text-sm">❤️</span>
                              <span className="text-xs text-gray-600">{commentStats.likesCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Ver mais comentários link */}
                {comments.length > 1 && (
                  <CommentsModal post={post}>
                    <button className="text-[#257b82] text-sm font-medium hover:underline ml-11">
                      Ver mais comentários
                    </button>
                  </CommentsModal>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}