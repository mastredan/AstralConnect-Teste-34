import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  date,
  time,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  fullName: varchar("full_name").notNull(),
  birthDate: date("birth_date").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  denomination: varchar("denomination").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Astrological profiles
export const astrologicalProfiles = pgTable("astrological_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  birthDate: date("birth_date").notNull(),
  birthTime: time("birth_time"),
  birthCountry: varchar("birth_country").notNull(),
  birthState: varchar("birth_state").notNull(),
  birthCity: varchar("birth_city").notNull(),
  zodiacSign: varchar("zodiac_sign"),
  astralMapData: jsonb("astral_map_data"), // Store complete astral map data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brazilian states
export const brazilianStates = pgTable("brazilian_states", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: varchar("name").notNull(),
  region: varchar("region").notNull(),
});

// Brazilian municipalities
export const brazilianMunicipalities = pgTable("brazilian_municipalities", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  stateCode: varchar("state_code", { length: 2 }).references(() => brazilianStates.code).notNull(),
  ibgeCode: varchar("ibge_code").unique(),
});

// Posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content"),
  imageUrls: text("image_urls").array(), // Array of up to 5 image URLs
  videoUrl: varchar("video_url"), // Single video URL
  postType: varchar("post_type").default("text"), // text, image, video, mixed
  community: varchar("community"), // news, cuisine, cinema, entertainment, astrology
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communities
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  icon: varchar("icon"),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User follows
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").references(() => users.id).notNull(),
  followingId: varchar("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post likes ("Amém")
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id").references(() => postComments.id, { onDelete: "cascade" }), // For replies
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post shares
export const postShares = pgTable("post_shares", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sharedPostId: integer("shared_post_id").references(() => posts.id), // If resharing as new post
  createdAt: timestamp("created_at").defaultNow(),
});

// Comment likes
export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => postComments.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: varchar("user1_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  user2Id: varchar("user2_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"), // Support for image messages
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  astrologicalProfile: one(astrologicalProfiles),
  posts: many(posts),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  postLikes: many(postLikes),
  postComments: many(postComments),
  postShares: many(postShares),
}));

export const astrologicalProfilesRelations = relations(astrologicalProfiles, ({ one }) => ({
  user: one(users, {
    fields: [astrologicalProfiles.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
  shares: many(postShares),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const brazilianStatesRelations = relations(brazilianStates, ({ many }) => ({
  municipalities: many(brazilianMunicipalities),
}));

export const brazilianMunicipalitiesRelations = relations(brazilianMunicipalities, ({ one }) => ({
  state: one(brazilianStates, {
    fields: [brazilianMunicipalities.stateCode],
    references: [brazilianStates.code],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one, many }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  likes: many(commentLikes),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(postComments, {
    fields: [commentLikes.commentId],
    references: [postComments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user1: one(users, {
    fields: [conversations.user1Id],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [conversations.user2Id],
    references: [users.id],
    relationName: "user2",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const postSharesRelations = relations(postShares, ({ one }) => ({
  post: one(posts, {
    fields: [postShares.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postShares.userId],
    references: [users.id],
  }),
  sharedPost: one(posts, {
    fields: [postShares.sharedPostId],
    references: [posts.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Registration schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  profileImageUrl: true,
}).extend({
  confirmPassword: z.string().min(6, "Confirmação de senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type InsertAstrologicalProfile = typeof astrologicalProfiles.$inferInsert;
export type AstrologicalProfile = typeof astrologicalProfiles.$inferSelect;

export type InsertPost = typeof posts.$inferInsert;
export type Post = typeof posts.$inferSelect;

export type BrazilianState = typeof brazilianStates.$inferSelect;
export type BrazilianMunicipality = typeof brazilianMunicipalities.$inferSelect;

export type Community = typeof communities.$inferSelect;
export type Follow = typeof follows.$inferSelect;

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

export type PostShare = typeof postShares.$inferSelect;
export type InsertPostShare = typeof postShares.$inferInsert;

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Schemas
export const insertAstrologicalProfileSchema = createInsertSchema(astrologicalProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  comments: true,
  shares: true,
}).extend({
  imageUrls: z.array(z.string()).max(5, "Máximo de 5 fotos por post").optional(),
  videoUrl: z.string().optional(),
}).refine((data) => {
  // At least content, images, or video must be provided
  return data.content || (data.imageUrls && data.imageUrls.length > 0) || data.videoUrl;
}, {
  message: "Post deve conter texto, fotos ou vídeo",
  path: ["content"],
});
