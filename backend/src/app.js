import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import authRouter from "./routes/auth.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import postRouter from "./routes/post.routes.js";
import adminRouter from "./routes/admin.routes.js";
import commentRouter from "./routes/comment.routes.js";
import savedPostsRouter from "./routes/savedPosts.routes.js";
import notificationRouter from "./routes/notification.routes.js";

const app = express();

// Security Middlewares
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

// Body Parsing & Cookie Parser
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Request Logging Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Health Check Endpoints
app.get("/health", (req, res) => {
    return res.status(200).json(new ApiResponse(200, { status: "OK", timestamp: new Date().toISOString() }, "Server is healthy"));
});

app.get("/api/v1/health", (req, res) => {
    return res.status(200).json(new ApiResponse(200, { status: "OK", timestamp: new Date().toISOString() }, "InkForge API v1 is healthy"));
});

// API Routes Mount
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/uploads", uploadRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/saved-posts", savedPostsRouter);
app.use("/api/v1/notifications", notificationRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

export { app };
