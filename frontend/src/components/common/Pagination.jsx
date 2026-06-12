import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2.5 rounded-xl glass-card bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
            p === currentPage
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-500"
              : "glass-card bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-sm"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2.5 rounded-xl glass-card bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
