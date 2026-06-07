import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CommentService } from "../services/comment.service.js";

export const createComment = asyncHandler(async (req, res) => {
    const comment = await CommentService.createComment({
        userId: req.user.id,
        ...req.body,
    });
    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
});

export const getPostComments = asyncHandler(async (req, res) => {
    const tree = await CommentService.getPostCommentsTree(req.params.postId);
    return res.status(200).json(new ApiResponse(200, tree, "Comments fetched successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
    await CommentService.deleteComment({
        commentId: req.params.id,
        userId: req.user.id,
        role: req.user.role,
    });
    return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});
