import React, { useState, useEffect, useCallback } from "react";
import { getPostCommentsAPI, createCommentAPI, deleteCommentAPI } from "../../services/comment.service.js";
import { CommentItem } from "./CommentItem.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "../../context/NotificationContext.jsx";
import { MessageSquare, Send, Loader2 } from "lucide-react";

export const CommentTree = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPostCommentsAPI(postId);
      setComments(response?.data || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } Object.finally ? undefined : null;
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);

  const handleCreateRootComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (!user) {
      showError("Please sign in to leave a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCommentAPI({
        postId,
        content: newCommentText,
      });
      setNewCommentText("");
      showSuccess("Comment added");
      await fetchComments();
    } catch (err) {
      showError("Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (replyPayload) => {
    await createCommentAPI(replyPayload);
    showSuccess("Reply added");
    await fetchComments();
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteCommentAPI(commentId);
      showSuccess("Comment deleted");
      await fetchComments();
    } catch (err) {
      showError("Failed to delete comment");
    }
  };

  return (
    <section className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl bg-white space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        <h3 className="text-xl font-bold text-slate-900">Community Comments</h3>
      </div>

      {/* Root Comment Form */}
      {user ? (
        <form onSubmit={handleCreateRootComment} className="space-y-3">
          <textarea
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share your thoughts on this article..."
            className="w-full p-4 rounded-2xl glass-input text-sm resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newCommentText.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Post Comment</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-600 font-medium">
          Please{" "}
          <a href="/login" className="text-indigo-600 font-bold hover:underline">
            sign in
          </a>{" "}
          to participate in the discussion.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs">Loading discussion thread...</p>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center py-8 text-sm text-slate-500 font-medium">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-4 pt-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </section>
  );
};
