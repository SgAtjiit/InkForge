import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { posts } from "../db/schema.js";
import { analyzeContentWithAI } from "../utils/aiModeration.js";

export class AIModerationService {
    static async processPostModeration(postId) {
        const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

        if (!post) return;

        const moderationResult = await analyzeContentWithAI({
            title: post.title,
            content: post.content,
        });

        const newStatus = moderationResult.flagged ? "needs_review" : "pending";

        await db
            .update(posts)
            .set({
                aiFlags: moderationResult,
                aiSuggestedContent: moderationResult.suggestedContent || null,
                status: newStatus,
                updatedAt: new Date(),
            })
            .where(eq(posts.id, postId));

        return { postId, moderationResult, newStatus };
    }

    static async getFlaggedPostsBySeverity(severity = "high") {
        const flaggedPosts = await db
            .select()
            .from(posts)
            .where(sql`${posts.aiFlags}->>'severity' = ${severity}`);

        return flaggedPosts;
    }
}
