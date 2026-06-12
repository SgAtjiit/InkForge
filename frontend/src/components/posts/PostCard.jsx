import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate, calculateReadingTime } from "../../utils/formatters.js";
import { Bookmark, Clock, ArrowUpRight } from "lucide-react";
import { savePostAPI, unsavePostAPI } from "../../services/savedPosts.service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "../../context/NotificationContext.jsx";

export const PostCard = ({ post, initialSaved = false, onUnsave }) => {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showError("Please sign in to save posts to your bookmarks");
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await unsavePostAPI(post.id);
        setIsSaved(false);
        showSuccess("Post removed from bookmarks");
        if (onUnsave) onUnsave(post.id);
      } else {
        await savePostAPI(post.id);
        setIsSaved(true);
        showSuccess("Post saved to bookmarks");
      }
    } catch (err) {
      showError("Failed to update bookmark status");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="glass-card rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full bg-white border border-slate-200">
      <div>
        {/* Cover Image */}
        <Link to={`/posts/${post.slug}`} className="block relative h-48 overflow-hidden bg-slate-100">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-indigo-50 via-slate-100 to-violet-50 flex items-center justify-center p-6 text-center">
              <span className="text-2xl font-black text-indigo-300/60 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                InkForge
              </span>
            </div>
          )}

          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleBookmarkToggle}
              disabled={isSaving}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                isSaved
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                  : "bg-white/90 text-slate-600 border-slate-200 hover:text-indigo-600 hover:bg-white"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
            </button>
          </div>
        </Link>

        {/* Content Section */}
        <div className="p-6">
          {/* Author Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                post.author?.name?.charAt(0).toUpperCase() || "A"
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-800">{post.author?.name || "Anonymous"}</span>
              <span>•</span>
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>

          <Link to={`/posts/${post.slug}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 mb-2 flex items-start justify-between">
              <span>{post.title}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
            </h3>
          </Link>

          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500 font-medium mt-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{calculateReadingTime(post.content)}</span>
        </div>
        <Link
          to={`/posts/${post.slug}`}
          className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Read Article →
        </Link>
      </div>
    </article>
  );
};
