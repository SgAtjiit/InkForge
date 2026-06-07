import { Router } from "express";
import { savePost, unsavePost, getUserSavedPosts } from "../controllers/savedPosts.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getUserSavedPosts);
router.post("/:postId", savePost);
router.delete("/:postId", unsavePost);

export default router;
