import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";

interface PostInteractionsProps {
  post: any;
}

export function PostInteractions({ post }: PostInteractionsProps) {
  const { toast } = useToast();

  // Fetch post stats
  const { data: postStats = { likesCount: 0, commentsCount: 0, sharesCount: 0, userLiked: false }, refetch: refetchStats } = useQuery({
    queryKey: ['/api/posts', post.id, 'stats'],
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

  return (
    <>
      {/* Post Stats */}
      <div className="flex items-center justify-between py-3 px-1 text-sm text-gray-600">
        {/* Left side - Heart emoji + Amém count */}
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-500 fill-current" />
          <span className="font-medium">{postStats.likesCount}</span>
        </div>
        
        {/* Right side - Comments and shares count */}
        <div className="flex items-center space-x-4">
          <span>{postStats.commentsCount} comentários</span>
          <span>{postStats.sharesCount} compartilhamentos</span>
        </div>
      </div>
      
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
          onClick={() => {
            // This will be handled by the MediaExpansionModal
            toast({
              title: "Comentários",
              description: "Clique na imagem/vídeo para ver os comentários",
            });
          }}
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
    </>
  );
}