import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PostService } from "../services/post.service.js";

export const createPost = asyncHandler(async (req, res) => {
    let { title, content, coverImageUrl, status = "draft" } = req.body;

    // If non-admin user attempts to force "published" or "approved", downgrade to "pending" for AI review
    if (req.user?.role !== "admin" && (status === "published" || status === "approved")) {
        status = "pending";
    }

    const post = await PostService.createPost({
        authorId: req.user.id,
        title,
        content,
        coverImageUrl,
        status,
    });
    return res.status(201).json(new ApiResponse(201, post, status === "published" ? "Post published instantly" : "Post submitted for review"));
});

export const getPublicPosts = asyncHandler(async (req, res) => {
    const result = await PostService.getPublicPosts(req.query);
    return res.status(200).json(new ApiResponse(200, result, "Public posts fetched successfully"));
});

export const getFeedPosts = asyncHandler(async (req, res) => {
    const result = await PostService.getFeedPosts(req.query);
    return res.status(200).json(new ApiResponse(200, result, "Feed posts fetched successfully"));
});

export const getPostBySlug = asyncHandler(async (req, res) => {
    const post = await PostService.getPostBySlug(req.params.slug);
    return res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

export const updatePost = asyncHandler(async (req, res) => {
    const updatedPost = await PostService.updatePost({
        postId: req.params.id,
        authorId: req.user.id,
        data: req.body,
    });
    return res.status(200).json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

export const deletePost = asyncHandler(async (req, res) => {
    await PostService.deletePost({
        postId: req.params.id,
        userId: req.user.id,
        role: req.user.role,
    });
    return res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});

export const getPendingPosts = asyncHandler(async (req, res) => {
    const result = await PostService.getPendingPosts(req.query);
    return res.status(200).json(new ApiResponse(200, result, "Pending posts fetched successfully"));
});

export const updatePostStatus = asyncHandler(async (req, res) => {
    const updatedPost = await PostService.updatePostStatus({
        postId: req.params.id,
        status: req.body.status,
        rejectionReason: req.body.rejectionReason,
    });
    return res.status(200).json(new ApiResponse(200, updatedPost, `Post status updated to ${req.body.status}`));
});

export const getMyPosts = asyncHandler(async (req, res) => {
    const result = await PostService.getMyPosts({
        authorId: req.user.id,
        ...req.query,
    });
    return res.status(200).json(new ApiResponse(200, result, "User posts fetched successfully"));
});


