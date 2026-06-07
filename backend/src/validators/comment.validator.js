import { z } from "zod";

export const createCommentSchema = z.object({
    postId: z.string().uuid("Invalid post ID"),
    content: z.string().min(1, "Comment content cannot be empty").max(2000, "Comment cannot exceed 2000 characters"),
    parentCommentId: z.string().uuid("Invalid parent comment ID").optional().nullable(),
});
