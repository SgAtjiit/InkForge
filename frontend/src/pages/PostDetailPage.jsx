import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostBySlugAPI, deletePostAPI } from "../services/post.service.js";
import { PostStatusBadge } from "../components/posts/PostStatusBadge.jsx";
import { formatDate, calculateReadingTime } from "../utils/formatters.js";
import { useAuth } from "../hooks/useAuth.js";
import { useNotification } from "../context/NotificationContext.jsx";
import { Clock, Calendar, Trash2, ArrowLeft, AlertCircle, Sparkles, Bookmark } from "lucide-react";
import { savePostAPI, unsavePostAPI } from "../services/savedPosts.service.js";
import { CommentTree } from "../components/comments/CommentTree.jsx";

export const PostDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPostBySlugAPI(slug);
      setPost(response?.data || null);
    } catch (err) {
      showError("Post not found");
      navigate("/explore");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await deletePostAPI(post.id);
      showSuccess("Post deleted successfully");
      navigate("/explore");
    } catch (err) {
      showError("Failed to delete post");
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      showError("Please sign in to bookmark posts");
      return;
    }
    try {
      if (isSaved) {
        await unsavePostAPI(post.id);
        setIsSaved(false);
        showSuccess("Removed from bookmarks");
      } else {
        await savePostAPI(post.id);
        setIsSaved(true);
        showSuccess("Added to bookmarks");
      }
    } catch (err) {
      showError("Failed to bookmark post");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-500">Loading article...</p>
      </div>
    );
  }

  if (!post) return null;

  const isOwner = user && (user.id === post.author?.id || user.role === "admin");

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmarkToggle}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
              isSaved
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                : "glass-card bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
            <span>{isSaved ? "Bookmarked" : "Save Post"}</span>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl glass-card bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Post Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-xl bg-white space-y-8">
        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="rounded-2xl overflow-hidden h-72 sm:h-96 w-full bg-slate-100 border border-slate-200">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title & Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <PostStatusBadge status={post.status} />
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {calculateReadingTime(post.content)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            {post.title}
          </h1>

          {/* Author Card */}
          <div className="flex items-center gap-4 pt-2 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-11 h-11 rounded-xl object-cover" />
              ) : (
                post.author?.name?.charAt(0).toUpperCase() || "A"
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{post.author?.name || "Anonymous Author"}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                <Calendar className="w-3 h-3" />
                Published {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Moderation Warnings for Author / Admin */}
        {post.rejectionReason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Moderation Rejection Reason</span>
            </div>
            <p className="text-xs text-rose-700 pl-6">{post.rejectionReason}</p>
          </div>
        )}

        {post.aiSuggestedContent && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
              <span>OpenRouter AI Content Optimization Suggestion</span>
            </div>
            <p className="text-xs text-amber-800 pl-6">{post.aiSuggestedContent}</p>
          </div>
        )}

        {/* Article Body */}
        <div className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-serif space-y-4">
          {post.content}
        </div>
      </div>

      {/* Community Threaded Comments */}
      <CommentTree postId={post.id} />
    </article>
  );
};
