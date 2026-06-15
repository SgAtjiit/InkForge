import React, { useState, useEffect, useCallback } from "react";
import { getPendingPostsAPI } from "../services/admin.service.js";
import { AIModerationInspectorModal } from "../components/admin/AIModerationInspectorModal.jsx";
import { PostStatusBadge } from "../components/posts/PostStatusBadge.jsx";
import { Pagination } from "../components/common/Pagination.jsx";
import { formatDate } from "../utils/formatters.js";
import { ShieldCheck, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const AdminDashboardPage = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPendingPostsAPI({ page: currentPage, limit: 8 });
      const { data, pagination } = response?.data || {};
      setPosts(data || []);
      setTotalPages(pagination?.totalPages || 1);
      setTotalItems(pagination?.totalItems || 0);
    } catch (err) {
      console.error("Failed to load pending posts:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

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

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Admin Moderation Control</span>
        </span>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-xl bg-white space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Post Moderation Queue</h1>
            <p className="text-sm text-slate-500 font-medium">Review pending submissions and OpenRouter AI safety analysis</p>
          </div>
        </div>
      </div>

      {/* Moderation List */}
      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 bg-white border border-slate-200 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-sm font-medium">Fetching pending moderation queue...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 bg-white border border-slate-200 space-y-2">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-lg font-semibold text-slate-900">All clear!</p>
          <p className="text-sm">There are no pending posts awaiting admin moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass-card rounded-2xl p-6 border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <PostStatusBadge status={post.status} />
                    <span className="text-xs font-medium text-slate-500">• Submitted {formatDate(post.createdAt)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>

                  <p className="text-xs text-slate-500 font-medium">
                    Author: <span className="text-slate-800 font-bold">{post.author?.name}</span> ({post.author?.email})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPost(post)}
                  className="px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Inspect AI Flags</span>
                </button>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Modal Popup */}
      {selectedPost && (
        <AIModerationInspectorModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onActionComplete={fetchPending}
        />
      )}
    </div>
  );
};
