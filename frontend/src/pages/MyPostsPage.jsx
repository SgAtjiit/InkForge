import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  PlusCircle, 
  Eye, 
  Trash2, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Filter 
} from "lucide-react";
import { getMyPostsAPI, deletePostAPI } from "../services/post.service";
import { PostStatusBadge } from "../components/posts/PostStatusBadge";
import { PostSkeleton } from "../components/posts/PostSkeleton";
import { Pagination } from "../components/common/Pagination";
import { useNotification } from "../context/NotificationContext";
import { formatDate } from "../utils/formatters";

const STATUS_TABS = [
  { id: "all", label: "All Posts" },
  { id: "published", label: "Published" },
  { id: "pending", label: "Pending AI Review" },
  { id: "needs_review", label: "Needs Admin Review" },
  { id: "rejected", label: "Rejected" },
  { id: "draft", label: "Drafts" },
];

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const { showNotification } = useNotification();

  const fetchMyPosts = async (page = 1, status = statusFilter) => {
    try {
      setLoading(true);
      const params = { page, limit: 8 };
      if (status !== "all") params.status = status;

      const res = await getMyPostsAPI(params);
      setPosts(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to load your posts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleTabChange = (statusId) => {
    setStatusFilter(statusId);
    setCurrentPage(1);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(postId);
      await deletePostAPI(postId);
      showNotification("Post deleted successfully", "success");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to delete post", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
            My Authored Posts
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track submission statuses, AI moderation feedback, and manage your articles.
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition duration-200"
        >
          <PlusCircle className="w-5 h-5" />
          Write New Article
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <div className="flex items-center text-slate-400 text-xs font-semibold uppercase tracking-wider mr-2">
          <Filter className="w-4 h-4 mr-1" />
          Filter:
        </div>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
              statusFilter === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-12 text-center my-8 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4 stroke-1" />
          <h3 className="text-lg font-bold text-slate-800">No Posts Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {statusFilter === "all"
              ? "You haven't written any posts yet. Share your technical knowledge with the community!"
              : `No posts found with status '${statusFilter}'.`}
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Create Your First Article
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition hover:shadow-md border border-slate-200/80"
            >
              {/* Left Column: Image & Details */}
              <div className="flex items-start gap-4 flex-1">
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <FileText className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PostStatusBadge status={post.status} />
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition">
                    {post.title}
                  </h2>

                  {/* Status Specific Notes */}
                  {post.status === "rejected" && post.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Rejection Note:</span> {post.rejectionReason}
                      </div>
                    </div>
                  )}

                  {(post.status === "needs_review" || post.status === "pending") && post.aiFlags && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <span className="font-semibold">AI Flag Note:</span>{" "}
                        {post.aiFlags?.issues?.join(", ") || "Awaiting moderation inspection."}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {post.status === "published" && (
                  <Link
                    to={`/posts/${post.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                )}

                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === post.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
