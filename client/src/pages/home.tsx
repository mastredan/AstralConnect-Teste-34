import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Cross, 
  Search, 
  Bell, 
  MessageCircle, 
  User,
  Users,
  Newspaper,
  Heart,
  BookOpen,
  Music,
  TrendingUp,
  UserPlus,
  Image,
  Video,
  Church,
  Share,
  Bookmark
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts'],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; postType?: string }) => {
      await apiRequest("/api/posts", "POST", data);
    },
    onSuccess: () => {
      setPostContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Graça e Paz!",
        description: "Sua mensagem foi compartilhada com a comunidade.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao publicar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (postContent.trim()) {
      createPostMutation.mutate({ content: postContent, postType: "text" });
    }
  };

  const christianCommunities = [
    { name: "Notícias Cristãs", slug: "christian-news", icon: <Newspaper className="text-[#257b82]" size={20} /> },
    { name: "Estudos Bíblicos", slug: "bible-study", icon: <BookOpen className="text-[#257b82]" size={20} /> },
    { name: "Oração", slug: "prayer", icon: <Heart className="text-[#257b82]" size={20} /> },
    { name: "Música Cristã", slug: "christian-music", icon: <Music className="text-[#257b82]" size={20} /> },
    { name: "Igreja", slug: "church", icon: <Church className="text-[#257b82]" size={20} /> },
  ];

  const trendingTopics = [
    { hashtag: "#FéEmAção", posts: "3.2K" },
    { hashtag: "#EstudoBíblico", posts: "2.8K" },
    { hashtag: "#Oração", posts: "1.9K" },
    { hashtag: "#ComunidadeCristã", posts: "1.4K" },
  ];

  const suggestions = [
    { name: "Maria Santos", denomination: "Católica" },
    { name: "João Silva", denomination: "Batista" },
    { name: "Ana Costa", denomination: "Assembleia de Deus" },
  ];

  return (
    <div className="h-screen w-screen orlev-gradient relative overflow-hidden">
      {/* Top Navigation */}
      <nav className="orlev-card border-b border-[#6ea1a7]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/attached_assets/icon_1752876239664.png" 
                alt="OrLev" 
                className="w-8 h-8 mr-3"
              />
              <span className="text-xl font-bold text-[#257b82] orlev-logo">
                OrLev
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6ea1a7]" size={20} />
                <Input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white/95 border-[#7fc7ce] rounded-full text-[#257b82] placeholder-[#6ea1a7] focus:ring-2 focus:ring-[#257b82]"
                  placeholder="Buscar irmãos, comunidades..."
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-2 text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                <MessageCircle size={20} />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/api/logout'}
                className="text-[#6ea1a7] hover:text-[#257b82]"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mx-auto mb-4">
                    <User className="text-white" size={32} />
                  </div>
                  <h3 className="text-[#257b82] font-semibold mb-1">{user?.fullName || 'Usuário'}</h3>
                  <p className="text-[#6ea1a7] text-sm mb-2">{user?.denomination || 'Denominação não informada'}</p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-[#257b82] font-semibold">0</div>
                      <div className="text-[#6ea1a7]">Seguidores</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#257b82] font-semibold">0</div>
                      <div className="text-[#6ea1a7]">Seguindo</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communities */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <h3 className="text-[#257b82] font-semibold mb-4">
                  <Users className="inline mr-2" size={20} />
                  Comunidades
                </h3>
                <div className="space-y-3">
                  {christianCommunities.map((community) => (
                    <div key={community.slug} className="flex items-center text-[#6ea1a7] hover:text-[#257b82] transition-colors cursor-pointer">
                      {community.icon}
                      <span className="ml-3">{community.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3">
                    <User className="text-white" size={20} />
                  </div>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="flex-1 bg-white/95 border-[#7fc7ce] rounded-lg px-4 py-2 text-[#257b82] placeholder-[#6ea1a7] focus:ring-2 focus:ring-[#257b82] min-h-[40px] resize-none"
                    placeholder="Compartilhe uma palavra de fé..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Button variant="ghost" size="sm" className="text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                      <Image className="mr-2" size={16} />
                      Foto
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                      <Video className="mr-2" size={16} />
                      Vídeo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                      <Heart className="mr-2" size={16} />
                      Oração
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!postContent.trim() || createPostMutation.isPending}
                    className="bg-[#257b82] hover:bg-[#6ea1a7] text-white px-6 py-2 rounded-full transition-colors"
                  >
                    {createPostMutation.isPending ? "Publicando..." : "Publicar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Posts */}
            {postsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="orlev-card">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-[#6ea1a7]/20 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-[#6ea1a7]/20 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-[#6ea1a7]/20 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="orlev-card">
                <CardContent className="p-8 text-center">
                  <Cross className="text-[#257b82] mx-auto mb-4" size={48} />
                  <h3 className="text-[#257b82] text-lg font-semibold mb-2">Nenhuma mensagem ainda</h3>
                  <p className="text-[#6ea1a7]">
                    Seja o primeiro a compartilhar uma palavra de fé na sua timeline!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post: any) => (
                  <Card key={post.id} className="orlev-card">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="text-[#257b82] font-semibold">Irmão(ã) em Cristo</h4>
                          <p className="text-[#6ea1a7] text-sm">Há poucos minutos</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-[#257b82] mb-3">{post.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[#6ea1a7]/20">
                        <div className="flex space-x-6">
                          <Button variant="ghost" size="sm" className="flex items-center text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                            <Heart className="mr-2" size={16} />
                            <span>0</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                            <MessageCircle className="mr-2" size={16} />
                            <span>0</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                            <Share className="mr-2" size={16} />
                            <span>0</span>
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                          <Bookmark size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Daily Verse */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto mb-4"
                  >
                    <BookOpen className="w-12 h-12 text-[#257b82]" />
                  </motion.div>
                  <h3 className="text-[#257b82] font-semibold mb-2">Versículo do Dia</h3>
                  <p className="text-[#6ea1a7] text-sm mb-4 italic">
                    "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."
                  </p>
                  <p className="text-[#257b82] text-xs font-medium">João 3:16</p>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <h3 className="text-[#257b82] font-semibold mb-4">
                  <TrendingUp className="inline mr-2" size={20} />
                  Tendências
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic) => (
                    <div key={topic.hashtag} className="cursor-pointer hover:bg-[#6ea1a7]/10 p-2 rounded-lg transition-colors">
                      <div className="text-[#6ea1a7] text-sm">{topic.hashtag}</div>
                      <div className="text-[#257b82] font-medium">{topic.posts} posts</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <h3 className="text-[#257b82] font-semibold mb-4">
                  <UserPlus className="inline mr-2" size={20} />
                  Conectar-se
                </h3>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3">
                          <User className="text-white" size={16} />
                        </div>
                        <div>
                          <div className="text-[#257b82] font-medium text-sm">{suggestion.name}</div>
                          <div className="text-[#6ea1a7] text-xs">{suggestion.denomination}</div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[#257b82] hover:text-[#6ea1a7] text-sm font-medium"
                      >
                        Seguir
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
