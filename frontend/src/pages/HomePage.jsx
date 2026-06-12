import React, { useState, useEffect, useCallback } from "react";
import { getFeedPostsAPI } from "../services/post.service.js";
import { PostCard } from "../components/posts/PostCard.jsx";
import { PostSkeleton } from "../components/posts/PostSkeleton.jsx";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll.js";
import { Sparkles, TrendingUp, Compass, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchInitialFeed = async () => {
    try {
      setLoading(true);
      const response = await getFeedPostsAPI({ limit: 6 });
      const { data, pagination } = response?.data || {};
      setPosts(data || []);
      setNextCursor(pagination?.nextCursor || null);
      setHasMore(pagination?.hasNextPage ?? false);
    } catch (err) {
      console.error("Failed to load feed posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePosts = useCallback(async () => {
    if (!nextCursor || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const response = await getFeedPostsAPI({ cursor: nextCursor, limit: 6 });
      const { data, pagination } = response?.data || {};
      setPosts((prev) => [...prev, ...(data || [])]);
      setNextCursor(pagination?.nextCursor || null);
      setHasMore(pagination?.hasNextPage ?? false);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, hasMore]);

  useEffect(() => {
    fetchInitialFeed();
  }, []);

  const lastPostRef = useInfiniteScroll(fetchMorePosts, hasMore, loadingMore);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative glass-card rounded-3xl p-8 sm:p-14 overflow-hidden border border-slate-200 shadow-xl bg-white text-center">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Moderated Publishing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Forge Ideas into <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">
              Impactful Stories
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Welcome to InkForge. Share technical insights, developer experiences, and creative essays backed by automated AI moderation.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/create"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Start Writing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3.5 rounded-xl glass-card hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all border border-slate-200 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Explore All</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Latest Community Stream</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Infinite Stream
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <PostSkeleton key={n} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-500 space-y-3 bg-white border border-slate-200">
            <p className="text-lg font-semibold text-slate-900">No published posts yet</p>
            <p className="text-sm">Be the first author to submit an article to InkForge!</p>
            <Link
              to="/create"
              className="inline-block mt-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm"
            >
              + Create a Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, idx) => {
              const isLast = idx === posts.length - 1;
              return (
                <div key={post.id} ref={isLast ? lastPostRef : null}>
                  <PostCard post={post} />
                </div>
              );
            })}
          </div>
        )}

        {/* Loading More Spinner */}
        {loadingMore && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs font-semibold text-slate-500 pt-8 pb-4">
            ✨ You've caught up with all published posts!
          </p>
        )}
      </section>
    </div>
  );
};
