import React, { useState, useEffect } from "react";
import { getSavedPostsAPI } from "../services/savedPosts.service.js";
import { PostCard } from "../components/posts/PostCard.jsx";
import { PostSkeleton } from "../components/posts/PostSkeleton.jsx";
import { Bookmark, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const SavedPostsPage = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await getSavedPostsAPI();
      setSavedItems(response?.data || []);
    } catch (err) {
      console.error("Failed to load saved posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleUnsave = (postId) => {
    setSavedItems((prev) => prev.filter((item) => item.post?.id !== postId));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-xl bg-white space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Saved Bookmarks</h1>
            <p className="text-sm text-slate-500 font-medium">Articles you've saved for quick reading later</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <PostSkeleton key={n} />
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 bg-white border border-slate-200 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-lg font-semibold text-slate-900">No saved bookmarks yet</p>
          <p className="text-sm">Click the bookmark icon on any article to save it here.</p>
          <Link
            to="/explore"
            className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Explore Articles →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => (
            <PostCard
              key={item.post?.id}
              post={item.post}
              initialSaved={true}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
