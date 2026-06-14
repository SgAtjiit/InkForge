import React, { useState } from "react";
import { formatDate } from "../../utils/formatters.js";
import { Reply, Trash2, Send, CornerDownRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "../../context/NotificationContext.jsx";

export const CommentItem = ({ comment, postId, onAddReply, onDeleteComment }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { showError } = useNotification();

  const isDeleted = comment.status === "deleted";
  const isOwner = user && (user.id === comment.userId || user.role === "admin");

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    if (!user) {
      showError("Please sign in to reply to comments");
      return;
    }

    setSubmitting(true);
    try {
      await onAddReply({
        postId,
        content: replyContent,
        parentCommentId: comment.id,
      });
      setReplyContent("");
      setShowReplyForm(false);
    } catch (err) {
      showError("Failed to add reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="glass-card rounded-2xl p-4 border border-slate-200 bg-white space-y-2 shadow-sm">
        {/* Author Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700">
              {comment.user?.avatarUrl ? (
                <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-6 h-6 rounded-lg object-cover" />
              ) : (
                comment.user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <span className="text-xs font-bold text-slate-800">
              {comment.user?.name || "User"}
            </span>
            <span className="text-[10px] font-medium text-slate-400">• {formatDate(comment.createdAt)}</span>
          </div>

          {!isDeleted && isOwner && (
            <button
              onClick={() => onDeleteComment(comment.id)}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Comment Body */}
        <p className={`text-sm ${isDeleted ? "text-slate-400 italic" : "text-slate-700"}`}>
          {comment.content}
        </p>

        {/* Action Reply Button */}
        {!isDeleted && user && (
          <div className="pt-1">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        )}

        {/* Inline Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="pt-2 flex items-center gap-2">
            <CornerDownRight className="w-4 h-4 text-indigo-600 shrink-0" />
            <input
              type="text"
              required
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Replying to ${comment.user?.name || "user"}...`}
              className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Recursive Nested Children Render */}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-4 sm:ml-6 pl-4 border-l-2 border-slate-200 space-y-3">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              postId={postId}
              onAddReply={onAddReply}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
