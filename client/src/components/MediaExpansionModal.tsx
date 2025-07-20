import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { 
  Download, 
  Heart, 
  MessageCircle, 
  Share, 
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Trash2
} from "lucide-react";
import CommentsModal from "@/components/CommentsModal";

// Component for comment like button with stats in modal
function CommentLikeButton({ commentId, onLike, disabled }: { commentId: number; onLike: () => void; disabled: boolean }) {
  const { data: stats = { likesCount: 0, userLiked: false } } = useQuery({
    queryKey: ['/api/comments', commentId, 'stats'],
    enabled: !!commentId,
  });

  return (
    <button 
      className={`text-xs font-medium flex items-center space-x-1 transition-colors ${
        stats.userLiked 
          ? "text-red-500" 
          : "text-gray-600 hover:text-red-500"
      }`}
      onClick={onLike}
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

interface MediaExpansionModalProps {
  post: any;
  children: React.ReactNode;
  initialImageIndex?: number;
}

export function MediaExpansionModal({ post, children, initialImageIndex = 0 }: MediaExpansionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [showReplyFor, setShowReplyFor] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [optimisticLike, setOptimisticLike] = useState<{ userLiked: boolean; likesCount: number } | null>(null);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [visibleRepliesCount, setVisibleRepliesCount] = useState<{ [key: number]: number }>({});
  const [showNestedReplyFor, setShowNestedReplyFor] = useState<number | null>(null);
  const [nestedReplyTexts, setNestedReplyTexts] = useState<{ [key: number]: string }>({});
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const nestedReplyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch post interactions
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0, userLiked: false }, refetch: refetchStats } = useQuery({
    queryKey: ['/api/posts', post.id, 'stats'],
  });

  // Reset image index when initialImageIndex changes
  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
  }, [initialImageIndex]);

  // Sync optimistic state with real data when server data updates
  useEffect(() => {
    if (optimisticLike && postStats && !isLikeProcessing) {
      // Only clear optimistic state if the server data matches our optimistic state
      const serverLiked = postStats.userLiked;
      const serverCount = parseInt(postStats.likesCount || "0");
      
      if (optimisticLike.userLiked === serverLiked && optimisticLike.likesCount === serverCount) {
        setOptimisticLike(null);
      }
    }
  }, [postStats, optimisticLike, isLikeProcessing]);

  // Auto-focus on reply textarea when it appears
  useEffect(() => {
    if (showReplyFor !== null && replyTextareaRef.current) {
      // Small delay to ensure the textarea is rendered
      setTimeout(() => {
        replyTextareaRef.current?.focus();
      }, 50);
    }
  }, [showReplyFor]);

  // Auto-focus effect for nested reply textarea
  useEffect(() => {
    if (showNestedReplyFor && nestedReplyTextareaRef.current) {
      nestedReplyTextareaRef.current.focus();
    }
  }, [showNestedReplyFor]);

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['/api/posts', post.id, 'comments'],
    enabled: showComments,
  });

  // Like mutation with instant optimistic update  
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/posts/${post.id}/like`, "POST");
    },
    onSuccess: () => {
      // Clear processing state
      setIsLikeProcessing(false);
      // Delay the refetch slightly to avoid conflicts with optimistic updates
      setTimeout(() => {
        refetchStats();
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      }, 100);
    },
    onError: () => {
      // Only clear optimistic state on error to revert the UI
      setIsLikeProcessing(false);
      setOptimisticLike(null);
    }
  });

  // Handle like click with instant UI update
  const handleLike = () => {
    // Prevent multiple rapid clicks during processing
    if (isLikeProcessing) return;
    
    const currentLiked = optimisticLike?.userLiked ?? postStats.userLiked;
    const currentCount = optimisticLike?.likesCount ?? parseInt(postStats.likesCount || "0");
    
    const newState = {
      userLiked: !currentLiked,
      likesCount: !currentLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
    };
    
    // Update UI instantly
    setOptimisticLike(newState);
    setIsLikeProcessing(true);
    
    // API call in background
    likeMutation.mutate();
  };

  // Get current like state
  const currentLikeState = {
    userLiked: optimisticLike?.userLiked ?? postStats.userLiked,
    likesCount: optimisticLike?.likesCount ?? parseInt(postStats.likesCount || "0")
  };

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
    }
  });

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'media';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      });
    }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ content: commentText.trim() });
  };

  const handleReply = (parentCommentId: number) => {
    const replyText = replyTexts[parentCommentId];
    if (replyText?.trim()) {
      commentMutation.mutate({ content: replyText, parentCommentId });
    }
  };

  const handleReplyToSubComment = (mainCommentId: number, subCommentId: number) => {
    const replyText = replyTexts[subCommentId];
    if (replyText?.trim()) {
      // Use subCommentId as parent to create real hierarchy (comment under sub-comment)
      commentMutation.mutate({ content: replyText, parentCommentId: subCommentId });
      // Clear reply text and hide reply box
      setReplyTexts({ ...replyTexts, [subCommentId]: "" });
      setShowReplyFor(null);
    }
  };

  const handleNestedReply = (replyToCommentId: number, targetParentId: number) => {
    const replyText = nestedReplyTexts[replyToCommentId];
    if (replyText?.trim()) {
      // Always use the provided targetParentId to control hierarchy level
      commentMutation.mutate({ content: replyText, parentCommentId: targetParentId });
      // Clear reply text and hide reply box
      setNestedReplyTexts({ ...nestedReplyTexts, [replyToCommentId]: "" });
      setShowNestedReplyFor(null);
    }
  };

  const handleReplyToMainComment = (commentId: number) => {
    const replyText = replyTexts[commentId];
    if (replyText?.trim()) {
      commentMutation.mutate({ content: replyText, parentCommentId: commentId });
      // Clear reply text and hide reply box
      setReplyTexts({ ...replyTexts, [commentId]: "" });
      setShowReplyFor(null);
    }
  };

  // Comment like mutation
  const commentLikeMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest(`/api/comments/${commentId}/like`, "POST");
    },
    onSuccess: (_, commentId) => {
      // Invalidate comment stats specifically and comments list
      queryClient.invalidateQueries({ queryKey: ['/api/comments', commentId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id, 'comments'] });
      refetchComments();
    },
    onError: () => {
      // Silent error - could add subtle error handling if needed
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

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      await apiRequest(`/api/comments/${commentId}`, "PUT", { content });
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditingText("");
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível editar o comentário",
        variant: "destructive",
      });
    }
  });

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editingText.trim() || !editingCommentId) return;
    editCommentMutation.mutate({ commentId: editingCommentId, content: editingText.trim() });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  // Render nested replies with 3-level hierarchy (main comment -> sub-comment -> all remaining flattened)
  const renderNestedReplies = (replies: any[], level: number = 1, parentCommentId?: number) => {
    if (!replies || replies.length === 0) return null;

    // Dynamic indentation and sizing based on level (max 3 levels)
    const indentClass = level === 1 ? 'ml-11' : 'ml-8'; // Level 2 and 3 use same indentation
    const avatarClass = level === 1 ? 'w-5 h-5' : 'w-4 h-4'; // Level 2 and 3 use same avatar size
    const iconClass = level === 1 ? 'w-2.5 h-2.5' : 'w-2 h-2'; // Level 2 and 3 use same icon size
    const textClass = level === 1 ? 'text-sm' : 'text-xs'; // Level 2 and 3 use same text size

    return (
      <div className={`mt-3 ${indentClass}`}>
        <div className="space-y-3">
          {replies.map((nestedReply: any) => (
            <div key={nestedReply.id} className="flex space-x-2">
              <div className={`${avatarClass} bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                {nestedReply.user?.profileImageUrl ? (
                  <img 
                    src={nestedReply.user.profileImageUrl} 
                    alt={nestedReply.user?.fullName || 'Profile'} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className={`${iconClass} text-white`} />
                )}
              </div>
              <div className="flex-1">
                {editingCommentId === nestedReply.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full min-h-[2.5rem] resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
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
                        <div className={`font-medium ${textClass} text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors`}>
                          {nestedReply.user?.fullName || 'Irmão(ã) em Cristo'}
                        </div>
                      </Link>
                      {nestedReply.updatedAt && new Date(nestedReply.updatedAt).getTime() !== new Date(nestedReply.createdAt).getTime() && (
                        <span className="text-xs text-gray-400">Editado</span>
                      )}
                    </div>
                    <div>
                      <p className={`${textClass} text-gray-800 leading-snug`}>{nestedReply.content}</p>
                    </div>
                  </div>
                )}

                {editingCommentId !== nestedReply.id && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4 ml-1">
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(nestedReply.createdAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                      <CommentLikeButton 
                        commentId={nestedReply.id}
                        onLike={() => commentLikeMutation.mutate(nestedReply.id)}
                        disabled={commentLikeMutation.isPending}
                      />
                      {/* Show "Responder" button for all levels - Level 3 replies use level 2 as parent */}
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
                          >
                            Editar
                          </button>
                          <button 
                            className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-1"
                            onClick={() => deleteCommentMutation.mutate(nestedReply.id)}
                            disabled={deleteCommentMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </button>
                        </>
                      )}
                    </div>
                    <CommentLikeCount commentId={nestedReply.id} />
                  </div>
                )}

                {/* Reply Input - all levels, but level 3 replies use level 2 as parent */}
                {showNestedReplyFor === nestedReply.id && (
                  <div className="mt-2 ml-1 flex space-x-2">
                    <div className={`${avatarClass} bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={user.fullName || 'Profile'} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className={`${iconClass} text-white`} />
                      )}
                    </div>
                    <div className="flex-1 flex space-x-2">
                      <Textarea
                        ref={showNestedReplyFor === nestedReply.id ? nestedReplyTextareaRef : null}
                        placeholder="Escreva uma resposta..."
                        value={nestedReplyTexts[nestedReply.id] || ""}
                        onChange={(e) => setNestedReplyTexts({ ...nestedReplyTexts, [nestedReply.id]: e.target.value })}
                        className="flex-1 min-h-[2rem] max-h-20 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            // Level 1→2, Level 2→3, Level 3→stays at 3 (final limit)
                            const targetParent = level === 1 ? nestedReply.id : level === 2 ? nestedReply.id : parentCommentId;
                            handleNestedReply(nestedReply.id, targetParent);
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          // Level 1→2, Level 2→3, Level 3→stays at 3 (final limit)
                          const targetParent = level === 1 ? nestedReply.id : level === 2 ? nestedReply.id : parentCommentId;
                          handleNestedReply(nestedReply.id, targetParent);
                        }}
                        disabled={!nestedReplyTexts[nestedReply.id]?.trim() || commentMutation.isPending}
                        size="sm"
                        className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-2 py-1 h-8"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Render nested replies - Stop at level 2 (level 3 is final) */}
                {level < 2 && nestedReply.replies && nestedReply.replies.length > 0 && (
                  renderNestedReplies(nestedReply.replies, level + 1, nestedReply.id)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };



  const media = [...(post.imageUrls || []), ...(post.videoUrl ? [post.videoUrl] : [])];
  const hasMultipleImages = (post.imageUrls?.length || 0) > 1;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-full max-h-full h-screen w-screen p-0 overflow-hidden bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Media Section */}
          <div className="lg:col-span-2 relative bg-black flex items-center justify-center h-screen">
            {post.imageUrls && post.imageUrls.length > 0 && (
              <>
                <img
                  src={post.imageUrls[currentImageIndex]}
                  alt={`Imagem ${currentImageIndex + 1}`}
                  className="object-contain"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100vh',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
                
                {/* Fixed overlay controls */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Navigation for multiple images */}
                  {hasMultipleImages && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 pointer-events-auto"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? post.imageUrls.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft size={20} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 pointer-events-auto"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === post.imageUrls.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight size={20} />
                      </Button>
                      
                      {/* Image counter */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm pointer-events-auto">
                        {currentImageIndex + 1} / {post.imageUrls.length}
                      </div>
                    </>
                  )}

                  {/* Download button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/70 pointer-events-auto"
                    onClick={() => handleDownload(post.imageUrls[currentImageIndex])}
                  >
                    <Download size={20} />
                  </Button>
                </div>
              </>
            )}

            {post.videoUrl && (
              <div className="relative w-full h-full">
                <video
                  src={post.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => handleDownload(post.videoUrl)}
                >
                  <Download size={20} />
                </Button>
              </div>
            )}
          </div>

          {/* Interactions Section */}
          <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto max-h-screen">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3 overflow-hidden">
                  {post.user?.profileImageUrl ? (
                    <img 
                      src={post.user.profileImageUrl} 
                      alt={post.user.fullName || 'Profile'} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="text-white" size={20} />
                  )}
                </div>
                <div>
                  <h4 className="text-[#257b82] font-semibold">{post.user?.fullName || post.userName || "Irmão(ã) em Cristo"}</h4>
                  <p className="text-[#6ea1a7] text-sm">{post.user?.denomination || 'Há poucos minutos'}</p>
                </div>
              </div>
              
              {post.content && (
                <p className="text-[#257b82] leading-relaxed">{post.content}</p>
              )}
              </div>

              {/* Post Actions */}
              {(currentLikeState.likesCount > 0 || postStats.commentsCount > 0 || postStats.sharesCount > 0) && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      {currentLikeState.likesCount > 0 && (
                        <>
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                          <span className="font-medium">{currentLikeState.likesCount}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 ml-auto">
                      {postStats.commentsCount > 0 && (
                        <button 
                          onClick={() => setShowCommentsModal(true)}
                          className="text-[#257b82] hover:text-[#6ea1a7] cursor-pointer hover:underline transition-colors"
                        >
                          {postStats.commentsCount} comentários
                        </button>
                      )}
                      {postStats.sharesCount > 0 && <span>{postStats.sharesCount} compartilhamentos</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center justify-center transition-colors py-2 px-3 rounded hover:bg-gray-50 ${
                      currentLikeState.userLiked 
                        ? 'text-red-500' 
                        : 'text-[#6ea1a7] hover:text-red-500'
                    }`}
                  >
                    <Heart className={`mr-1 ${currentLikeState.userLiked ? 'fill-current' : ''}`} size={16} />
                    <span className="text-xs">Amém</span>
                  </button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center justify-center text-[#6ea1a7] hover:text-[#257b82] transition-colors py-2"
                  >
                    <MessageCircle className="mr-1" size={16} />
                    <span className="text-xs">Comentar</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => shareMutation.mutate()}
                    disabled={shareMutation.isPending}
                    className="flex items-center justify-center text-[#6ea1a7] hover:text-blue-500 transition-colors py-2"
                  >
                    <Share className="mr-1" size={16} />
                    <span className="text-xs">Compartilhar</span>
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments && (
                <div data-comments-section>
                  {/* Add Comment */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-[#257b82] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                  </div>

                  {/* Comments List */}
                  <div className="p-4 space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Seja o primeiro a comentar</p>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="space-y-3">
                        {/* Main Comment */}
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
                            
                            {/* Comment Actions */}
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
                                  className="text-xs font-medium text-gray-600 hover:text-[#257b82]"
                                  onClick={() => setShowReplyFor(showReplyFor === comment.id ? null : comment.id)}
                                >
                                  Responder
                                </button>
                                {comment.userId === user?.id && (
                                  <button 
                                    className="text-xs font-medium text-gray-600 hover:text-red-600 flex items-center space-x-1"
                                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                                    disabled={deleteCommentMutation.isPending}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Excluir</span>
                                  </button>
                                )}
                              </div>
                              <CommentLikeCount commentId={comment.id} />
                            </div>

                          </div>
                        </div>

                        {/* Reply Input for Main Comment */}
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
                                ref={showReplyFor === comment.id ? replyTextareaRef : null}
                                placeholder="Escreva uma resposta..."
                                value={replyTexts[comment.id] || ""}
                                onChange={(e) => setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })}
                                className="flex-1 min-h-[2rem] max-h-20 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReplyToMainComment(comment.id);
                                  }
                                }}
                              />
                              <Button
                                onClick={() => handleReplyToMainComment(comment.id)}
                                disabled={!replyTexts[comment.id]?.trim() || commentMutation.isPending}
                                size="sm"
                                className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-3"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-11">
                            <div className="space-y-3">
                            {comment.replies.slice(0, visibleRepliesCount[comment.id] || 10).map((reply: any) => (
                              <div key={reply.id} className="flex space-x-2">
                                <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {reply.user?.profileImageUrl ? (
                                    <img 
                                      src={reply.user.profileImageUrl} 
                                      alt={reply.user.fullName || 'Profile'} 
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <User className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  {editingCommentId === reply.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full min-h-[3rem] resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
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
                                  
                                  {editingCommentId !== reply.id && (
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
                                          onLike={() => commentLikeMutation.mutate(reply.id)}
                                          disabled={commentLikeMutation.isPending}
                                        />
                                        <button 
                                          className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                                          onClick={() => setShowReplyFor(showReplyFor === reply.id ? null : reply.id)}
                                        >
                                          Responder
                                        </button>
                                        {reply.userId === user?.id && (
                                          <>
                                            <button 
                                              className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                                              onClick={() => handleEditComment(reply)}
                                            >
                                              Editar
                                            </button>
                                            <button 
                                              className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-1"
                                              onClick={() => deleteCommentMutation.mutate(reply.id)}
                                              disabled={deleteCommentMutation.isPending}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                              <span>Excluir</span>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                      <CommentLikeCount commentId={reply.id} />
                                    </div>
                                  )}

                                  {/* Reply Input - appears directly below the buttons */}
                                  {showReplyFor === reply.id && (
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
                                          ref={showReplyFor === reply.id ? replyTextareaRef : null}
                                          placeholder="Escreva uma resposta..."
                                          value={replyTexts[reply.id] || ""}
                                          onChange={(e) => setReplyTexts({ ...replyTexts, [reply.id]: e.target.value })}
                                          className="flex-1 min-h-[2rem] max-h-20 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                              e.preventDefault();
                                              handleReplyToSubComment(comment.id, reply.id);
                                            }
                                          }}
                                        />
                                        <Button
                                          onClick={() => handleReplyToSubComment(comment.id, reply.id)}
                                          disabled={!replyTexts[reply.id]?.trim() || commentMutation.isPending}
                                          size="sm"
                                          className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-2 py-1 h-8"
                                        >
                                          <Send className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                                    {/* Nested replies with unlimited levels */}
                                  {renderNestedReplies(reply.replies, 1, comment.id)}
                                </div>
                              </div>
                            ))}
                            </div>
                            
                            {/* Show more replies button */}
                            {comment.replies.length > (visibleRepliesCount[comment.id] || 10) && (
                              <button
                                onClick={() => setVisibleRepliesCount(prev => ({
                                  ...prev,
                                  [comment.id]: (prev[comment.id] || 10) + 10
                                }))}
                                className="text-[#257b82] text-sm font-medium hover:underline mt-3 ml-2"
                              >
                                Ver mais respostas
                              </button>
                            )}
                          </div>
                        )}


                      </div>
                    ))
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Comments Modal */}
      <CommentsModal 
        post={post} 
        open={showCommentsModal} 
        onOpenChange={setShowCommentsModal}
      >
        <div />
      </CommentsModal>
    </Dialog>
  );
}