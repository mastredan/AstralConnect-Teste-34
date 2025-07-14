import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Share, Bookmark, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./glass-card";

interface PostCardProps {
  post: any;
}

export function PostCard({ post }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { 
    addSuffix: true,
    locale: ptBR 
  });

  return (
    <GlassCard className="p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[hsl(258,84%,60%)] to-[hsl(214,84%,56%)] flex items-center justify-center mr-3">
          <User className="text-white" size={20} />
        </div>
        <div>
          <h4 className="text-white font-semibold">Usuário Astral</h4>
          <p className="text-[hsl(220,13%,91%)] text-sm">{timeAgo}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-white mb-3">{post.content}</p>
        
        {post.postType === "horoscope" && (
          <div className="bg-gradient-to-r from-[hsl(258,64%,32%)] to-[hsl(258,84%,60%)] rounded-xl p-4 text-center">
            <div className="text-4xl text-[hsl(45,93%,63%)] mb-2">⭐</div>
            <p className="text-white font-semibold">Horóscopo do Dia</p>
            <p className="text-[hsl(220,13%,91%)] text-sm">Energia cósmica especial</p>
          </div>
        )}

        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex space-x-6">
          <Button variant="ghost" size="sm" className="flex items-center text-[hsl(220,13%,91%)] hover:text-[hsl(45,93%,63%)] transition-colors">
            <Heart className="mr-2" size={16} />
            <span>{post.likes || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center text-[hsl(220,13%,91%)] hover:text-[hsl(45,93%,63%)] transition-colors">
            <MessageCircle className="mr-2" size={16} />
            <span>{post.comments || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center text-[hsl(220,13%,91%)] hover:text-[hsl(45,93%,63%)] transition-colors">
            <Share className="mr-2" size={16} />
            <span>{post.shares || 0}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-[hsl(220,13%,91%)] hover:text-[hsl(45,93%,63%)] transition-colors">
          <Bookmark size={16} />
        </Button>
      </div>
    </GlassCard>
  );
}
