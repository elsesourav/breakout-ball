import React from 'react';

export interface CustomCyberBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md';
  className?: string;
}

const BADGE_VARIANTS = {
  primary: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
  secondary: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  danger: 'bg-red-500/15 text-red-300 border-red-500/40',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
};

export const CustomCyberBadge: React.FC<CustomCyberBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
}) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const colorClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.primary;

  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-wider uppercase rounded-md border ${sizeClass} ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
};
