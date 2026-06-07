import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Max 10 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many authentication requests. Please try again after 15 minutes."));
    },
});
