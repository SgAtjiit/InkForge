import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SavedPostsService } from "../services/savedPosts.service.js";

export const savePost = asyncHandler(async (req, res) => {
    const result = await SavedPostsService.savePost({
        userId: req.user.id,
        postId: req.params.postId,
    });
    return res.status(200).json(new ApiResponse(200, result, result.message));
});

export const unsavePost = asyncHandler(async (req, res) => {
    const result = await SavedPostsService.unsavePost({
        userId: req.user.id,
        postId: req.params.postId,
    });
    return res.status(200).json(new ApiResponse(200, result, result.message));
});

export const getUserSavedPosts = asyncHandler(async (req, res) => {
    const savedPostsList = await SavedPostsService.getUserSavedPosts(req.user.id);
    return res.status(200).json(new ApiResponse(200, savedPostsList, "Saved posts fetched successfully"));
});
