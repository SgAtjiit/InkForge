import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    pgEnum,
    jsonb,
    index,
    uniqueIndex,
    primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "banned"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "pending", "needs_review", "approved", "rejected", "published"]);
export const commentStatusEnum = pgEnum("comment_status", ["visible", "flagged", "deleted"]);

// 1. Users Table
export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 100 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        passwordHash: text("password_hash").notNull(),
        role: roleEnum("role").default("user").notNull(),
        status: userStatusEnum("status").default("active").notNull(),
        avatarUrl: text("avatar_url"),
        bio: text("bio"),
        emailVerified: boolean("email_verified").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("users_email_idx").on(table.email),
    ]
);

// 2. Posts Table
export const posts = pgTable(
    "posts",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        title: varchar("title", { length: 255 }).notNull(),
        content: text("content").notNull(),
        slug: varchar("slug", { length: 255 }).notNull(),
        status: postStatusEnum("status").default("draft").notNull(),
        aiFlags: jsonb("ai_flags"),
        aiSuggestedContent: text("ai_suggested_content"),
        rejectionReason: text("rejection_reason"),
        coverImageUrl: text("cover_image_url"),
        publishedAt: timestamp("published_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("posts_slug_idx").on(table.slug),
        index("posts_status_idx").on(table.status),
        index("posts_author_id_idx").on(table.authorId),
        index("posts_status_created_at_idx").on(table.status, table.createdAt),
    ]
);

// 3. Comments Table
export const comments = pgTable(
    "comments",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
        userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        content: text("content").notNull(),
        parentCommentId: uuid("parent_comment_id"),
        status: commentStatusEnum("status").default("visible").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("comments_post_id_idx").on(table.postId),
        index("comments_parent_id_idx").on(table.parentCommentId),
    ]
);

// 4. SavedPosts Table (Junction)
export const savedPosts = pgTable(
    "saved_posts",
    {
        userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
        savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.postId] }),
    ]
);

// 5. RefreshTokens Table
export const refreshTokens = pgTable(
    "refresh_tokens",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        tokenHash: text("token_hash").notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        revoked: boolean("revoked").default(false).notNull(),
        deviceInfo: text("device_info"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("refresh_tokens_user_id_idx").on(table.userId),
    ]
);

// 6. Notifications Table
export const notifications = pgTable(
    "notifications",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
        type: varchar("type", { length: 50 }).notNull(),
        message: text("message").notNull(),
        isRead: boolean("is_read").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("notifications_user_id_idx").on(table.userId),
    ]
);

// --- Drizzle Relations ---

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    comments: many(comments),
    savedPosts: many(savedPosts),
    refreshTokens: many(refreshTokens),
    notifications: many(notifications),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    comments: many(comments),
    savedByUsers: many(savedPosts),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
    parentComment: one(comments, {
        fields: [comments.parentCommentId],
        references: [comments.id],
        relationName: "parent_child_comments",
    }),
    childComments: many(comments, {
        relationName: "parent_child_comments",
    }),
}));

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
    user: one(users, {
        fields: [savedPosts.userId],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [savedPosts.postId],
        references: [posts.id],
    }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));