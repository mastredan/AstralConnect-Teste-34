import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { insertAstrologicalProfileSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupSimpleAuth(app);

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer configuration for file uploads
  const storage_multer = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage_multer,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit for regular uploads, 8MB for profile images handled separately
    },
    fileFilter: function (req, file, cb) {
      if (file.fieldname === 'images') {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos de imagem são permitidos para fotos'));
        }
      } else if (file.fieldname === 'video') {
        // Check if file is a video
        if (file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos de vídeo são permitidos'));
        }
      } else if (file.fieldname === 'profileImage') {
        // Check if file is an image for profile picture
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos de imagem são permitidos para foto de perfil'));
        }
      } else if (file.fieldname === 'image') {
        // Check if file is an image for chat
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas arquivos de imagem são permitidos para chat'));
        }
      } else {
        cb(new Error('Campo de arquivo não reconhecido'));
      }
    }
  });

  // User profile route
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // This route is now handled in simpleAuth.ts

  // Astrological profile routes
  app.post('/api/astrological-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertAstrologicalProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const profile = await storage.createAstrologicalProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating astrological profile:", error);
      res.status(500).json({ message: "Failed to create astrological profile" });
    }
  });

  app.get('/api/astrological-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getAstrologicalProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching astrological profile:", error);
      res.status(500).json({ message: "Failed to fetch astrological profile" });
    }
  });

  // Brazilian locations
  app.get('/api/states', async (req, res) => {
    try {
      const states = await storage.getBrazilianStates();
      res.json(states);
    } catch (error) {
      console.error("Error fetching Brazilian states:", error);
      res.status(500).json({ message: "Failed to fetch Brazilian states" });
    }
  });

  app.get('/api/cities', async (req, res) => {
    try {
      const state = req.query.state as string;
      
      if (!state) {
        return res.status(400).json({ message: "State parameter is required" });
      }
      
      const cities = await storage.getCitiesByState(state);
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.get('/api/brazilian-municipalities/:stateCode', async (req, res) => {
    try {
      const { stateCode } = req.params;
      const municipalities = await storage.getBrazilianMunicipalities(stateCode);
      res.json(municipalities);
    } catch (error) {
      console.error("Error fetching Brazilian municipalities:", error);
      res.status(500).json({ message: "Failed to fetch Brazilian municipalities" });
    }
  });

  // Astral map generation route (advanced version)
  app.post('/api/generate-astral-map', isAuthenticated, async (req: any, res) => {
    try {
      const { calculateAstralMap, formatDateForPython, getCoordinatesFromLocation } = await import('./astralService');
      
      console.log("Generating advanced astral map with data:", req.body);
      
      // Extract data from request
      const { nome, data_nascimento, hora_nascimento, local_nascimento } = req.body;
      
      // Format date for Python processing
      const formattedDate = formatDateForPython(data_nascimento);
      
      // Get coordinates from location
      const coordinates = await getCoordinatesFromLocation(local_nascimento);
      
      // Prepare data for Python calculation
      const astralData = {
        nome,
        data_nascimento: formattedDate,
        hora_nascimento: hora_nascimento || '12:00',
        local_nascimento,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      };
      
      // Calculate astral map using advanced Python API
      const result = await calculateAstralMap(astralData);
      
      console.log('Astral map calculation result:', {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        dataSize: result.data ? JSON.stringify(result.data).length : 0
      });
      
      if (result.success && result.data) {
        // Save astral map data to user profile
        const userId = req.user.claims.sub;
        await storage.updateAstralMapData(userId, result.data);
        
        console.log('Sending astral map data to frontend:', {
          hasData: !!result.data,
          dataKeys: Object.keys(result.data),
          nome: result.data.nome
        });
        
        res.json(result.data);
      } else {
        console.error("Astral map calculation failed:", result.error);
        res.status(500).json({ error: "Failed to generate astral map", details: result.error });
      }
    } catch (error) {
      console.error("Error generating astral map:", error);
      res.status(500).json({ error: "Failed to generate astral map", details: error.message });
    }
  });

  // File upload route
  app.post('/api/upload', isAuthenticated, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]), (req: any, res) => {
    try {
      const files = req.files as { images?: Express.Multer.File[], video?: Express.Multer.File[] };
      const imageUrls: string[] = [];
      let videoUrl: string | undefined;

      if (files.images) {
        files.images.forEach((file) => {
          imageUrls.push(`/uploads/${file.filename}`);
        });
      }

      if (files.video && files.video[0]) {
        videoUrl = `/uploads/${files.video[0].filename}`;
      }

      res.json({
        success: true,
        imageUrls,
        videoUrl
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: 'Erro no upload de arquivos' });
    }
  });

  // Profile picture upload route
  app.post('/api/upload/profile', isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo foi enviado' });
      }

      const userId = req.user.claims.sub;
      const profileImageUrl = `/uploads/${req.file.filename}`;

      // Update user's profile image URL in database
      await storage.updateUserProfileImage(userId, profileImageUrl);

      res.json({
        success: true,
        profileImageUrl
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      res.status(500).json({ success: false, error: 'Erro no upload da foto de perfil' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Posts
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      console.log("Received post data:", req.body);
      
      // Clean up the data before validation
      const cleanData = {
        ...req.body,
        userId,
      };
      
      // Remove empty arrays and null values
      if (cleanData.imageUrls && cleanData.imageUrls.length === 0) {
        delete cleanData.imageUrls;
      }
      if (!cleanData.videoUrl) {
        delete cleanData.videoUrl;
      }
      
      console.log("Cleaned post data:", cleanData);
      
      const postData = insertPostSchema.parse(cleanData);
      
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.issues);
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Edit post
  app.put('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: "Conteúdo da postagem é obrigatório" });
      }
      
      const result = await storage.updatePost(postId, userId, { content: content.trim() });
      
      if (result.success) {
        res.json({ success: true, message: "Postagem editada com sucesso" });
      } else {
        res.status(403).json({ success: false, message: "Você não tem permissão para editar esta postagem" });
      }
    } catch (error) {
      console.error("Error editing post:", error);
      res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
  });

  // Delete post
  app.delete('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const result = await storage.deletePost(postId, userId);
      
      if (result.success) {
        res.json({ success: true, message: "Postagem excluída com sucesso" });
      } else {
        res.status(403).json({ success: false, message: "Você não tem permissão para excluir esta postagem" });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
  });

  // Post interactions routes
  
  // Like/unlike post (toggle)
  app.post('/api/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const result = await storage.togglePostLike(postId, userId);
      res.json({ success: true, liked: result.liked });
    } catch (error) {
      console.error("Error toggling post like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Get post stats (likes, comments, shares counts and user interactions)
  app.get('/api/posts/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const stats = await storage.getPostStats(postId, userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching post stats:", error);
      res.status(500).json({ message: "Failed to fetch post stats" });
    }
  });

  // Add comment to post
  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content, parentCommentId } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      const comment = await storage.createPostComment(postId, userId, content.trim(), parentCommentId);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Get comments for post
  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Share post
  app.post('/api/posts/:id/share', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const share = await storage.sharePost(postId, userId);
      res.json({ success: true, share });
    } catch (error) {
      console.error("Error sharing post:", error);
      res.status(500).json({ message: "Failed to share post" });
    }
  });

  // Like/unlike a comment
  app.post('/api/comments/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const result = await storage.toggleCommentLike(commentId, userId);
      res.json({ success: true, liked: result.liked });
    } catch (error) {
      console.error("Error liking comment:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get comment stats
  app.get('/api/comments/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const stats = await storage.getCommentStatsWithUser(commentId, userId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting comment stats:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Delete comment
  app.delete('/api/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const result = await storage.deletePostComment(commentId, userId);
      
      if (result.success) {
        res.json({ success: true, message: "Comentário excluído com sucesso" });
      } else {
        res.status(403).json({ success: false, message: "Você não tem permissão para excluir este comentário" });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
  });

  // Edit comment
  app.put('/api/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: "Conteúdo do comentário é obrigatório" });
      }
      
      const result = await storage.updatePostComment(commentId, userId, content.trim());
      
      if (result.success) {
        res.json({ success: true, message: "Comentário editado com sucesso" });
      } else {
        res.status(403).json({ success: false, message: "Você não tem permissão para editar este comentário" });
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
  });

  // Communities
  app.get('/api/communities', async (req, res) => {
    try {
      const communities = await storage.getCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  // Follow system
  app.post('/api/follow/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.userId;
      
      await storage.followUser(followerId, followingId);
      res.json({ message: "User followed successfully" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/follow/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followingId = req.params.userId;
      
      await storage.unfollowUser(followerId, followingId);
      res.json({ message: "User unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Generate motivational phrases for countdown
  app.post('/api/generate-motivational-phrase', async (req, res) => {
    try {
      const { context } = req.body;
      const { generateMotivationalPhrase } = await import('./openaiService');
      const phrase = await generateMotivationalPhrase(context);
      res.json({ phrase });
    } catch (error) {
      console.error('Error generating motivational phrase:', error);
      res.status(500).json({ error: 'Failed to generate motivational phrase' });
    }
  });

  // Generate personalized horoscope
  app.get('/api/horoscope', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const astrologicalProfile = await storage.getAstrologicalProfile(userId);
      
      if (!user || !astrologicalProfile || !astrologicalProfile.zodiacSign) {
        return res.status(404).json({ message: "Perfil astrológico não encontrado" });
      }

      const { generatePersonalizedHoroscope } = await import('./horoscopeService');
      const horoscope = await generatePersonalizedHoroscope({
        zodiacSign: astrologicalProfile.zodiacSign,
        userName: user.firstName || 'Usuário',
        date: new Date().toLocaleDateString('pt-BR')
      });

      res.json(horoscope);
    } catch (error) {
      console.error('Error generating personalized horoscope:', error);
      res.status(500).json({ error: 'Failed to generate personalized horoscope' });
    }
  });

  // Messages and Conversations API
  // Start or get conversation with another user
  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }

      // Allow self-conversations for demo purposes
      // if (currentUserId === targetUserId) {
      //   return res.status(400).json({ message: "Não é possível conversar consigo mesmo" });
      // }

      const conversation = await storage.getOrCreateConversation(currentUserId, targetUserId);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      res.status(500).json({ message: "Erro ao criar conversa" });
    }
  });

  // Get user's conversations
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Erro ao buscar conversas" });
    }
  });

  // Get messages from a conversation
  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await storage.getMessages(conversationId, limit, offset);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  // Send a message
  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const senderId = req.user.claims.sub;
      const { content, imageUrl } = req.body;

      if ((!content || !content.trim()) && !imageUrl) {
        return res.status(400).json({ message: "Conteúdo da mensagem ou imagem é obrigatório" });
      }

      const message = await storage.sendMessage(
        conversationId, 
        senderId, 
        content?.trim() || "", 
        imageUrl
      );
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Erro ao enviar mensagem" });
    }
  });

  // Clear conversation messages
  app.delete('/api/conversations/:id/clear', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      await storage.clearConversationMessages(conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing conversation:", error);
      res.status(500).json({ message: "Erro ao excluir mensagens" });
    }
  });

  // Upload chat image
  app.post('/api/upload/chat', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo foi enviado' });
      }

      // Validate file type
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ success: false, error: 'Apenas arquivos de imagem são permitidos' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      res.json({
        success: true,
        imageUrl
      });
    } catch (error) {
      console.error('Chat image upload error:', error);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  });

  // Mark message as read
  app.put('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      await storage.markMessageAsRead(messageId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Erro ao marcar mensagem como lida" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
