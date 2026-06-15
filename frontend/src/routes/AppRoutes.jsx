import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "../components/common/Navbar.jsx";
import { Footer } from "../components/common/Footer.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { HomePage } from "../pages/HomePage.jsx";
import { ExplorePage } from "../pages/ExplorePage.jsx";
import { CreatePostPage } from "../pages/CreatePostPage.jsx";
import { PostDetailPage } from "../pages/PostDetailPage.jsx";
import { SavedPostsPage } from "../pages/SavedPostsPage.jsx";
import { AdminDashboardPage } from "../pages/AdminDashboardPage.jsx";
import MyPostsPage from "../pages/MyPostsPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { SignupPage } from "../pages/SignupPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { AdminRoute } from "./AdminRoute.jsx";

export const AppRoutes = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      <div>
        <Navbar user={user} onLogout={logout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/posts/:slug" element={<PostDetailPage />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-posts"
              element={
                <ProtectedRoute>
                  <MyPostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedPostsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};
