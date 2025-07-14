import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarField } from "@/components/star-field";
import { GlassCard } from "@/components/glass-card";
import { UserProfileCard } from "@/components/user-profile-card";
import { PostCard } from "@/components/post-card";
import { HoroscopeCard } from "@/components/horoscope-card";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Search, 
  Bell, 
  MessageCircle, 
  User,
  Users,
  Newspaper,
  Utensils,
  Film,
  Music,
  TrendingUp,
  UserPlus,
  Image,
  Video,
  BarChart3
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts'],
  });

  // Fetch communities
  const { data: communities = [] } = useQuery({
    queryKey: ['/api/communities'],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; postType?: string; community?: string }) => {
      await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      setPostContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Sucesso!",
        description: "Seu post foi publicado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao publicar o post. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (postContent.trim()) {
      createPostMutation.mutate({ content: postContent, postType: "text" });
    }
  };

  const defaultCommunities = [
    { name: "Notícias", slug: "news", icon: <Newspaper className="text-[hsl(45,93%,63%)]" size={20} /> },
    { name: "Culinária", slug: "cuisine", icon: <Utensils className="text-[hsl(45,93%,63%)]" size={20} /> },
    { name: "Cinema", slug: "cinema", icon: <Film className="text-[hsl(45,93%,63%)]" size={20} /> },
    { name: "Entretenimento", slug: "entertainment", icon: <Music className="text-[hsl(45,93%,63%)]" size={20} /> },
    { name: "Astrologia", slug: "astrology", icon: <Star className="text-[hsl(45,93%,63%)]" size={20} /> },
  ];

  const trendingTopics = [
    { hashtag: "#MercúrioRetrógrado", posts: "2.1K" },
    { hashtag: "#LuaCheia", posts: "1.5K" },
    { hashtag: "#ReceitasAstrológicas", posts: "892" },
    { hashtag: "#CompatibilidadeSignos", posts: "654" },
  ];

  const suggestions = [
    { name: "Luna Mística", sign: "♒ Aquário" },
    { name: "Marcos Celestial", sign: "♊ Gêmeos" },
  ];

  return (
    <div className="min-h-screen mystical-gradient relative">
      <StarField />
      
      {/* Top Navigation */}
      <nav className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Star className="text-2xl text-[hsl(45,93%,63%)] mr-2" size={32} />
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Crimson Text, serif' }}>
                ASTRUS
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(220,13%,91%)]" size={20} />
                <Input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 glass-effect border-white/30 rounded-full text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)]"
                  placeholder="Buscar pessoas, comunidades..."
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2 text-[hsl(220,13%,91%)] hover:text-white transition-colors">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-[hsl(220,13%,91%)] hover:text-white transition-colors">
                <MessageCircle size={20} />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[hsl(258,84%,60%)] to-[hsl(214,84%,56%)] flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/api/logout'}
                className="text-[hsl(220,13%,91%)] hover:text-white"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <UserProfileCard user={user} />

            {/* Communities */}
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4">
                <Users className="inline mr-2" size={20} />
                Comunidades
              </h3>
              <div className="space-y-3">
                {defaultCommunities.map((community) => (
                  <div key={community.slug} className="flex items-center text-[hsl(220,13%,91%)] hover:text-white transition-colors cursor-pointer">
                    {community.icon}
                    <span className="ml-3">{community.name}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <GlassCard className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[hsl(258,84%,60%)] to-[hsl(214,84%,56%)] flex items-center justify-center mr-3">
                  <User className="text-white" size={20} />
                </div>
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="flex-1 glass-effect border-white/30 rounded-full px-4 py-2 text-white placeholder-white/60 focus:ring-2 focus:ring-[hsl(258,84%,60%)] min-h-[40px] resize-none"
                  placeholder="Compartilhe suas estrelas..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm" className="text-[hsl(220,13%,91%)] hover:text-[hsl(45,93%,63%)] transition-colors">
                    <Image className="mr-2" size={16} />
                    Foto
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[hsl(220,13%,91%)] hover:text-[hsl(45,93%,63%)] transition-colors">
                    <Video className="mr-2" size={16} />
                    Vídeo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[hsl(220,13%,91%)] hover:text-[hsl(45,93%,63%)] transition-colors">
                    <BarChart3 className="mr-2" size={16} />
                    Horóscopo
                  </Button>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!postContent.trim() || createPostMutation.isPending}
                  className="bg-[hsl(258,84%,60%)] hover:bg-[hsl(258,64%,32%)] text-white px-6 py-2 rounded-full transition-colors"
                >
                  {createPostMutation.isPending ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </GlassCard>

            {/* Feed Posts */}
            {postsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <GlassCard key={i} className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-white/20 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-white/20 rounded w-2/3"></div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Star className="text-[hsl(45,93%,63%)] mx-auto mb-4" size={48} />
                <h3 className="text-white text-lg font-semibold mb-2">Nenhum post ainda</h3>
                <p className="text-[hsl(220,13%,91%)]">
                  Seja o primeiro a compartilhar algo na sua timeline!
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-6">
                {posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Daily Horoscope */}
            <HoroscopeCard />

            {/* Trending Topics */}
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4">
                <TrendingUp className="inline mr-2" size={20} />
                Tendências
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div key={topic.hashtag} className="cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors">
                    <div className="text-[hsl(220,13%,91%)] text-sm">{topic.hashtag}</div>
                    <div className="text-white font-medium">{topic.posts} posts</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Suggestions */}
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4">
                <UserPlus className="inline mr-2" size={20} />
                Sugestões
              </h3>
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[hsl(258,84%,60%)] to-[hsl(214,84%,56%)] flex items-center justify-center mr-3">
                        <User className="text-white" size={16} />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{suggestion.name}</div>
                        <div className="text-[hsl(220,13%,91%)] text-xs">{suggestion.sign}</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[hsl(258,84%,60%)] hover:text-[hsl(258,64%,32%)] text-sm font-medium"
                    >
                      Seguir
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
