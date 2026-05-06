import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const StatusBadge = ({ status, className }) => {
  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
      case 'present':
      case 'good':
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'submitted':
      case 'blue':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'reviewed':
      case 'purple':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'rejected':
      case 'absent':
      case 'at-risk':
      case 'inactive':
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'excused':
      case 'warning':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'draft':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={twMerge(
      'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all',
      getStatusStyles(status),
      className
    )}>
      {status}
    </span>
  );
};

export default StatusBadge;
