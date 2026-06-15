import React, { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle2, XCircle, X, ShieldAlert } from "lucide-react";
import { updatePostStatusAPI } from "../../services/admin.service.js";
import { useNotification } from "../../context/NotificationContext.jsx";

export const AIModerationInspectorModal = ({ post, onClose, onActionComplete }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useNotification();
  const aiFlags = post?.aiFlags || {};
  const severity = aiFlags.severity || "none";

  const handleStatusChange = async (newStatus) => {
    if (newStatus === "rejected" && !rejectionReason.trim()) {
      showError("Please enter a rejection reason");
      return;
    }

    setSubmitting(true);
    try {
      await updatePostStatusAPI(post.id, {
        status: newStatus,
        rejectionReason: newStatus === "rejected" ? rejectionReason : null,
      });

      showSuccess(`Post status updated to ${newStatus}`);
      onActionComplete();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update post status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl bg-white relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Moderation Inspector</h3>
              <p className="text-xs font-medium text-slate-500">Review OpenRouter AI moderation findings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Target Post</span>
          <h4 className="text-base font-bold text-slate-900 leading-snug">{post.title}</h4>
          <p className="text-xs text-slate-600">Author: {post.author?.name} ({post.author?.email})</p>
        </div>

        {/* OpenRouter AI Flags Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Moderation Flags Analysis
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                severity === "high"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : severity === "medium"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              Severity: {severity}
            </span>
          </div>

          {aiFlags.issues && aiFlags.issues.length > 0 ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Detected Content Issues:</span>
              </span>
              <ul className="list-disc list-inside text-xs text-rose-700 space-y-1 pl-2 font-medium">
                {aiFlags.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No severe content violations flagged by OpenRouter AI.</span>
            </div>
          )}

          {post.aiSuggestedContent && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Suggested Content Modification:</span>
              </span>
              <p className="text-xs text-indigo-800 pl-5">{post.aiSuggestedContent}</p>
            </div>
          )}
        </div>

        {/* Decision Controls */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          {showRejectPrompt ? (
            <div className="space-y-3 animate-fade-in">
              <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider">
                Reason for Rejection *
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this post is rejected..."
                className="w-full p-3 rounded-xl glass-input text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectPrompt(false)}
                  className="px-4 py-2 rounded-xl glass-card bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleStatusChange("rejected")}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={submitting}
                onClick={() => setShowRejectPrompt(true)}
                className="px-5 py-2.5 rounded-xl glass-card bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Article</span>
              </button>

              <button
                disabled={submitting}
                onClick={() => handleStatusChange("published")}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Publish</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
