import { useState, useRef } from "react";
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
  Bookmark,
  X,
  Play,
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { ChatPopup } from "@/components/ChatPopup";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaExpansionModal } from "@/components/MediaExpansionModal";
import { PostInteractions } from "@/components/PostInteractions";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  
  // Post editing state
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  
  // Profile picture state
  const [profilePictureDialogOpen, setProfilePictureDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTargetUserId, setChatTargetUserId] = useState<string>("");
  const [chatTargetUserName, setChatTargetUserName] = useState<string>("");
  const [chatTargetUserProfileImage, setChatTargetUserProfileImage] = useState<string>("");

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts'],
  });

  // Upload files mutation
  const uploadFilesMutation = useMutation({
    mutationFn: async (files: { images?: File[], video?: File }) => {
      const formData = new FormData();
      
      if (files.images) {
        files.images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      if (files.video) {
        formData.append('video', files.video);
      }
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return await response.json();
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { content?: string; imageUrls?: string[]; videoUrl?: string; postType?: string }) => {
      await apiRequest("/api/posts", "POST", data);
    },
    onSuccess: () => {
      resetPostForm();
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao publicar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      await apiRequest(`/api/posts/${postId}`, "PUT", { content });
    },
    onSuccess: () => {
      setEditingPostId(null);
      setEditingContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao editar postagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest(`/api/posts/${postId}`, "DELETE");
    },
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Sucesso",
        description: "Postagem excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir postagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return await response.json();
    },
    onSuccess: async (data) => {
      // Force refresh user data and clear cache aggressively
      await queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        title: "Erro no upload",
        description: "Falha ao atualizar a foto de perfil.",
        variant: "destructive",
      });
    },
  });

  const resetPostForm = () => {
    setPostContent("");
    setSelectedImages([]);
    setSelectedVideo(null);
    setImagePreviewUrls([]);
    setVideoPreviewUrl("");
  };

  // Edit post handlers
  const handleEditPost = (post: any) => {
    setEditingPostId(post.id);
    setEditingContent(post.content || "");
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim()) return;
    if (editingPostId) {
      editPostMutation.mutate({ postId: editingPostId, content: editingContent.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingContent("");
  };

  // Delete post handlers
  const handleDeletePost = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  // Profile picture handlers
  const handleProfilePictureUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 8MB)
      if (file.size > 8 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 8MB.",
          variant: "destructive",
        });
        return;
      }
      
      uploadProfilePictureMutation.mutate(file);
    }
  };

  const handleViewProfilePicture = () => {
    if (user?.profileImageUrl) {
      setProfilePictureDialogOpen(true);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast({
        title: "Limite excedido",
        description: "Máximo de 5 fotos por postagem.",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create preview URLs
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImagePreviewUrls(prev => [...prev, url]);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviews);
  };

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideo(null);
    setVideoPreviewUrl("");
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedImages.length === 0 && !selectedVideo) {
      toast({
        title: "Post vazio",
        description: "Adicione texto, fotos ou vídeo para publicar.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrls: string[] = [];
      let videoUrl: string | undefined;

      // Upload files if any are selected
      if (selectedImages.length > 0 || selectedVideo) {
        const uploadResult = await uploadFilesMutation.mutateAsync({
          images: selectedImages.length > 0 ? selectedImages : undefined,
          video: selectedVideo || undefined,
        });

        if (uploadResult.success) {
          imageUrls = uploadResult.imageUrls || [];
          videoUrl = uploadResult.videoUrl;
        }
      }

      // Determine post type
      let postType = "text";
      if (imageUrls.length > 0 && videoUrl) {
        postType = "mixed";
      } else if (imageUrls.length > 0) {
        postType = "image";
      } else if (videoUrl) {
        postType = "video";
      }

      // Create post
      await createPostMutation.mutateAsync({
        content: postContent.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        videoUrl,
        postType,
      });

    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Falha ao fazer upload dos arquivos.",
        variant: "destructive",
      });
    }
  };

  const christianCommunities = [
    { name: "Notícias Cristãs", slug: "christian-news", icon: <Newspaper className="text-[#257b82]" size={20} />, members: "12.3K" },
    { name: "Estudos Bíblicos", slug: "bible-study", icon: <BookOpen className="text-[#257b82]" size={20} />, members: "8.7K" },
    { name: "Pedidos de Oração", slug: "prayer", icon: <Heart className="text-[#257b82]" size={20} />, members: "15.2K" },
    { name: "Música Cristã", slug: "christian-music", icon: <Music className="text-[#257b82]" size={20} />, members: "6.4K" },
    { name: "Vida na Igreja", slug: "church", icon: <Church className="text-[#257b82]" size={20} />, members: "9.8K" },
    { name: "Juventude Cristã", slug: "youth", icon: <Users className="text-[#257b82]" size={20} />, members: "4.2K" },
  ];

  const trendingTopics = [
    { hashtag: "#FéEmAção", posts: "3.2K", growth: "+12%" },
    { hashtag: "#EstudoBíblico", posts: "2.8K", growth: "+8%" },
    { hashtag: "#OraçãoDiária", posts: "1.9K", growth: "+15%" },
    { hashtag: "#ComunidadeCristã", posts: "1.4K", growth: "+5%" },
    { hashtag: "#TestemunhoDeFé", posts: "986", growth: "+22%" },
  ];

  const suggestions = [
    { 
      id: "demo_user_maria",
      name: "Maria Silva", 
      denomination: "Igreja Batista", 
      mutualFriends: 3,
      profileImageUrl: null
    },
    { 
      id: "demo_user_joao",
      name: "João Santos", 
      denomination: "Igreja Católica Apostólica Romana", 
      mutualFriends: 7,
      profileImageUrl: null
    },
    { 
      id: "demo_user_ana",
      name: "Ana Costa", 
      denomination: "Igreja Pentecostal", 
      mutualFriends: 2,
      profileImageUrl: null
    },
  ];

  return (
    <div className="w-full pb-20">
      {/* Top Navigation */}
      <nav className="orlev-card border-b border-[#6ea1a7]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/attached_assets/icon_1752910405519.png" 
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center overflow-hidden">
                {user?.profileImageUrl ? (
                  <img 
                    src={`${user.profileImageUrl}?t=${Date.now()}`} 
                    alt="Profile" 
                    className="w-8 h-8 object-cover rounded-full"
                  />
                ) : (
                  <User className="text-white" size={16} />
                )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden">
                        {user?.profileImageUrl ? (
                          <img 
                            src={`${user.profileImageUrl}?t=${Date.now()}`} 
                            alt="Profile" 
                            className="w-32 h-32 object-cover rounded-full"
                            onError={(e) => {
                              console.error('Erro ao carregar imagem de perfil:', user.profileImageUrl);
                              console.error('Event:', e);
                            }}
                            onLoad={() => {
                              console.log('Imagem de perfil carregada:', user.profileImageUrl);
                            }}
                          />
                        ) : (
                          <User className="text-white" size={52} />
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      {user?.profileImageUrl && (
                        <DropdownMenuItem onClick={handleViewProfilePicture}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleProfilePictureUpload}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <h3 className="text-[#257b82] font-semibold mb-1">{user?.fullName || 'Usuário'}</h3>
                  <p className="text-[#6ea1a7] text-sm mb-3">{user?.denomination || 'Denominação não informada'}</p>
                  
                  {/* Message Box - Test Chat */}
                  <div className="mb-4">
                    <Button 
                      variant="outline" 
                      className="w-full text-[#257b82] border-[#257b82] hover:bg-[#e7f5f6] text-sm py-2 px-4"
                      onClick={() => {
                        // Open chat with current user's own profile
                        setChatTargetUserId(user?.id || "");
                        setChatTargetUserName(user?.fullName || "");
                        setChatTargetUserProfileImage(user?.profileImageUrl || "");
                        setChatOpen(true);
                      }}
                    >
                      Mensagem
                    </Button>
                  </div>
                  
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
                    <div key={community.slug} className="flex items-center justify-between text-[#6ea1a7] hover:text-[#257b82] transition-colors cursor-pointer p-2 rounded-lg hover:bg-[#6ea1a7]/10">
                      <div className="flex items-center">
                        {community.icon}
                        <span className="ml-3">{community.name}</span>
                      </div>
                      <span className="text-xs font-medium">{community.members}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions - Moved from right sidebar */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <h3 className="text-[#257b82] font-semibold mb-4">
                  <UserPlus className="inline mr-2" size={20} />
                  Conectar-se
                </h3>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#6ea1a7]/10 transition-colors">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3 overflow-hidden">
                          <User className="text-white" size={18} />
                        </div>
                        <div>
                          <div className="text-[#257b82] font-medium text-sm">{suggestion.name}</div>
                          <div className="text-[#6ea1a7] text-xs">{suggestion.denomination}</div>
                          <div className="text-[#6ea1a7] text-xs">{suggestion.mutualFriends} amigos em comum</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[#257b82] border-[#257b82] hover:bg-[#257b82] hover:text-white text-xs px-2 py-1"
                          onClick={() => {
                            setChatTargetUserId(suggestion.id);
                            setChatTargetUserName(suggestion.name);
                            setChatTargetUserProfileImage(suggestion.profileImageUrl || "");
                            setChatOpen(true);
                          }}
                        >
                          💬
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[#257b82] border-[#257b82] hover:bg-[#257b82] hover:text-white text-xs px-2 py-1"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stories Section */}
            <Card className="orlev-card">
              <CardContent className="p-4">
                <div className="flex space-x-4 overflow-x-auto">
                  {/* Add Story */}
                  <div className="flex-shrink-0 text-center cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mb-2 border-2 border-white shadow-lg">
                      <span className="text-white text-2xl">+</span>
                    </div>
                    <p className="text-xs text-[#6ea1a7]">Seu Story</p>
                  </div>
                  
                  {/* Mock Stories */}
                  {['Pastor João', 'Irmã Maria', 'Juventude', 'Coral', 'Missões'].map((name, index) => (
                    <div key={name} className="flex-shrink-0 text-center cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-2 border-2 border-white shadow-lg relative">
                        <User className="text-white" size={24} />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <p className="text-xs text-[#6ea1a7] max-w-[64px] truncate">{name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Create Post */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3 overflow-hidden">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.fullName || 'Profile'} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="text-white" size={20} />
                    )}
                  </div>
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="flex-1 bg-white/95 border-[#7fc7ce] rounded-lg px-4 py-2 text-[#257b82] placeholder-[#6ea1a7] focus:ring-2 focus:ring-[#257b82] min-h-[40px] resize-none"
                    placeholder="Compartilhe uma palavra de fé..."
                  />
                </div>

                {/* Media Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#6ea1a7] mt-2">
                      {imagePreviewUrls.length} de 5 fotos selecionadas
                    </p>
                  </div>
                )}

                {videoPreviewUrl && (
                  <div className="mb-4">
                    <div className="relative">
                      <video
                        src={videoPreviewUrl}
                        className="w-full max-h-64 object-cover rounded-lg"
                        controls
                      />
                      <Button
                        onClick={removeVideo}
                        className="absolute top-2 right-2 w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={(input) => { 
                    if (input) (input as any).imageInput = input;
                  }}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  id="imageInput"
                />
                <input
                  type="file"
                  ref={(input) => { 
                    if (input) (input as any).videoInput = input;
                  }}
                  onChange={handleVideoSelect}
                  accept="video/*"
                  style={{ display: 'none' }}
                  id="videoInput"
                />

                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => document.getElementById('imageInput')?.click()}
                      disabled={imagePreviewUrls.length >= 5}
                      className="text-[#6ea1a7] hover:text-[#257b82] transition-colors"
                    >
                      <Image className="mr-2" size={16} />
                      Foto
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => document.getElementById('videoInput')?.click()}
                      disabled={!!selectedVideo}
                      className="text-[#6ea1a7] hover:text-[#257b82] transition-colors"
                    >
                      <Video className="mr-2" size={16} />
                      Vídeo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                      <Heart className="mr-2" size={16} />
                      Pedido Oração
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[#6ea1a7] hover:text-[#257b82] transition-colors">
                      <BookOpen className="mr-2" size={16} />
                      Versículo
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={(!postContent.trim() && selectedImages.length === 0 && !selectedVideo) || createPostMutation.isPending || uploadFilesMutation.isPending}
                    className="bg-[#257b82] hover:bg-[#6ea1a7] text-white px-6 py-2 rounded-full transition-colors"
                  >
                    {createPostMutation.isPending || uploadFilesMutation.isPending ? "Publicando..." : "Publicar"}
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
                  <Card key={post.id} className="orlev-card" data-post-id={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#257b82] to-[#7fc7ce] flex items-center justify-center mr-3 overflow-hidden">
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
                          <div className="flex items-center space-x-2">
                            <Link href="/">
                              <h4 className="text-[#257b82] font-semibold hover:underline cursor-pointer">
                                {post.user?.fullName || 'Irmão(ã) em Cristo'}
                              </h4>
                            </Link>
                            {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
                              <span className="text-xs text-gray-400">Editado</span>
                            )}
                          </div>
                          <p className="text-[#6ea1a7] text-sm flex items-center">
                            Há poucos minutos • <Church className="ml-1 mr-1" size={12} /> {post.user?.denomination || 'Denominação não informada'}
                          </p>
                        </div>
                        {user?.id === post.userId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-[#6ea1a7] hover:text-[#257b82]">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPost(post)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        {editingPostId === post.id ? (
                          <>
                            {/* Edit Textarea */}
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              placeholder="Edite sua mensagem..."
                              className="min-h-[3rem] w-full resize-none border-[#257b82]/20 focus:border-[#257b82] mb-3"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit();
                                }
                              }}
                            />

                            {/* Edit Buttons */}
                            <div className="flex justify-end space-x-2 mb-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={editPostMutation.isPending}
                                className="text-[#6ea1a7] border-[#6ea1a7] hover:bg-[#e7f5f6]"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleSaveEdit}
                                disabled={!editingContent.trim() || editPostMutation.isPending}
                                size="sm"
                                className="bg-[#257b82] hover:bg-[#6ea1a7] text-white"
                              >
                                {editPostMutation.isPending ? "Salvando..." : "Salvar"}
                              </Button>
                            </div>

                            {/* Post Images */}
                            {post.imageUrls && post.imageUrls.length > 0 && (
                              <div className="mb-3">
                                {post.imageUrls.length === 1 ? (
                                  <MediaExpansionModal post={post} initialImageIndex={0}>
                                    <img
                                      src={post.imageUrls[0]}
                                      alt="Foto da postagem"
                                      className="w-full max-h-96 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                    />
                                  </MediaExpansionModal>
                                ) : (
                                  <div className={`grid gap-2 ${
                                    post.imageUrls.length === 2 ? 'grid-cols-2' : 
                                    post.imageUrls.length === 3 ? 'grid-cols-2' :
                                    'grid-cols-2'
                                  }`}>
                                    {post.imageUrls.slice(0, 4).map((url: string, index: number) => (
                                      <div key={index} className={`relative ${
                                        post.imageUrls.length === 3 && index === 0 ? 'row-span-2' : ''
                                      }`}>
                                        <MediaExpansionModal post={post} initialImageIndex={index}>
                                          <img
                                            src={url}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                          />
                                        </MediaExpansionModal>
                                        {index === 3 && post.imageUrls.length > 4 && (
                                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center pointer-events-none">
                                            <span className="text-white text-lg font-semibold">
                                              +{post.imageUrls.length - 4}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Post Video */}
                            {post.videoUrl && (
                              <div className="mb-3">
                                <video
                                  src={post.videoUrl}
                                  controls
                                  className="w-full max-h-96 object-cover rounded-lg"
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {post.content && (
                              <p className="text-[#257b82] mb-3 leading-relaxed">{post.content}</p>
                            )}
                            
                            {/* Post Images */}
                            {post.imageUrls && post.imageUrls.length > 0 && (
                              <div className="mb-3">
                                {post.imageUrls.length === 1 ? (
                                  <MediaExpansionModal post={post} initialImageIndex={0}>
                                    <img
                                      src={post.imageUrls[0]}
                                      alt="Foto da postagem"
                                      className="w-full max-h-96 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                    />
                                  </MediaExpansionModal>
                                ) : (
                                  <div className={`grid gap-2 ${
                                    post.imageUrls.length === 2 ? 'grid-cols-2' : 
                                    post.imageUrls.length === 3 ? 'grid-cols-2' :
                                    'grid-cols-2'
                                  }`}>
                                    {post.imageUrls.slice(0, 4).map((url: string, index: number) => (
                                      <div key={index} className={`relative ${
                                        post.imageUrls.length === 3 && index === 0 ? 'row-span-2' : ''
                                      }`}>
                                        <MediaExpansionModal post={post} initialImageIndex={index}>
                                          <img
                                            src={url}
                                            alt={`Foto ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                          />
                                        </MediaExpansionModal>
                                        {index === 3 && post.imageUrls.length > 4 && (
                                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center pointer-events-none">
                                            <span className="text-white text-lg font-semibold">
                                              +{post.imageUrls.length - 4}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Post Video */}
                            {post.videoUrl && (
                              <div className="mb-3">
                                <MediaExpansionModal post={post}>
                                  <div className="relative cursor-pointer hover:opacity-95 transition-opacity">
                                    <video
                                      src={post.videoUrl}
                                      className="w-full max-h-96 object-cover rounded-lg"
                                      muted
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                                        <Play className="text-[#257b82]" size={24} />
                                      </div>
                                    </div>
                                  </div>
                                </MediaExpansionModal>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <PostInteractions post={post} />
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
                  <h3 className="text-[#257b82] font-semibold mb-3">Versículo do Dia</h3>
                  <div className="bg-gradient-to-r from-[#7fc7ce]/10 to-[#257b82]/10 p-3 rounded-lg mb-3">
                    <p className="text-[#257b82] text-sm mb-3 italic font-medium leading-relaxed">
                      "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."
                    </p>
                    <p className="text-[#257b82] text-xs font-bold">João 3:16</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-[#257b82] border-[#257b82] hover:bg-[#257b82] hover:text-white">
                    <BookOpen className="mr-2" size={14} />
                    Compartilhar Versículo
                  </Button>
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
                    <div key={topic.hashtag} className="cursor-pointer hover:bg-[#6ea1a7]/10 p-3 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="text-[#257b82] font-medium text-sm">{topic.hashtag}</div>
                        <span className="text-green-600 text-xs font-semibold">{topic.growth}</span>
                      </div>
                      <div className="text-[#6ea1a7] text-xs mt-1">{topic.posts} posts hoje</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eventos Cristãos */}
            <Card className="orlev-card">
              <CardContent className="p-6">
                <h3 className="text-[#257b82] font-semibold mb-4">
                  <Church className="inline mr-2" size={20} />
                  Próximos Eventos
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-[#7fc7ce]/10 to-[#257b82]/10 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#257b82] font-medium text-sm">Culto de Oração</p>
                        <p className="text-[#6ea1a7] text-xs">Hoje às 19:00</p>
                      </div>
                      <div className="text-[#257b82] text-xs font-bold">HOJE</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg hover:bg-[#6ea1a7]/10 cursor-pointer">
                    <p className="text-[#257b82] font-medium text-sm">Retiro Espiritual</p>
                    <p className="text-[#6ea1a7] text-xs">Sábado às 08:00</p>
                  </div>
                  <div className="p-3 rounded-lg hover:bg-[#6ea1a7]/10 cursor-pointer">
                    <p className="text-[#257b82] font-medium text-sm">Estudo Bíblico</p>
                    <p className="text-[#6ea1a7] text-xs">Quarta às 20:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir postagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que quer excluir a postagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deletePostMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePostMutation.isPending ? "Excluindo..." : "Sim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Picture View Dialog */}
      <Dialog open={profilePictureDialogOpen} onOpenChange={setProfilePictureDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2">
          <DialogHeader>
            <DialogTitle>Foto de Perfil</DialogTitle>
          </DialogHeader>
          {user?.profileImageUrl && (
            <div className="flex justify-center items-center overflow-auto">
              <img 
                src={`${user.profileImageUrl}?t=${Date.now()}`} 
                alt="Profile" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file input for profile picture upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfilePictureFile}
      />

      {/* Chat Popup */}
      <ChatPopup
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        targetUserId={chatTargetUserId}
        targetUserName={chatTargetUserName}
        targetUserProfileImage={chatTargetUserProfileImage}
      />
    </div>
  );
}
