import { z } from "zod";

export const createPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title cannot exceed 255 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    coverImageUrl: z.string().url("Invalid image URL").optional().nullable(),
    status: z.enum(["draft", "pending"]).optional().default("draft"),
});

export const updatePostSchema = z.object({
    title: z.string().min(3).max(255).optional(),
    content: z.string().min(10).optional(),
    coverImageUrl: z.string().url().optional().nullable(),
    status: z.enum(["draft", "pending"]).optional(),
});

export const updatePostStatusSchema = z.object({
    status: z.enum(["draft", "pending", "needs_review", "approved", "rejected", "published"]),
    rejectionReason: z.string().optional().nullable(),
});
