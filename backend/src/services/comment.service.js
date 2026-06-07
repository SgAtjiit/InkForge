import { eq, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, users, posts } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";

export class CommentService {
    static async createComment({ userId, postId, content, parentCommentId }) {
        const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        if (parentCommentId) {
            const [parent] = await db.select().from(comments).where(eq(comments.id, parentCommentId)).limit(1);
            if (!parent) {
                throw new ApiError(404, "Parent comment not found");
            }
        }

        const [newComment] = await db
            .insert(comments)
            .values({
                postId,
                userId,
                content,
                parentCommentId: parentCommentId || null,
            })
            .returning();

        return newComment;
    }

    static async getPostCommentsTree(postId) {
        const allComments = await db
            .select({
                id: comments.id,
                postId: comments.postId,
                userId: comments.userId,
                content: comments.content,
                parentCommentId: comments.parentCommentId,
                status: comments.status,
                createdAt: comments.createdAt,
                user: {
                    id: users.id,
                    name: users.name,
                    avatarUrl: users.avatarUrl,
                },
            })
            .from(comments)
            .leftJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.postId, postId))
            .orderBy(asc(comments.createdAt));

        const commentMap = {};
        const rootComments = [];

        allComments.forEach((c) => {
            const commentObj = {
                ...c,
                content: c.status === "deleted" ? "[This comment was deleted]" : c.content,
                children: [],
            };
            commentMap[c.id] = commentObj;
        });

        allComments.forEach((c) => {
            if (c.parentCommentId && commentMap[c.parentCommentId]) {
                commentMap[c.parentCommentId].children.push(commentMap[c.id]);
            } else {
                rootComments.push(commentMap[c.id]);
            }
        });

        return rootComments;
    }

    static async deleteComment({ commentId, userId, role }) {
        const [existing] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);

        if (!existing) {
            throw new ApiError(404, "Comment not found");
        }

        if (existing.userId !== userId && role !== "admin") {
            throw new ApiError(403, "Forbidden: You cannot delete this comment");
        }

        await db
            .update(comments)
            .set({ status: "deleted" })
            .where(eq(comments.id, commentId));

        return { success: true };
    }
}
