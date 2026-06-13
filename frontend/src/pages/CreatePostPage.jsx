import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPostAPI } from "../services/post.service.js";
import { ImageUploader } from "../components/common/ImageUploader.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { Sparkles, Loader2, Save, Send, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export const CreatePostPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showError("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPostAPI({
        title,
        content,
        coverImageUrl: coverImageUrl || null,
        status: submitStatus,
      });

      showSuccess(
        submitStatus === "published"
          ? "Post published instantly without AI moderation queue (Admin privileges)."
          : submitStatus === "pending"
          ? "Post submitted successfully! OpenRouter AI is currently analyzing content."
          : "Draft saved successfully!"
      );
      navigate("/explore");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit post";
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back Link & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        {isAdmin && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Instant Publishing Enabled</span>
          </span>
        )}
      </div>

      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl bg-white space-y-8">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">Create New Post</h1>
          <p className="text-sm text-slate-500">
            Share your knowledge with the InkForge community. {isAdmin ? "As an admin, you can bypass moderation or submit standard posts." : "Submitted posts undergo automated OpenRouter AI moderation review."}
          </p>
        </div>

        {/* Informational OpenRouter Banner */}
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3 text-xs text-indigo-900">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-indigo-950">Automated AI Moderation Enabled</p>
            <p className="mt-0.5 text-indigo-800">
              When standard users click "Submit for Review", OpenRouter AI analyzes post safety. Clean posts move directly to admin review; flagged posts trigger author safety recommendations.
            </p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Post Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building Scalable Web Apps with Node.js and Drizzle ORM"
              className="w-full px-4 py-3.5 rounded-2xl glass-input text-base font-semibold"
            />
          </div>

          {/* Cover Image Uploader */}
          <ImageUploader
            value={coverImageUrl}
            onChange={(url) => setCoverImageUrl(url)}
            label="Cover Image (Optional)"
          />

          {/* Post Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Article Content *
            </label>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here..."
              className="w-full p-4 rounded-2xl glass-input text-sm leading-relaxed resize-y font-mono"
            />
          </div>

          {/* Submission Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "draft")}
              className="w-full sm:w-auto px-5 py-3 rounded-xl glass-card hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "pending")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, "published")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Instant Publish (Admin)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
