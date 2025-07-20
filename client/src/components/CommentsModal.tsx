import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, User, Send, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

// Component for comment like button with stats
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

interface Post {
  id: number;
  content: string;
  imageUrls?: string[];
  videoUrl?: string;
  userName?: string;
  userDenomination?: string;
  userId?: string;
}

interface CommentsModalProps {
  post: Post;
  children: React.ReactNode;
}

export default function CommentsModal({ post, children }: CommentsModalProps) {
  const [commentText, setCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<{ [key: number]: string }>({});
  const [showReplyFor, setShowReplyFor] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingTexts, setEditingTexts] = useState<{ [key: number]: string }>({});
  const [visibleRepliesCount, setVisibleRepliesCount] = useState<{ [key: number]: number }>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on reply textarea when showReplyFor changes
  useEffect(() => {
    if (showReplyFor && replyTextareaRef.current) {
      setTimeout(() => {
        replyTextareaRef.current?.focus();
      }, 100);
    }
  }, [showReplyFor]);

  // Fetch post stats
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0 } } = useQuery({
    queryKey: ['/api/posts', post.id, 'stats'],
  });

  // Fetch comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['/api/posts', post.id, 'comments'],
  });

  // Fetch comment stats for each comment
  const useCommentStats = (commentId: number) => {
    return useQuery({
      queryKey: ['/api/comments', commentId, 'stats'],
      enabled: !!commentId,
    });
  };

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest(`/api/posts/${post.id}/comments`, "POST", { content });
    },
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (data: { content: string; parentCommentId: number }) => {
      await apiRequest(`/api/posts/${post.id}/comments`, "POST", data);
    },
    onSuccess: () => {
      setReplyTexts({});
      setShowReplyFor(null);
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });

  // Like comment mutation
  const commentLikeMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest(`/api/comments/${commentId}/like`, "POST");
    },
    onSuccess: (_, commentId) => {
      // Invalidate comment stats specifically and comments list
      queryClient.invalidateQueries({ queryKey: ['/api/comments', commentId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id, 'comments'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o Amém",
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
    mutationFn: async (data: { commentId: number; content: string }) => {
      await apiRequest(`/api/comments/${data.commentId}`, "PUT", { content: data.content });
    },
    onSuccess: () => {
      setEditingCommentId(null);
      setEditingTexts({});
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

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleReply = (parentCommentId: number) => {
    const replyContent = replyTexts[parentCommentId]?.trim();
    if (!replyContent) return;
    replyMutation.mutate({ content: replyContent, parentCommentId });
  };

  const handleReplyToSubComment = (mainCommentId: number, subCommentId: number) => {
    const replyContent = replyTexts[subCommentId]?.trim();
    if (!replyContent) return;
    // For level 2 replies, parent should remain the main comment to keep all replies at level 2
    replyMutation.mutate({ content: replyContent, parentCommentId: mainCommentId });
  };



  const handleEdit = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingTexts({ ...editingTexts, [commentId]: currentContent });
  };

  const handleSaveEdit = (commentId: number) => {
    const newContent = editingTexts[commentId]?.trim();
    if (!newContent) return;
    editCommentMutation.mutate({ commentId, content: newContent });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingTexts({});
  };

  const handleDelete = (commentId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este comentário?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center overflow-hidden">
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
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-800 text-left">
                {post.user?.fullName || post.userName || "Irmão(ã) em Cristo"}
              </DialogTitle>
              <p className="text-sm text-[#6ea1a7]">
                {post.user?.denomination || 'Denominação não informada'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh]">
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
          {(postStats.likesCount > 0 || postStats.commentsCount > 0 || postStats.sharesCount > 0) && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  {postStats.likesCount > 0 && (
                    <>
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                      <span className="font-medium">{postStats.likesCount}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-4 ml-auto">
                  {postStats.commentsCount > 0 && <span>{postStats.commentsCount} comentários</span>}
                  {postStats.sharesCount > 0 && <span>{postStats.sharesCount} compartilhamentos</span>}
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="p-4 space-y-4">
            {/* Comment Input */}
            <div className="flex space-x-3 pb-4 border-b border-gray-200">
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

            {/* Comments List */}
            <div className="space-y-4">
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
                        {editingCommentId === comment.id ? (
                          <div className="bg-gray-100 rounded-lg px-3 py-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <Link href={`/profile/${comment.userId}`}>
                                <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                  {comment.user?.fullName || 'Irmão(ã) em Cristo'}
                                </div>
                              </Link>
                            </div>
                            <Textarea
                              value={editingTexts[comment.id] || comment.content}
                              onChange={(e) => setEditingTexts({ ...editingTexts, [comment.id]: e.target.value })}
                              className="w-full min-h-[2.5rem] max-h-32 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit(comment.id);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelEdit();
                                }
                              }}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="outline"
                                className="px-2 py-1 h-7 text-xs"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => handleSaveEdit(comment.id)}
                                disabled={!editingTexts[comment.id]?.trim() || editCommentMutation.isPending}
                                size="sm"
                                className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-2 py-1 h-7 text-xs"
                              >
                                Salvar
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
                        
                        {/* Comment Actions */}
                        {editingCommentId !== comment.id && (
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
                              {user?.id === comment.userId && (
                                <>
                                  <button 
                                    className="text-xs font-medium text-gray-600 hover:text-blue-500 transition-colors"
                                    onClick={() => handleEdit(comment.id, comment.content)}
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    className="text-xs font-medium text-gray-600 hover:text-red-500 flex items-center space-x-1 transition-colors"
                                    onClick={() => handleDelete(comment.id)}
                                    disabled={deleteCommentMutation.isPending}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Excluir</span>
                                  </button>
                                </>
                              )}
                            </div>
                            <CommentLikeCount commentId={comment.id} />
                          </div>
                        )}

                        {/* Reply Input */}
                        {showReplyFor === comment.id && (
                          <div className="mt-3 ml-4">
                            <div className="flex space-x-2">
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
                          </div>
                        )}

                        {/* Render sub-comments (replies) */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2 ml-6 border-l-2 border-gray-200 pl-4">
                            <div className="space-y-2">
                            {comment.replies.slice(0, visibleRepliesCount[comment.id] || 10).map((reply: any) => (
                              <div key={reply.id} className="flex space-x-2">
                                <div className="w-5 h-5 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {reply.user?.profileImageUrl ? (
                                    <img 
                                      src={reply.user.profileImageUrl} 
                                      alt={reply.user?.fullName || 'Profile'} 
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <User className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  {editingCommentId === reply.id ? (
                                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Link href={`/profile/${reply.userId}`}>
                                          <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                            {reply.user?.fullName || 'Irmão(ã) em Cristo'}
                                          </div>
                                        </Link>
                                      </div>
                                      <Textarea
                                        value={editingTexts[reply.id] || reply.content}
                                        onChange={(e) => setEditingTexts({ ...editingTexts, [reply.id]: e.target.value })}
                                        className="w-full min-h-[2rem] max-h-32 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-sm"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSaveEdit(reply.id);
                                          } else if (e.key === 'Escape') {
                                            e.preventDefault();
                                            handleCancelEdit();
                                          }
                                        }}
                                      />
                                      <div className="flex justify-end space-x-2 mt-2">
                                        <Button
                                          onClick={handleCancelEdit}
                                          size="sm"
                                          variant="outline"
                                          className="px-2 py-1 h-6 text-xs"
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          onClick={() => handleSaveEdit(reply.id)}
                                          disabled={!editingTexts[reply.id]?.trim() || editCommentMutation.isPending}
                                          size="sm"
                                          className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-2 py-1 h-6 text-xs"
                                        >
                                          Salvar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 inline-block max-w-full">
                                      <div className="flex items-center space-x-1.5 mb-1">
                                        <Link href={`/profile/${reply.userId}`}>
                                          <div className="font-medium text-xs text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                            {reply.user?.fullName || 'Irmão(ã) em Cristo'}
                                          </div>
                                        </Link>
                                        {reply.updatedAt && new Date(reply.updatedAt).getTime() !== new Date(reply.createdAt).getTime() && (
                                          <span className="text-xs text-gray-400">Editado</span>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-800 leading-relaxed">{reply.content}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {editingCommentId !== reply.id && (
                                    <div className="flex items-center justify-between mt-1">
                                      <div className="flex items-center space-x-3 ml-1">
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
                                        {user?.id === reply.userId && (
                                          <>
                                            <button 
                                              className="text-xs font-medium text-gray-600 hover:text-blue-500 transition-colors"
                                              onClick={() => handleEdit(reply.id, reply.content)}
                                            >
                                              Editar
                                            </button>
                                            <button 
                                              className="text-xs font-medium text-gray-600 hover:text-red-500 flex items-center space-x-1 transition-colors"
                                              onClick={() => handleDelete(reply.id)}
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

                                  {/* Reply Input for Sub-Comments (Level 2) - replies stay at level 2 */}
                                  {showReplyFor === reply.id && (
                                    <div className="mt-2 ml-2">
                                      <div className="flex space-x-2">
                                        <div className="w-5 h-5 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                          {user?.profileImageUrl ? (
                                            <img 
                                              src={user.profileImageUrl} 
                                              alt={user.fullName || 'Profile'} 
                                              className="w-full h-full object-cover rounded-full"
                                            />
                                          ) : (
                                            <User className="w-2.5 h-2.5 text-white" />
                                          )}
                                        </div>
                                        <div className="flex-1 flex space-x-2">
                                          <Textarea
                                            ref={showReplyFor === reply.id ? replyTextareaRef : null}
                                            placeholder="Escreva uma resposta..."
                                            value={replyTexts[reply.id] || ""}
                                            onChange={(e) => setReplyTexts({ ...replyTexts, [reply.id]: e.target.value })}
                                            className="flex-1 min-h-[1.5rem] max-h-16 resize-none border-gray-300 focus:border-[#257b82] focus:ring-[#257b82] text-xs"
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
                                            className="bg-[#257b82] hover:bg-[#1a5a61] text-white px-1.5 py-1 h-6"
                                          >
                                            <Send className="w-2.5 h-2.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
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
                                className="text-[#257b82] text-xs font-medium hover:underline mt-2 ml-2"
                              >
                                Ver mais respostas
                              </button>
                            )}
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
