import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useNotification } from "../context/NotificationContext.jsx";
import { Feather, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      showSuccess("Welcome back to InkForge!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200 shadow-xl bg-white relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <Feather className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign In to InkForge</h2>
          <p className="text-sm text-slate-500 mt-1">Access your posts, draft ideas, and community feed</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium animate-fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-8 relative z-10">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
