import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, Share, Bookmark, Send, User, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import CommentsModal from "@/components/CommentsModal";
import { Link } from "wouter";

// Component for comment like button with stats in feed
function CommentLikeButton({ commentId, onLike, disabled }: { commentId: number; onLike: () => void; disabled: boolean }) {
  const { data: stats = { likesCount: 0, userLiked: false } } = useQuery({
    queryKey: ['/api/comments', commentId, 'stats'],
    enabled: !!commentId,
  });

  const handleClick = () => {
    console.log('CommentLikeButton clicked for commentId:', commentId, 'current stats:', stats);
    onLike();
  };

  return (
    <button 
      className={`text-xs font-medium flex items-center space-x-1 transition-colors ${
        stats.userLiked 
          ? "text-red-500" 
          : "text-gray-600 hover:text-red-500"
      }`}
      onClick={handleClick}
      disabled={disabled}
    >
      <Heart className={`w-3 h-3 ${stats.userLiked ? 'fill-current text-red-500' : 'text-gray-400'}`} />
      <span>Amém</span>
    </button>
  );
}

// Component for displaying comment like count on the right side
function CommentLikeCount({ commentId }: { commentId: number }) {
  const { data: stats = { likesCount: 0, userLiked: false } } = useQuery({
    queryKey: ['/api/comments', commentId, 'stats'],
    enabled: !!commentId,
  });

  if (stats.likesCount === 0) return null;

  return (
    <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
      <span className="text-xs font-medium text-gray-700">{stats.likesCount}</span>
      <span className="text-sm">❤️</span>
    </div>
  );
}

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
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [showReplyFor, setShowReplyFor] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: number]: string }>({});
  const [showNestedReplyFor, setShowNestedReplyFor] = useState<number | null>(null);
  const [nestedReplyTexts, setNestedReplyTexts] = useState<{ [key: number]: string }>({});
  const [replyStats, setReplyStats] = useState<{ [key: number]: { likesCount: number; userLiked: boolean } }>({});

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

  // Sync optimistic state with real data when server data updates
  useEffect(() => {
    if (optimisticLike && postStats && !isLikeProcessing) {
      // Clear optimistic state immediately when server data arrives
      setOptimisticLike(null);
    }
  }, [postStats, optimisticLike, isLikeProcessing]);

  // Load reply stats when comments change
  useEffect(() => {
    if (comments.length > 0) {
      comments.forEach((comment: any) => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach((reply: any) => {
            if (!replyStats[reply.id]) {
              fetchReplyStats(reply.id);
            }
          });
        }
      });
    }
  }, [comments]);

  // Like mutation with instant optimistic update
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/posts/${post.id}/like`, "POST");
    },
    onSuccess: () => {
      // No delay - immediate sync
      setIsLikeProcessing(false);
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      // Only clear optimistic state on error to revert the UI
      setIsLikeProcessing(false);
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
    const currentLiked = optimisticLike?.userLiked ?? postStats.userLiked;
    const currentCount = optimisticLike?.likesCount ?? parseInt(postStats.likesCount || "0");
    
    const newState = {
      userLiked: !currentLiked,
      likesCount: !currentLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
    };
    
    // Update UI instantly - no processing check to allow rapid clicks
    setOptimisticLike(newState);
    setIsLikeProcessing(true);
    
    // Trigger API call immediately  
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

  // Reply like mutation - for sub comments
  const replyLikeMutation = useMutation({
    mutationFn: async (replyId: number) => {
      const response = await apiRequest(`/api/comments/${replyId}/like`, "POST");
      return { replyId, response };
    },
    onSuccess: (data) => {
      // Invalidate specific reply stats query
      queryClient.invalidateQueries({ queryKey: ['/api/comments', data.replyId, 'stats'] });
      // Fetch updated stats for this specific reply
      fetchReplyStats(data.replyId);
    },
    onError: () => {
      // Silent error handling
    }
  });

  // Function to fetch stats for a specific reply
  const fetchReplyStats = async (replyId: number) => {
    try {
      const response = await fetch(`/api/comments/${replyId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setReplyStats(prev => ({
          ...prev,
          [replyId]: { likesCount: stats.likesCount, userLiked: stats.userLiked }
        }));
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (data: { content: string; parentCommentId: number }) => {
      await apiRequest(`/api/posts/${post.id}/comments`, "POST", data);
    },
    onSuccess: () => {
      setReplyTexts({});
      setNestedReplyTexts({});
      setShowReplyFor(null);
      setShowNestedReplyFor(null);
      refetchComments();
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      // Silent error - could add subtle error handling if needed
    }
  });

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleReply = (parentCommentId: number) => {
    const replyContent = replyTexts[parentCommentId]?.trim();
    if (!replyContent) return;
    replyMutation.mutate({ content: replyContent, parentCommentId });
  };

  const handleNestedReply = (replyId: number, originalCommentId: number) => {
    const replyContent = nestedReplyTexts[replyId]?.trim();
    if (!replyContent) return;
    replyMutation.mutate({ content: replyContent, parentCommentId: originalCommentId });
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
              <CommentsModal post={post}>
                <button className="text-sm text-gray-600 hover:text-[#257b82] transition-colors cursor-pointer">
                  {postStats.commentsCount} comentário{postStats.commentsCount > 1 ? 's' : ''}
                </button>
              </CommentsModal>
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
              <div className="w-8 h-8 bg-[#6ea1a7] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.fullName || 'Profile'} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
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
                      <div className="w-8 h-8 bg-[#6ea1a7] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {comment.user?.profileImageUrl ? (
                          <img 
                            src={comment.user.profileImageUrl} 
                            alt={comment.user?.fullName || 'Profile'} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
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
                          <div className="bg-gray-100 rounded-2xl px-2.5 py-1 inline-block max-w-fit">
                            <div className="flex items-center space-x-1.5">
                              <Link href={`/profile/${comment.userId}`}>
                                <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                  {comment.user?.fullName || 'Irmão(ã) em Cristo'}
                                </div>
                              </Link>
                              {comment.updatedAt && new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                                <span className="text-xs text-gray-400">Editado</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-800 leading-snug">{comment.content}</p>
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
                            <CommentLikeButton 
                              commentId={comment.id}
                              onLike={() => commentLikeMutation.mutate(comment.id)}
                              disabled={commentLikeMutation.isPending}
                            />
                            <button 
                              className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                              onClick={() => setShowReplyFor(showReplyFor === comment.id ? null : comment.id)}
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
                                  className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-1"
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  disabled={deleteCommentMutation.isPending}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{deleteCommentMutation.isPending ? 'Excluindo...' : 'Excluir'}</span>
                                </button>
                              </>
                            )}
                          </div>
                          
                          <CommentLikeCount commentId={comment.id} />
                        </div>

                        {/* Reply Input */}
                        {showReplyFor === comment.id && (
                          <div className="mt-3 ml-11 flex space-x-2">
                            <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {user?.profileImageUrl ? (
                                <img 
                                  src={user.profileImageUrl} 
                                  alt={user.fullName || 'Profile'} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <User className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 flex space-x-2">
                              <Textarea
                                placeholder={`@${comment.user?.fullName || 'Irmão(ã) em Cristo'} `}
                                value={replyTexts[comment.id] || `@${comment.user?.fullName || 'Irmão(ã) em Cristo'} `}
                                onChange={(e) => setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })}
                                className="flex-1 min-h-[2rem] max-h-20 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReply(comment.id);
                                  }
                                }}
                                onFocus={(e) => {
                                  const mention = `@${comment.user?.fullName || 'Irmão(ã) em Cristo'} `;
                                  if (!replyTexts[comment.id] || replyTexts[comment.id] === mention) {
                                    e.target.setSelectionRange(mention.length, mention.length);
                                  }
                                }}
                              />
                              <Button
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyTexts[comment.id]?.trim() || replyMutation.isPending}
                                size="sm"
                                className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-3"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Display Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-11">
                            <div className={`space-y-3 ${comment.replies.length > 3 ? 'max-h-80 overflow-y-auto pr-2 border-l border-gray-200 pl-3' : ''}`}>
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="flex space-x-2">
                                <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {reply.user?.profileImageUrl ? (
                                    <img 
                                      src={reply.user.profileImageUrl} 
                                      alt={reply.user?.fullName || 'Profile'} 
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <User className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  {editingCommentId === reply.id ? (
                                    <div className="w-full space-y-2">
                                      <Textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full min-h-[3rem] max-h-32 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82]"
                                        placeholder="Edite sua resposta..."
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
                                    <div className="bg-gray-50 rounded-2xl px-2.5 py-1 inline-block max-w-fit">
                                      <div className="flex items-center space-x-1.5">
                                        <Link href={`/profile/${reply.userId}`}>
                                          <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                            {reply.user?.fullName || 'Irmão(ã) em Cristo'}
                                          </div>
                                        </Link>
                                        {reply.updatedAt && new Date(reply.updatedAt).getTime() !== new Date(reply.createdAt).getTime() && (
                                          <span className="text-xs text-gray-400">Editado</span>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-800 leading-snug">{reply.content}</p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center space-x-4 ml-1">
                                      <div className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(reply.createdAt), { 
                                          addSuffix: true, 
                                          locale: ptBR 
                                        })}
                                      </div>
                                      <CommentLikeButton 
                                        commentId={reply.id}
                                        onLike={() => replyLikeMutation.mutate(reply.id)}
                                        disabled={replyLikeMutation.isPending}
                                      />
                                      <button 
                                        className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                                        onClick={() => setShowNestedReplyFor(showNestedReplyFor === reply.id ? null : reply.id)}
                                      >
                                        Responder
                                      </button>
                                      {reply.userId === user?.id && (
                                        <>
                                          <button 
                                            className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                                            onClick={() => handleEditComment(reply)}
                                            disabled={editingCommentId === reply.id}
                                          >
                                            Editar
                                          </button>
                                          <button 
                                            className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-1"
                                            onClick={() => deleteCommentMutation.mutate(reply.id)}
                                            disabled={deleteCommentMutation.isPending}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span>{deleteCommentMutation.isPending ? 'Excluindo...' : 'Excluir'}</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                    <CommentLikeCount commentId={reply.id} />
                                  </div>

                                  {/* Nested Reply Form - appears directly below the buttons */}
                                  {showNestedReplyFor === reply.id && (
                                    <div className="mt-2 ml-1 flex space-x-2">
                                      <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {user?.profileImageUrl ? (
                                          <img 
                                            src={user.profileImageUrl} 
                                            alt={user.fullName || 'Profile'} 
                                            className="w-full h-full object-cover rounded-full"
                                          />
                                        ) : (
                                          <User className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                      <div className="flex-1 flex space-x-2">
                                        <Textarea
                                          placeholder={`@${reply.user?.fullName || 'Irmão(ã) em Cristo'} `}
                                          value={nestedReplyTexts[reply.id] || `@${reply.user?.fullName || 'Irmão(ã) em Cristo'} `}
                                          onChange={(e) => setNestedReplyTexts({ ...nestedReplyTexts, [reply.id]: e.target.value })}
                                          className="flex-1 min-h-[2rem] max-h-20 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                              e.preventDefault();
                                              handleNestedReply(reply.id, comment.id);
                                            }
                                          }}
                                          onFocus={(e) => {
                                            const mention = `@${reply.user?.fullName || 'Irmão(ã) em Cristo'} `;
                                            if (!nestedReplyTexts[reply.id] || nestedReplyTexts[reply.id] === mention) {
                                              e.target.setSelectionRange(mention.length, mention.length);
                                            }
                                          }}
                                        />
                                        <Button
                                          onClick={() => handleNestedReply(reply.id, comment.id)}
                                          disabled={!nestedReplyTexts[reply.id]?.trim() || replyMutation.isPending}
                                          size="sm"
                                          className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-2 py-1 h-8"
                                        >
                                          <Send className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                
                                {/* Renderizar respostas aninhadas (replies dos replies) */}
                                {reply.replies && reply.replies.length > 0 && (
                                  <div className="ml-8 mt-2 space-y-2">
                                    {reply.replies.map((nestedReply: any) => (
                                      <div key={nestedReply.id} className="flex space-x-2">
                                        <div className="w-5 h-5 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                          {nestedReply.user?.profileImageUrl ? (
                                            <img 
                                              src={nestedReply.user.profileImageUrl} 
                                              alt={nestedReply.user?.fullName || 'Profile'} 
                                              className="w-full h-full object-cover rounded-full"
                                            />
                                          ) : (
                                            <User className="w-2.5 h-2.5 text-white" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          {editingCommentId === nestedReply.id ? (
                                            <div className="w-full space-y-2">
                                              <Textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="w-full min-h-[2.5rem] max-h-32 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82]"
                                                placeholder="Edite sua resposta..."
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
                                            <div className="bg-gray-50 rounded-2xl px-2.5 py-1 inline-block max-w-fit">
                                              <div className="flex items-center space-x-1.5">
                                                <Link href={`/profile/${nestedReply.userId}`}>
                                                  <div className="font-medium text-xs text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                                    {nestedReply.user?.fullName || 'Irmão(ã) em Cristo'}
                                                  </div>
                                                </Link>
                                                {nestedReply.updatedAt && new Date(nestedReply.updatedAt).getTime() !== new Date(nestedReply.createdAt).getTime() && (
                                                  <span className="text-xs text-gray-400">Editado</span>
                                                )}
                                              </div>
                                              <div>
                                                <p className="text-xs text-gray-800 leading-snug">{nestedReply.content}</p>
                                              </div>
                                            </div>
                                          )}

                                          <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                                              <div>
                                                {formatDistanceToNow(new Date(nestedReply.createdAt), { 
                                                  addSuffix: true, 
                                                  locale: ptBR 
                                                })}
                                              </div>
                                              <CommentLikeButton 
                                                commentId={nestedReply.id}
                                                onLike={() => replyLikeMutation.mutate(nestedReply.id)}
                                                disabled={replyLikeMutation.isPending}
                                              />
                                              <button 
                                                className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                                                onClick={() => setShowNestedReplyFor(showNestedReplyFor === nestedReply.id ? null : nestedReply.id)}
                                              >
                                                Responder
                                              </button>
                                              {nestedReply.userId === user?.id && (
                                                <>
                                                  <button 
                                                    className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                                                    onClick={() => handleEditComment(nestedReply)}
                                                    disabled={editingCommentId === nestedReply.id}
                                                  >
                                                    Editar
                                                  </button>
                                                  <button 
                                                    className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-1"
                                                    onClick={() => deleteCommentMutation.mutate(nestedReply.id)}
                                                    disabled={deleteCommentMutation.isPending}
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span>{deleteCommentMutation.isPending ? 'Excluindo...' : 'Excluir'}</span>
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                            
                                            <CommentLikeCount commentId={nestedReply.id} />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            </div>
                          </div>
                        )}
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