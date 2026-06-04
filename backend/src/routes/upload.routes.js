import { Router } from "express";
import { getUploadSignature } from "../controllers/upload.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/signature", verifyJWT, getUploadSignature);

export default router;
