import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized request: Missing or invalid token format");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
        decoded = verifyAccessToken(token);
    } catch (err) {
        throw new ApiError(401, "Unauthorized request: Token expired or invalid", [err.message]);
    }

    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (!user) {
        throw new ApiError(401, "Unauthorized request: User no longer exists");
    }

    if (user.status !== "active") {
        throw new ApiError(403, `Account is ${user.status}. Access denied.`);
    }

    req.user = user;
    next();
});
