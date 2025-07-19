import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, User, Send, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

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
  const { toast } = useToast();

  // Fetch post stats
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0 } } = useQuery({
    queryKey: [`/api/posts/${post.id}/stats`],
  });

  // Fetch comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
  });

  // Debug log
  console.log("Comments loaded:", comments.length, "First comment replies:", comments[0]?.replies?.length || 0);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
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
    mutationFn: async (commentId: string) => {
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

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleReply = (parentCommentId: number) => {
    const replyContent = replyTexts[parentCommentId]?.trim();
    if (!replyContent) return;
    replyMutation.mutate({ content: replyContent, parentCommentId });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <DialogTitle className="text-center text-lg font-semibold text-gray-800">
            Post de {post.userName || "Irmão(ã) em Cristo"}
          </DialogTitle>
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
                          <div className="flex items-center space-x-2">
                            <Link href={`/profile/${comment.userId}`}>
                              <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                {comment.user?.fullName || 'Irmão(ã) em Cristo'}
                              </div>
                            </Link>
                            {comment.updatedAt && new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                              <span className="text-xs text-gray-400">Editado</span>
                            )}
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
                            className="text-xs font-medium text-gray-600 hover:text-[#257b82] transition-colors"
                            onClick={() => setShowReplyFor(showReplyFor === comment.id ? null : comment.id)}
                          >
                            Responder
                          </button>
                        </div>

                        {/* Reply Input */}
                        {showReplyFor === comment.id && (
                          <div className="mt-3 ml-4">
                            <div className="flex space-x-2">
                              <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-3 h-3 text-white" />
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

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-4">
                            <div className={`space-y-3 ${comment.replies.length > 3 ? 'max-h-80 overflow-y-auto pr-2 border-l border-gray-200 pl-3' : ''}`}>
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="flex space-x-2">
                                <div className="w-6 h-6 bg-[#89bcc4] rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                                    <div className="flex items-center space-x-2">
                                      <Link href={`/profile/${reply.userId}`}>
                                        <div className="font-medium text-sm text-[#257b82] hover:text-[#1a5a61] cursor-pointer transition-colors">
                                          {reply.user?.fullName || 'Irmão(ã) em Cristo'}
                                        </div>
                                      </Link>
                                      {reply.updatedAt && new Date(reply.updatedAt).getTime() !== new Date(reply.createdAt).getTime() && (
                                        <span className="text-xs text-gray-400">Editado</span>
                                      )}
                                    </div>
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
                                  </div>
                                </div>
                              </div>
                            ))}
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