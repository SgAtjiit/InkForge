import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileText } from "lucide-react";

export const PostStatusBadge = ({ status }) => {
  const configs = {
    published: {
      label: "Published",
      bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      icon: CheckCircle2,
    },
    approved: {
      label: "Approved",
      bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      icon: CheckCircle2,
    },
    pending: {
      label: "Under AI Review",
      bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      icon: Clock,
    },
    needs_review: {
      label: "Needs Admin Review",
      bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      icon: AlertTriangle,
    },
    rejected: {
      label: "Rejected",
      bg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      icon: XCircle,
    },
    draft: {
      label: "Draft",
      bg: "bg-slate-500/10 text-slate-300 border-slate-500/30",
      icon: FileText,
    },
  };

  const config = configs[status] || configs.draft;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
