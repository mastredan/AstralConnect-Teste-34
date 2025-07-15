import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { insertAstrologicalProfileSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupSimpleAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get astrological profile
      const astrologicalProfile = await storage.getAstrologicalProfile(userId);
      
      // Get user stats
      const stats = await storage.getUserStats(userId);
      
      res.json({
        ...user,
        astrologicalProfile,
        stats,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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
  app.get('/api/brazilian-states', async (req, res) => {
    try {
      const states = await storage.getBrazilianStates();
      res.json(states);
    } catch (error) {
      console.error("Error fetching Brazilian states:", error);
      res.status(500).json({ message: "Failed to fetch Brazilian states" });
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

  // Astral map generation route
  app.post('/api/generate-astral-map', async (req, res) => {
    try {
      const { gerarMapaAstral } = require('./astralCalculator');
      
      console.log("Generating astral map with data:", req.body);
      
      // Gerar mapa astral usando o calculador local
      const astralData = gerarMapaAstral(req.body);
      
      res.json(astralData);
    } catch (error) {
      console.error("Error generating astral map:", error);
      res.status(500).json({ error: "Failed to generate astral map", details: error.message });
    }
  });

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
      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
      });
      
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
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

  const httpServer = createServer(app);
  return httpServer;
}
