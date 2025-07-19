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
  const [optimisticLike, setOptimisticLike] = useState<{ userLiked: boolean; likesCount: number } | null>(null);

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

  // Like mutation with instant optimistic update
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/posts/${post.id}/like`, "POST");
    },
    onSuccess: () => {
      // Clear optimistic state and refetch real data
      setOptimisticLike(null);
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      // Clear optimistic state on error
      setOptimisticLike(null);
      toast({
        title: "Erro",
        description: "Não foi possível curtir a postagem",
        variant: "destructive",
      });
    }
  });

  // Handle like click with instant UI update
  const handleLike = () => {
    console.log("handleLike clicked - BEFORE:", { optimisticLike, postStats });
    
    const currentLiked = optimisticLike?.userLiked ?? postStats.userLiked;
    const currentCount = optimisticLike?.likesCount ?? parseInt(postStats.likesCount || "0");
    
    const newState = {
      userLiked: !currentLiked,
      likesCount: !currentLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
    };
    
    console.log("handleLike - NEW STATE:", newState);
    
    // Update UI instantly
    setOptimisticLike(newState);
    
    // Then trigger API call
    likeMutation.mutate();
  };

  // Get current like state (optimistic or real)
  const currentLikeState = {
    userLiked: optimisticLike?.userLiked ?? postStats.userLiked,
    likesCount: optimisticLike?.likesCount ?? parseInt(postStats.likesCount || "0")
  };

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
    mutationFn: async (content: string) => {
      await apiRequest(`/api/posts/${post.id}/comments`, "POST", { content });
    },
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário",
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
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível editar o comentário",
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
        description: "O comentário foi removido",
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

  // Comment like mutation
  const commentLikeMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest(`/api/comments/${commentId}/like`, "POST");
    },
    onSuccess: () => {
      refetchCommentStats();
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
    commentMutation.mutate(commentText);
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editingText.trim() || !editingCommentId) return;
    editCommentMutation.mutate({
      commentId: editingCommentId,
      content: editingText
    });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  return (
    <>
      {/* Counters Row - Only show when there are interactions */}
      {(currentLikeState.likesCount > 0 || postStats.commentsCount > 0 || postStats.sharesCount > 0) && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div>
            {currentLikeState.likesCount > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-sm">❤️</span>
                <span className="text-sm text-gray-600">{currentLikeState.likesCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {postStats.commentsCount > 0 && (
              <div className="text-sm text-gray-600">{postStats.commentsCount} comentário{postStats.commentsCount > 1 ? 's' : ''}</div>
            )}
            {postStats.sharesCount > 0 && (
              <div className="text-sm text-gray-600">{postStats.sharesCount} compartilhamento{postStats.sharesCount > 1 ? 's' : ''}</div>
            )}
          </div>
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200">
        <div className="flex items-center space-x-8">
          <button 
            className={`flex items-center space-x-1 transition-colors ${
              currentLikeState.userLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-600 hover:text-red-500'
            }`}
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <Heart className={`w-4 h-4 ${currentLikeState.userLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Amém</span>
          </button>
          
          <button 
            className="flex items-center space-x-1 text-gray-600 hover:text-[#257b82] transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="text-sm">💬</span>
            <span className="text-sm font-medium">Comentar</span>
          </button>
          
          <button 
            className="flex items-center space-x-1 text-gray-600 hover:text-[#257b82] transition-colors"
            onClick={() => shareMutation.mutate()}
            disabled={shareMutation.isPending}
          >
            <span className="text-sm">✈</span>
            <span className="text-sm font-medium">Compartilhar</span>
          </button>
        </div>
        
        <button className="text-gray-600 hover:text-[#257b82] transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-4">
          {/* Add Comment */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-[#6ea1a7] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
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
                        {editingCommentId === comment.id ? (
                          <div className="w-full space-y-2">
                            <Textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full min-h-[3rem] max-h-32 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82]"
                              placeholder="Edite seu comentário..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit();
                                }
                              }}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="xs"
                                onClick={handleSaveEdit}
                                disabled={!editingText.trim() || editCommentMutation.isPending}
                                className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-2 py-1 text-xs h-6"
                              >
                                {editCommentMutation.isPending ? 'Salvando...' : 'Salvar'}
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="px-2 py-1 text-xs h-6"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-2xl px-3 py-1.5 inline-block">
                            <div className="flex items-center space-x-2">
                              <Link href={`/profile/${comment.userId}`}>
                                <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                  {comment.user?.fullName || 'Irmão(ã) em Cristo'}
                                </div>
                              </Link>
                              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                <span className="text-xs text-gray-400">Editado</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-800">{comment.content}</p>
                            </div>
                          </div>
                        )}
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