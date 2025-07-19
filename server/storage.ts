import {
  users,
  astrologicalProfiles,
  posts,
  brazilianStates,
  brazilianMunicipalities,
  communities,
  follows,
  postLikes,
  postComments,
  postShares,
  commentLikes,
  type User,
  type UpsertUser,
  type AstrologicalProfile,
  type InsertAstrologicalProfile,
  type Post,
  type InsertPost,
  type BrazilianState,
  type BrazilianMunicipality,
  type Community,
  type PostLike,
  type InsertPostLike,
  type PostComment,
  type InsertPostComment,
  type PostShare,
  type InsertPostShare,
  type CommentLike,
  type InsertCommentLike,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Astrological profiles
  getAstrologicalProfile(userId: string): Promise<AstrologicalProfile | undefined>;
  createAstrologicalProfile(profile: InsertAstrologicalProfile): Promise<AstrologicalProfile>;
  updateAstrologicalProfile(userId: string, profile: Partial<InsertAstrologicalProfile>): Promise<AstrologicalProfile>;
  updateAstralMapData(userId: string, astralMapData: any): Promise<AstrologicalProfile>;
  
  // Brazilian locations
  getBrazilianStates(): Promise<BrazilianState[]>;
  getBrazilianMunicipalities(stateCode: string): Promise<BrazilianMunicipality[]>;
  getCitiesByState(stateName: string): Promise<BrazilianMunicipality[]>;
  
  // Posts
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsByUser(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(postId: number, userId: string, updateData: Partial<InsertPost>): Promise<{ success: boolean }>;
  deletePost(postId: number, userId: string): Promise<{ success: boolean }>;
  
  // Communities
  getCommunities(): Promise<Community[]>;
  
  // User stats
  getUserStats(userId: string): Promise<{ followers: number; following: number; posts: number }>;
  
  // Follow system
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // Post interactions
  togglePostLike(postId: number, userId: string): Promise<{ liked: boolean }>;
  getPostStats(postId: number, userId: string): Promise<{ likesCount: number; commentsCount: number; sharesCount: number; userLiked: boolean }>;
  createPostComment(postId: number, userId: string, content: string): Promise<PostComment>;
  getPostComments(postId: number): Promise<PostComment[]>;
  deletePostComment(commentId: number, userId: string): Promise<{ success: boolean }>;
  sharePost(postId: number, userId: string): Promise<PostShare>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async getCitiesByState(stateName: string): Promise<BrazilianMunicipality[]> {
    try {
      // Find the state by name to get its code
      const [state] = await db
        .select()
        .from(brazilianStates)
        .where(eq(brazilianStates.name, stateName));

      if (!state) {
        return [];
      }

      // Try to get municipalities from local database first
      const localMunicipalities = await db
        .select()
        .from(brazilianMunicipalities)
        .where(eq(brazilianMunicipalities.stateCode, state.code))
        .orderBy(brazilianMunicipalities.name);
        
      // If we have local data, use it
      if (localMunicipalities.length > 0) {
        return localMunicipalities;
      }
      
      // Otherwise, fetch from IBGE API
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.code}/municipios`);
        
        if (!response.ok) {
          console.error(`IBGE API error: ${response.status}`);
          return [];
        }
        
        const municipalities = await response.json();
        
        // Map IBGE API data to our format
        return municipalities
          .filter((municipality: any) => municipality?.nome && municipality?.id)
          .map((municipality: any) => ({
            id: parseInt(municipality.id),
            name: municipality.nome,
            stateCode: state.code,
            ibgeCode: municipality.id.toString()
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
          
      } catch (apiError) {
        console.error(`Error fetching from IBGE API:`, apiError);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching cities for state ${stateName}:`, error);
      return [];
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

  async updatePost(postId: number, userId: string, updateData: Partial<InsertPost>): Promise<{ success: boolean }> {
    try {
      // First verify the post exists and belongs to the user
      const [post] = await db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post) {
        return { success: false };
      }

      // Only allow the post author to edit their post
      if (post.userId !== userId) {
        return { success: false };
      }

      // Update the post
      await db
        .update(posts)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(posts.id, postId));

      return { success: true };
    } catch (error) {
      console.error("Error updating post:", error);
      return { success: false };
    }
  }

  async deletePost(postId: number, userId: string): Promise<{ success: boolean }> {
    try {
      // First verify the post exists and belongs to the user
      const [post] = await db
        .select({ userId: posts.userId })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post) {
        return { success: false };
      }

      // Only allow the post author to delete their post
      if (post.userId !== userId) {
        return { success: false };
      }

      // Delete related data first (likes, comments, shares)
      await db.delete(postLikes).where(eq(postLikes.postId, postId));
      await db.delete(postShares).where(eq(postShares.postId, postId));
      
      // Delete comments and their likes
      await db.delete(commentLikes).where(
        sql`comment_id IN (SELECT id FROM post_comments WHERE post_id = ${postId})`
      );
      await db.delete(postComments).where(eq(postComments.postId, postId));

      // Delete the post
      await db.delete(posts).where(eq(posts.id, postId));

      return { success: true };
    } catch (error) {
      console.error("Error deleting post:", error);
      return { success: false };
    }
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

  async togglePostLike(postId: number, userId: string): Promise<{ liked: boolean }> {
    // Check if user already liked the post
    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    if (existingLike) {
      // Remove like
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      
      // Update post likes count
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, postId));
        
      return { liked: false };
    } else {
      // Add like
      await db.insert(postLikes).values({ postId, userId });
      
      // Update post likes count
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, postId));
        
      return { liked: true };
    }
  }

  async getPostStats(postId: number, userId: string): Promise<{ likesCount: number; commentsCount: number; sharesCount: number; userLiked: boolean }> {
    // Get likes count
    const [likesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    // Get comments count
    const [commentsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(postComments)
      .where(eq(postComments.postId, postId));

    // Get shares count
    const [sharesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(postShares)
      .where(eq(postShares.postId, postId));

    // Check if user liked the post
    const [userLike] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    return {
      likesCount: likesResult?.count || 0,
      commentsCount: commentsResult?.count || 0,
      sharesCount: sharesResult?.count || 0,
      userLiked: !!userLike,
    };
  }

  async createPostComment(postId: number, userId: string, content: string, parentCommentId?: number): Promise<PostComment> {
    const [comment] = await db.insert(postComments).values({
      postId,
      userId,
      content,
      parentCommentId,
    }).returning();

    // Update post comments count (only for top-level comments)
    if (!parentCommentId) {
      await db
        .update(posts)
        .set({ comments: sql`${posts.comments} + 1` })
        .where(eq(posts.id, postId));
    }

    return comment;
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    const comments = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        content: postComments.content,
        parentCommentId: postComments.parentCommentId,
        createdAt: postComments.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          denomination: users.denomination,
        },
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);

    // Organize comments hierarchically
    const topLevelComments = comments.filter(c => !c.parentCommentId);
    const replies = comments.filter(c => c.parentCommentId);

    // Add replies to their parent comments
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.parentCommentId === comment.id)
    }));

    return commentsWithReplies;
  }

  async sharePost(postId: number, userId: string): Promise<PostShare> {
    const [share] = await db.insert(postShares).values({
      postId,
      userId,
    }).returning();

    // Update post shares count
    await db
      .update(posts)
      .set({ shares: sql`${posts.shares} + 1` })
      .where(eq(posts.id, postId));

    return share;
  }

  async toggleCommentLike(commentId: number, userId: string): Promise<{ liked: boolean }> {
    // Check if user already liked this comment
    const existingLike = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike: remove the like
      await db
        .delete(commentLikes)
        .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
      
      return { liked: false };
    } else {
      // Like: add the like
      await db.insert(commentLikes).values({
        commentId,
        userId
      });
      
      return { liked: true };
    }
  }

  async getCommentStats(commentId: number): Promise<{
    likesCount: number;
    userLiked: boolean;
  }> {
    // Get likes count
    const likesCountResult = await db
      .select({ count: count() })
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));

    const likesCount = likesCountResult[0]?.count || 0;

    return {
      likesCount: Number(likesCount),
      userLiked: false // We'd need userId to check this
    };
  }

  async getCommentStatsWithUser(commentId: number, userId: string): Promise<{
    likesCount: number;
    userLiked: boolean;
  }> {
    // Get likes count
    const likesCountResult = await db
      .select({ count: count() })
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));

    const likesCount = likesCountResult[0]?.count || 0;

    // Check if user liked this comment
    const userLikeResult = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)))
      .limit(1);

    return {
      likesCount: Number(likesCount),
      userLiked: userLikeResult.length > 0
    };
  }

  async deletePostComment(commentId: number, userId: string): Promise<{ success: boolean }> {
    try {
      // First verify the comment exists and belongs to the user
      const [comment] = await db
        .select({ userId: postComments.userId, postId: postComments.postId })
        .from(postComments)
        .where(eq(postComments.id, commentId))
        .limit(1);

      if (!comment) {
        return { success: false };
      }

      // Only allow the comment author to delete their comment
      if (comment.userId !== userId) {
        return { success: false };
      }

      // Delete related comment likes first
      await db
        .delete(commentLikes)
        .where(eq(commentLikes.commentId, commentId));

      // Delete the comment
      await db
        .delete(postComments)
        .where(eq(postComments.id, commentId));

      // Update post comments count
      await db
        .update(posts)
        .set({ comments: sql`${posts.comments} - 1` })
        .where(eq(posts.id, comment.postId));

      return { success: true };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { success: false };
    }
  }

  async updatePostComment(commentId: number, userId: string, content: string): Promise<{ success: boolean }> {
    try {
      // First verify the comment exists and belongs to the user
      const [comment] = await db
        .select({ userId: postComments.userId })
        .from(postComments)
        .where(eq(postComments.id, commentId))
        .limit(1);

      if (!comment) {
        return { success: false };
      }

      // Only allow the comment author to edit their comment
      if (comment.userId !== userId) {
        return { success: false };
      }

      // Update the comment
      await db
        .update(postComments)
        .set({ 
          content, 
          updatedAt: new Date() 
        })
        .where(eq(postComments.id, commentId));

      return { success: true };
    } catch (error) {
      console.error("Error updating comment:", error);
      return { success: false };
    }
  }
}

export const storage = new DatabaseStorage();
