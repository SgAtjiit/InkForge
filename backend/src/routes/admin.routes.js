import { Router } from "express";
import { getPendingPosts, updatePostStatus } from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updatePostStatusSchema } from "../validators/post.validator.js";

const router = Router();

// Protect all admin routes with JWT + Admin Role Check
router.use(verifyJWT, requireRole("admin"));

router.get("/posts/pending", getPendingPosts);
router.patch("/posts/:id/status", validate(updatePostStatusSchema), updatePostStatus);

export default router;
