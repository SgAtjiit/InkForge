import React, { useState, useEffect, useCallback } from "react";
import { getPublicPostsAPI } from "../services/post.service.js";
import { PostCard } from "../components/posts/PostCard.jsx";
import { PostSkeleton } from "../components/posts/PostSkeleton.jsx";
import { Pagination } from "../components/common/Pagination.jsx";
import { Search } from "lucide-react";

export const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPublicPostsAPI({
        page: currentPage,
        limit: 9,
        search,
      });

      const { data, pagination } = response?.data || {};
      setPosts(data || []);
      setTotalPages(pagination?.totalPages || 1);
      setTotalItems(pagination?.totalItems || 0);
    } catch (err) {
      console.error("Failed to fetch explore posts:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="glass-card rounded-3xl p-8 border border-slate-200 shadow-xl bg-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Explore Articles</h1>
            <p className="text-sm text-slate-500 mt-1">Search through community posts and technical writeups</p>
          </div>

          {totalItems > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 self-start md:self-auto">
              {totalItems} {totalItems === 1 ? "Article" : "Articles"} Found
            </span>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by article title or keyword..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl glass-input text-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <PostSkeleton key={n} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-500 bg-white border border-slate-200 space-y-2">
          <p className="text-lg font-semibold text-slate-900">No articles matching "{search}"</p>
          <p className="text-sm">Try searching with a different term or clear the search filter.</p>
          {search && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setCurrentPage(1);
              }}
              className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </>
      )}
    </div>
  );
};
