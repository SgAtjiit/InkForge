import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useNotification } from "../context/NotificationContext.jsx";
import { Feather, Eye, EyeOff, Loader2, Check, ArrowRight } from "lucide-react";

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { signup, login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const hasMinLength = formData.password.length >= 8;
  const hasNumber = /\d/.test(formData.password);
  const hasSymbol = /[!@#$%^&*]/.test(formData.password);
  const strengthScore = [hasMinLength, hasNumber, hasSymbol].filter(Boolean).length;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (strengthScore < 3) {
      setErrorMsg("Password must be at least 8 characters and include a number & special symbol (!@#$%^&*)");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(formData);
      showSuccess("Account created successfully! Signing you in...");
      await login({ email: formData.email, password: formData.password });
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 border border-slate-200 shadow-xl bg-white relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Feather className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Join InkForge Today</h2>
          <p className="text-sm text-slate-500 mt-1">Start writing, sharing, and engaging with AI moderation</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium animate-fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
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

            {/* Password Checklist */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasMinLength ? "bg-emerald-500 text-white" : "bg-slate-300"}`}>
                  {hasMinLength && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={hasMinLength ? "text-emerald-700 font-semibold" : ""}>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasNumber ? "bg-emerald-500 text-white" : "bg-slate-300"}`}>
                  {hasNumber && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={hasNumber ? "text-emerald-700 font-semibold" : ""}>At least 1 number</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasSymbol ? "bg-emerald-500 text-white" : "bg-slate-300"}`}>
                  {hasSymbol && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={hasSymbol ? "text-emerald-700 font-semibold" : ""}>At least 1 special character (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Bio (Optional)
            </label>
            <textarea
              name="bio"
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell readers about yourself..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold text-sm shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6 relative z-10">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
            Sign In instead
          </Link>
        </p>
      </div>
    </div>
  );
};
