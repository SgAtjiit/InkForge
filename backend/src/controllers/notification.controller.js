import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { NotificationService } from "../services/notification.service.js";

export const getUserNotifications = asyncHandler(async (req, res) => {
    const list = await NotificationService.getUserNotifications(req.user.id);
    return res.status(200).json(new ApiResponse(200, list, "Notifications fetched successfully"));
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const updated = await NotificationService.markAsRead(req.params.id, req.user.id);
    return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});
