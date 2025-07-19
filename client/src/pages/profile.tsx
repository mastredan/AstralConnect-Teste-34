import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  User,
  ArrowLeft,
  MapPin,
  Calendar,
  Church,
  Users,
  Heart,
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  // For now, we'll show a basic profile page since we don't have user profile data in the backend
  // In a full implementation, you'd fetch user data by userId
  const { data: posts = [] } = useQuery({
    queryKey: ['/api/posts'],
  });

  // Filter posts by the user if we have userId
  const userPosts = userId ? posts.filter((post: any) => post.userId === userId) : [];

  return (
    <div className="min-h-screen bg-[#e7f5f6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-[#257b82]">Perfil do Usuário</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <Card className="orlev-card">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-[#257b82] to-[#7fc7ce] rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#257b82] mb-2">
                  Irmão(ã) em Cristo
                </h2>
                <div className="space-y-2 text-[#6ea1a7]">
                  <div className="flex items-center">
                    <Church className="w-4 h-4 mr-2" />
                    <span>Membro da comunidade OrLev</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Membro desde Janeiro 2025</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#257b82]">{userPosts.length}</div>
                    <div className="text-sm text-[#6ea1a7]">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#257b82]">0</div>
                    <div className="text-sm text-[#6ea1a7]">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#257b82]">0</div>
                    <div className="text-sm text-[#6ea1a7]">Seguindo</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Posts */}
        <Card className="orlev-card">
          <CardHeader>
            <CardTitle className="text-[#257b82]">Posts Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {userPosts.length === 0 ? (
              <div className="text-center py-8 text-[#6ea1a7]">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Este usuário ainda não fez nenhuma postagem.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post: any) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    {post.content && (
                      <p className="text-gray-800 mb-3">{post.content}</p>
                    )}
                    
                    {/* Post Images */}
                    {post.imageUrls && post.imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {post.imageUrls.slice(0, 4).map((url: string, index: number) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Post Stats */}
                    <div className="flex items-center space-x-4 text-sm text-[#6ea1a7]">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}