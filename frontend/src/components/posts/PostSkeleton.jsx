import React from "react";

export const PostSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden h-96 animate-pulse flex flex-col justify-between p-6 space-y-4 bg-white border border-slate-200">
      <div className="space-y-4">
        <div className="w-full h-40 bg-slate-200/80 rounded-xl" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200" />
          <div className="h-3 w-32 bg-slate-200 rounded" />
        </div>
        <div className="h-5 w-3/4 bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
      </div>
      <div className="h-3 w-20 bg-slate-200 rounded" />
    </div>
  );
};
