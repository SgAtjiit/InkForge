import { eq, and, desc, lt, ilike, sql, count, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { posts, users } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import { generateSlug } from "../utils/slugify.js";

import { AIModerationService } from "./aiModeration.service.js";

export class PostService {
    static async createPost({ authorId, title, content, coverImageUrl, status = "draft" }) {
        const slug = generateSlug(title);

        const [newPost] = await db
            .insert(posts)
            .values({
                authorId,
                title,
                content,
                slug,
                coverImageUrl: coverImageUrl || null,
                status,
                publishedAt: status === "published" || status === "approved" ? new Date() : null,
            })
            .returning();

        if (status === "pending") {
            setImmediate(() => {
                AIModerationService.processPostModeration(newPost.id).catch((err) =>
                    console.error(`AI Moderation error for post ${newPost.id}:`, err)
                );
            });
        }

        return newPost;
    }

    static async getPublicPosts({ page = 1, limit = 10, search }) {
        const parsedPage = Math.max(1, parseInt(page, 10));
        const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const offset = (parsedPage - 1) * parsedLimit;

        const whereConditions = [eq(posts.status, "published")];
        if (search) {
            whereConditions.push(ilike(posts.title, `%${search}%`));
        }

        const combinedWhere = and(...whereConditions);

        const [totalCountObj] = await db
            .select({ count: count() })
            .from(posts)
            .where(combinedWhere);

        const totalItems = Number(totalCountObj?.count || 0);
        const totalPages = Math.ceil(totalItems / parsedLimit);

        const postsList = await db
            .select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                content: posts.content,
                coverImageUrl: posts.coverImageUrl,
                status: posts.status,
                publishedAt: posts.publishedAt,
                createdAt: posts.createdAt,
                author: {
                    id: users.id,
                    name: users.name,
                    avatarUrl: users.avatarUrl,
                },
            })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .where(combinedWhere)
            .orderBy(desc(posts.createdAt))
            .limit(parsedLimit)
            .offset(offset);

        return {
            data: postsList,
            pagination: {
                currentPage: parsedPage,
                totalPages,
                totalItems,
                hasNextPage: parsedPage < totalPages,
            },
        };
    }

    static async getFeedPosts({ cursor, limit = 10 }) {
        const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const whereConditions = [eq(posts.status, "published")];

        if (cursor) {
            const cursorDate = new Date(cursor);
            if (!isNaN(cursorDate.getTime())) {
                whereConditions.push(lt(posts.createdAt, cursorDate));
            }
        }

        const postsList = await db
            .select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                content: posts.content,
                coverImageUrl: posts.coverImageUrl,
                createdAt: posts.createdAt,
                author: {
                    id: users.id,
                    name: users.name,
                    avatarUrl: users.avatarUrl,
                },
            })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .where(and(...whereConditions))
            .orderBy(desc(posts.createdAt))
            .limit(parsedLimit + 1);

        const hasNextPage = postsList.length > parsedLimit;
        const data = hasNextPage ? postsList.slice(0, parsedLimit) : postsList;
        const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1].createdAt : null;

        return {
            data,
            pagination: {
                nextCursor,
                hasNextPage,
            },
        };
    }

    static async getPostBySlug(slug) {
        const [post] = await db
            .select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                content: posts.content,
                coverImageUrl: posts.coverImageUrl,
                status: posts.status,
                aiFlags: posts.aiFlags,
                publishedAt: posts.publishedAt,
                createdAt: posts.createdAt,
                author: {
                    id: users.id,
                    name: users.name,
                    bio: users.bio,
                    avatarUrl: users.avatarUrl,
                },
            })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .where(eq(posts.slug, slug))
            .limit(1);

        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        return post;
    }

    static async updatePost({ postId, authorId, data }) {
        const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

        if (!existingPost) {
            throw new ApiError(404, "Post not found");
        }

        if (existingPost.authorId !== authorId) {
            throw new ApiError(403, "Forbidden: You cannot edit another author's post");
        }

        const updatePayload = { ...data, updatedAt: new Date() };

        if (data.title && data.title !== existingPost.title) {
            updatePayload.slug = generateSlug(data.title);
        }

        const [updatedPost] = await db
            .update(posts)
            .set(updatePayload)
            .where(eq(posts.id, postId))
            .returning();

        return updatedPost;
    }

    static async deletePost({ postId, userId, role }) {
        const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

        if (!existingPost) {
            throw new ApiError(404, "Post not found");
        }

        if (existingPost.authorId !== userId && role !== "admin") {
            throw new ApiError(403, "Forbidden: You do not have permission to delete this post");
        }

        await db.delete(posts).where(eq(posts.id, postId));
        return { deleted: true };
    }

    static async getPendingPosts({ page = 1, limit = 10 }) {
        const parsedPage = Math.max(1, parseInt(page, 10));
        const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const offset = (parsedPage - 1) * parsedLimit;

        const whereCondition = inArray(posts.status, ["pending", "needs_review"]);

        const [totalCountObj] = await db
            .select({ count: count() })
            .from(posts)
            .where(whereCondition);

        const totalItems = Number(totalCountObj?.count || 0);
        const totalPages = Math.ceil(totalItems / parsedLimit);

        const pendingList = await db
            .select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                status: posts.status,
                aiFlags: posts.aiFlags,
                aiSuggestedContent: posts.aiSuggestedContent,
                createdAt: posts.createdAt,
                author: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
            })
            .from(posts)
            .leftJoin(users, eq(posts.authorId, users.id))
            .where(whereCondition)
            .orderBy(desc(posts.createdAt))
            .limit(parsedLimit)
            .offset(offset);

        return {
            data: pendingList,
            pagination: {
                currentPage: parsedPage,
                totalPages,
                totalItems,
                hasNextPage: parsedPage < totalPages,
            },
        };
    }

    static async updatePostStatus({ postId, status, rejectionReason }) {
        const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

        if (!existingPost) {
            throw new ApiError(404, "Post not found");
        }

        const updatePayload = {
            status,
            rejectionReason: status === "rejected" ? rejectionReason || "Post rejected by administrator" : null,
            updatedAt: new Date(),
        };

        if (status === "published" || status === "approved") {
            updatePayload.publishedAt = existingPost.publishedAt || new Date();
        }

        const [updatedPost] = await db
            .update(posts)
            .set(updatePayload)
            .where(eq(posts.id, postId))
            .returning();

        return updatedPost;
    }

    static async getMyPosts({ authorId, page = 1, limit = 10, status }) {
        const parsedPage = Math.max(1, parseInt(page, 10));
        const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const offset = (parsedPage - 1) * parsedLimit;

        const whereConditions = [eq(posts.authorId, authorId)];
        if (status && status !== "all") {
            whereConditions.push(eq(posts.status, status));
        }

        const combinedWhere = and(...whereConditions);

        const [totalCountObj] = await db
            .select({ count: count() })
            .from(posts)
            .where(combinedWhere);

        const totalItems = Number(totalCountObj?.count || 0);
        const totalPages = Math.ceil(totalItems / parsedLimit);

        const myPostsList = await db
            .select({
                id: posts.id,
                title: posts.title,
                slug: posts.slug,
                content: posts.content,
                coverImageUrl: posts.coverImageUrl,
                status: posts.status,
                aiFlags: posts.aiFlags,
                aiSuggestedContent: posts.aiSuggestedContent,
                rejectionReason: posts.rejectionReason,
                publishedAt: posts.publishedAt,
                createdAt: posts.createdAt,
                updatedAt: posts.updatedAt,
            })
            .from(posts)
            .where(combinedWhere)
            .orderBy(desc(posts.createdAt))
            .limit(parsedLimit)
            .offset(offset);

        return {
            data: myPostsList,
            pagination: {
                currentPage: parsedPage,
                totalPages,
                totalItems,
                hasNextPage: parsedPage < totalPages,
            },
        };
    }
}
