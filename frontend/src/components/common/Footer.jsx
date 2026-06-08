import React from "react";
import { Feather, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md mt-20 py-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Feather className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">InkForge</span>
          </div>

          <p className="text-sm text-slate-600 text-center">
            Empowering modern creators with AI-assisted publishing & moderation architecture.
          </p>

          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5 inline" />
            <span>for Developers & Writers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
