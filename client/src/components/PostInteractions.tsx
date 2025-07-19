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

  // Fetch post stats
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0, userLiked: false }, refetch: refetchStats } = useQuery({
    queryKey: ['/api/posts', post.id, 'stats'],
  });

  // Fetch comments
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['/api/posts', post.id, 'comments'],
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

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ content: commentText });
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
                  <div key={comment.id} className="flex space-x-3">
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
                      <div className="text-xs text-gray-500 mt-1 ml-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
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