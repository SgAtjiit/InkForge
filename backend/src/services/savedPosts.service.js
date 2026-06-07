import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { savedPosts, posts, users } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";

export class SavedPostsService {
    static async savePost({ userId, postId }) {
        const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        const [existing] = await db
            .select()
            .from(savedPosts)
            .where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)))
            .limit(1);

        if (existing) {
            return { saved: true, message: "Post already saved" };
        }

        await db.insert(savedPosts).values({ userId, postId });
        return { saved: true, message: "Post saved successfully" };
    }

    static async unsavePost({ userId, postId }) {
        await db
            .delete(savedPosts)
            .where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)));

        return { saved: false, message: "Post removed from bookmarks" };
    }

    static async getUserSavedPosts(userId) {
        const savedList = await db
            .select({
                savedAt: savedPosts.savedAt,
                post: {
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
                },
            })
            .from(savedPosts)
            .innerJoin(posts, eq(savedPosts.postId, posts.id))
            .leftJoin(users, eq(posts.authorId, users.id))
            .where(eq(savedPosts.userId, userId));

        return savedList;
    }
}
