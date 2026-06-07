import { Router } from "express";
import { getUserNotifications, markNotificationAsRead } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getUserNotifications);
router.patch("/:id/read", markNotificationAsRead);

export default router;
