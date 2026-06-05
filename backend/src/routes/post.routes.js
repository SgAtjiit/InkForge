import { Router } from "express";
import {
    createPost,
    getPublicPosts,
    getFeedPosts,
    getPostBySlug,
    updatePost,
    deletePost,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPostSchema, updatePostSchema } from "../validators/post.validator.js";

const router = Router();

// Public routes
router.get("/", getPublicPosts);
router.get("/feed", getFeedPosts);
router.get("/:slug", getPostBySlug);

// Protected routes (Authors)
router.post("/", verifyJWT, validate(createPostSchema), createPost);
router.patch("/:id", verifyJWT, validate(updatePostSchema), updatePost);
router.delete("/:id", verifyJWT, deletePost);

export default router;
