import { Router } from "express";
import { createComment, getPostComments, deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCommentSchema } from "../validators/comment.validator.js";

const router = Router();

router.get("/post/:postId", getPostComments);
router.post("/", verifyJWT, validate(createCommentSchema), createComment);
router.delete("/:id", verifyJWT, deleteComment);

export default router;
