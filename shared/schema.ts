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
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
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
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  postType: varchar("post_type").default("text"), // text, image, horoscope
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

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  astrologicalProfile: one(astrologicalProfiles),
  posts: many(posts),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
}));

export const astrologicalProfilesRelations = relations(astrologicalProfiles, ({ one }) => ({
  user: one(users, {
    fields: [astrologicalProfiles.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertAstrologicalProfile = typeof astrologicalProfiles.$inferInsert;
export type AstrologicalProfile = typeof astrologicalProfiles.$inferSelect;

export type InsertPost = typeof posts.$inferInsert;
export type Post = typeof posts.$inferSelect;

export type BrazilianState = typeof brazilianStates.$inferSelect;
export type BrazilianMunicipality = typeof brazilianMunicipalities.$inferSelect;

export type Community = typeof communities.$inferSelect;
export type Follow = typeof follows.$inferSelect;

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
});
