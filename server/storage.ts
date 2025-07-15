import {
  users,
  astrologicalProfiles,
  posts,
  brazilianStates,
  brazilianMunicipalities,
  communities,
  follows,
  type User,
  type UpsertUser,
  type AstrologicalProfile,
  type InsertAstrologicalProfile,
  type Post,
  type InsertPost,
  type BrazilianState,
  type BrazilianMunicipality,
  type Community,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Astrological profiles
  getAstrologicalProfile(userId: string): Promise<AstrologicalProfile | undefined>;
  createAstrologicalProfile(profile: InsertAstrologicalProfile): Promise<AstrologicalProfile>;
  updateAstrologicalProfile(userId: string, profile: Partial<InsertAstrologicalProfile>): Promise<AstrologicalProfile>;
  updateAstralMapData(userId: string, astralMapData: any): Promise<AstrologicalProfile>;
  
  // Brazilian locations
  getBrazilianStates(): Promise<BrazilianState[]>;
  getBrazilianMunicipalities(stateCode: string): Promise<BrazilianMunicipality[]>;
  
  // Posts
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsByUser(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  
  // Communities
  getCommunities(): Promise<Community[]>;
  
  // User stats
  getUserStats(userId: string): Promise<{ followers: number; following: number; posts: number }>;
  
  // Follow system
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAstrologicalProfile(userId: string): Promise<AstrologicalProfile | undefined> {
    const [profile] = await db
      .select()
      .from(astrologicalProfiles)
      .where(eq(astrologicalProfiles.userId, userId));
    return profile;
  }

  async createAstrologicalProfile(profile: InsertAstrologicalProfile): Promise<AstrologicalProfile> {
    const [newProfile] = await db
      .insert(astrologicalProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateAstrologicalProfile(userId: string, profile: Partial<InsertAstrologicalProfile>): Promise<AstrologicalProfile> {
    const [updatedProfile] = await db
      .update(astrologicalProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(astrologicalProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async updateAstralMapData(userId: string, astralMapData: any): Promise<AstrologicalProfile> {
    const [updatedProfile] = await db
      .update(astrologicalProfiles)
      .set({ 
        astralMapData: astralMapData,
        updatedAt: new Date() 
      })
      .where(eq(astrologicalProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getBrazilianStates(): Promise<BrazilianState[]> {
    return await db.select().from(brazilianStates).orderBy(brazilianStates.name);
  }

  async getBrazilianMunicipalities(stateCode: string): Promise<BrazilianMunicipality[]> {
    try {
      // Buscar municípios diretamente da API do IBGE
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`);
      
      if (!response.ok) {
        throw new Error(`IBGE API error: ${response.status}`);
      }
      
      const municipalities = await response.json();
      
      // Mapear os dados da API para o formato esperado
      return municipalities
        .filter((municipality: any) => {
          return municipality && 
                 municipality.nome && 
                 municipality.id &&
                 municipality.microrregiao &&
                 municipality.microrregiao.mesorregiao &&
                 municipality.microrregiao.mesorregiao.UF;
        })
        .map((municipality: any) => ({
          id: parseInt(municipality.id),
          name: municipality.nome,
          stateCode: municipality.microrregiao.mesorregiao.UF.sigla,
          ibgeCode: municipality.id.toString()
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      
    } catch (error) {
      console.error(`Error fetching municipalities from IBGE API for state ${stateCode}:`, error);
      
      // Fallback para dados locais caso a API falhe
      return await db
        .select()
        .from(brazilianMunicipalities)
        .where(eq(brazilianMunicipalities.stateCode, stateCode))
        .orderBy(brazilianMunicipalities.name);
    }
  }

  async getPosts(limit = 20, offset = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPostsByUser(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getCommunities(): Promise<Community[]> {
    return await db.select().from(communities).orderBy(communities.name);
  }

  async getUserStats(userId: string): Promise<{ followers: number; following: number; posts: number }> {
    const [followersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const [postsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.userId, userId));

    return {
      followers: followersCount?.count || 0,
      following: followingCount?.count || 0,
      posts: postsCount?.count || 0,
    };
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    await db.insert(follows).values({ followerId, followingId });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!result;
  }
}

export const storage = new DatabaseStorage();
