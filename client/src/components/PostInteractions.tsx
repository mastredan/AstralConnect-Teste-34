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
      <div className="flex items-center justify-between py-2 text-sm text-[#6ea1a7]">
        <div className="flex items-center space-x-4">
          <span>{postStats.likesCount} Amém</span>
          <span>{postStats.commentsCount} comentários</span>
          <span>{postStats.sharesCount} compartilhamentos</span>
        </div>
      </div>
      
      <div className="border-t border-[#6ea1a7]/20 pt-3">
        <div className="grid grid-cols-4 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex items-center justify-center transition-colors py-2 ${
              postStats.userLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-[#6ea1a7] hover:text-red-500'
            }`}
          >
            <Heart className={`mr-1 ${postStats.userLiked ? 'fill-current' : ''}`} size={16} />
            <span className="text-xs">Amém</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-center text-[#6ea1a7] hover:text-[#257b82] transition-colors py-2"
            onClick={() => {
              // This will be handled by the MediaExpansionModal
              toast({
                title: "Comentários",
                description: "Clique na imagem/vídeo para ver os comentários",
              });
            }}
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
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-center text-[#6ea1a7] hover:text-yellow-600 transition-colors py-2"
            onClick={() => {
              toast({
                title: "Salvo!",
                description: "Postagem salva nos seus favoritos",
              });
            }}
          >
            <Bookmark className="mr-1" size={16} />
            <span className="text-xs">Salvar</span>
          </Button>
        </div>
      </div>
    </>
  );
}