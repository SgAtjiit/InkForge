import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications, users } from "../db/schema.js";
import { sendTransactionalEmail } from "../utils/email.js";
import { ApiError } from "../utils/ApiError.js";

export class NotificationService {
    static async createNotification({ userId, type, message, sendEmail = false, emailSubject = "" }) {
        const [notification] = await db
            .insert(notifications)
            .values({
                userId,
                type,
                message,
            })
            .returning();

        if (sendEmail) {
            const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (user?.email) {
                setImmediate(() => {
                    sendTransactionalEmail({
                        to: user.email,
                        subject: emailSubject || `InkForge Notification: ${type}`,
                        html: `<p>Hello ${user.name},</p><p>${message}</p><p>Best regards,<br/>The InkForge Team</p>`,
                    });
                });
            }
        }

        return notification;
    }

    static async getUserNotifications(userId) {
        const list = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt));

        return list;
    }

    static async markAsRead(notificationId, userId) {
        const [existing] = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .limit(1);

        if (!existing) {
            throw new ApiError(404, "Notification not found");
        }

        const [updated] = await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId))
            .returning();

        return updated;
    }
}
