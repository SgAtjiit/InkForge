import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, refreshTokens } from "../db/schema.js";
import { ApiError } from "../utils/ApiError.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashToken,
    compareToken,
} from "../utils/tokens.js";

export class AuthService {
    static async signup({ name, email, password, bio }) {
        const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser) {
            throw new ApiError(409, "User with this email already exists");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [newUser] = await db
            .insert(users)
            .values({
                name,
                email,
                passwordHash,
                bio: bio || null,
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                status: users.status,
                avatarUrl: users.avatarUrl,
                bio: users.bio,
                createdAt: users.createdAt,
            });

        return newUser;
    }

    static async login({ email, password, deviceInfo }) {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        if (user.status !== "active") {
            throw new ApiError(403, `Account is ${user.status}. Access denied.`);
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        const payload = { userId: user.id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const tokenHash = await hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.insert(refreshTokens).values({
            userId: user.id,
            tokenHash,
            expiresAt,
            deviceInfo: deviceInfo || null,
        });

        const { passwordHash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }

    static async refreshAccessToken(incomingRefreshToken) {
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Refresh token missing");
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(incomingRefreshToken);
        } catch (err) {
            throw new ApiError(401, "Refresh token expired or invalid");
        }

        const activeTokens = await db
            .select()
            .from(refreshTokens)
            .where(and(eq(refreshTokens.userId, decoded.userId), eq(refreshTokens.revoked, false)));

        let matchedTokenRecord = null;
        for (const record of activeTokens) {
            const isMatch = await compareToken(incomingRefreshToken, record.tokenHash);
            if (isMatch) {
                matchedTokenRecord = record;
                break;
            }
        }

        if (!matchedTokenRecord) {
            throw new ApiError(401, "Refresh token revoked or unrecognized");
        }

        // Token Rotation: Revoke old refresh token
        await db
            .update(refreshTokens)
            .set({ revoked: true })
            .where(eq(refreshTokens.id, matchedTokenRecord.id));

        const payload = { userId: decoded.userId, role: decoded.role };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        const newHash = await hashToken(newRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.insert(refreshTokens).values({
            userId: decoded.userId,
            tokenHash: newHash,
            expiresAt,
            deviceInfo: matchedTokenRecord.deviceInfo,
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    static async logout(incomingRefreshToken, userId) {
        if (!incomingRefreshToken) return;

        const userTokens = await db
            .select()
            .from(refreshTokens)
            .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)));

        for (const record of userTokens) {
            const isMatch = await compareToken(incomingRefreshToken, record.tokenHash);
            if (isMatch) {
                await db
                    .update(refreshTokens)
                    .set({ revoked: true })
                    .where(eq(refreshTokens.id, record.id));
                break;
            }
        }
    }
}
