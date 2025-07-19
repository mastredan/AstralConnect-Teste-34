import { useState, useEffect } from "react";
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
  User
} from "lucide-react";

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

  // Reset image index when initialImageIndex changes
  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
  }, [initialImageIndex]);

  // Fetch post interactions
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0, userLiked: false }, refetch: refetchStats } = useQuery({
    queryKey: ['/api/posts', post.id, 'stats'],
  });

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
      setOptimisticLike(null);
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      setOptimisticLike(null);
    }
  });

  // Handle like click with instant UI update
  const handleLike = () => {
    const currentLiked = optimisticLike?.userLiked ?? postStats.userLiked;
    const currentCount = optimisticLike?.likesCount ?? parseInt(postStats.likesCount || "0");
    
    setOptimisticLike({
      userLiked: !currentLiked,
      likesCount: !currentLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
    });
    
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
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado",
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

  // Comment like mutation
  const commentLikeMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest(`/api/comments/${commentId}/like`, "POST");
    },
    onSuccess: () => {
      refetchComments();
      toast({
        title: "Amém!",
        description: "Você disse Amém para este comentário",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível dar Amém no comentário",
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

  const media = [...(post.imageUrls || []), ...(post.videoUrl ? [post.videoUrl] : [])];
  const hasMultipleImages = (post.imageUrls?.length || 0) > 1;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full max-h-[90vh]">
          {/* Media Section */}
          <div className="lg:col-span-2 relative bg-black flex items-center justify-center">
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={post.imageUrls[currentImageIndex]}
                  alt={`Imagem ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Navigation for multiple images */}
                {hasMultipleImages && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? post.imageUrls.length - 1 : prev - 1
                      )}
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === post.imageUrls.length - 1 ? 0 : prev + 1
                      )}
                    >
                      <ChevronRight size={20} />
                    </Button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {post.imageUrls.length}
                    </div>
                  </>
                )}

                {/* Download button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => handleDownload(post.imageUrls[currentImageIndex])}
                >
                  <Download size={20} />
                </Button>
              </div>
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
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Post Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="text-[#257b82] font-semibold">Irmão(ã) em Cristo</h4>
                  <p className="text-[#6ea1a7] text-sm">Há poucos minutos</p>
                </div>
              </div>
              
              {post.content && (
                <p className="text-[#257b82] leading-relaxed">{post.content}</p>
              )}
            </div>

            {/* Post Actions */}
            {(postStats.likesCount > 0 || postStats.commentsCount > 0 || postStats.sharesCount > 0) && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
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

            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`flex items-center justify-center transition-colors py-2 ${
                    currentLikeState.userLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-[#6ea1a7] hover:text-red-500'
                  }`}
                >
                  <Heart className={`mr-1 ${currentLikeState.userLiked ? 'fill-current' : ''}`} size={16} />
                  <span className="text-xs">Amém</span>
                </Button>
                
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
              <>
                {/* Add Comment */}
                <div className="p-4 border-b border-gray-200">
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
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                              <Link href={`/profile/${comment.userId}`}>
                                <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                  {comment.user?.fullName || 'Irmão(ã) em Cristo'}
                                </div>
                              </Link>
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
                              {comment.userId === user?.id && (
                                <button 
                                  className="text-xs font-medium text-gray-600 hover:text-red-600"
                                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                                  disabled={deleteCommentMutation.isPending}
                                >
                                  Excluir
                                </button>
                              )}
                            </div>

                          </div>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-11 space-y-3">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="flex space-x-2">
                                <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                                    <Link href={`/profile/${reply.userId}`}>
                                      <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                        {reply.user?.fullName || 'Irmão(ã) em Cristo'}
                                      </div>
                                    </Link>
                                    <p className="text-sm text-gray-800 mt-1">{reply.content}</p>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 mt-2 ml-1">
                                    <div className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(reply.createdAt), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </div>
                                    <button 
                                      className="text-xs font-medium text-gray-600 hover:text-red-500 flex items-center space-x-1"
                                      onClick={() => commentLikeMutation.mutate(reply.id)}
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
                                    {reply.userId === user?.id && (
                                      <button 
                                        className="text-xs font-medium text-gray-600 hover:text-red-600"
                                        onClick={() => deleteCommentMutation.mutate(reply.id)}
                                        disabled={deleteCommentMutation.isPending}
                                      >
                                        Excluir
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        {showReplyFor === comment.id && (
                          <div className="ml-11 mt-3 flex space-x-2">
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
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}