import React from 'react';

export interface CustomCyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'magenta' | 'emerald' | 'amber' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
  mask?: boolean;
}

const VARIANTS = {
  cyan: {
    bg: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white',
    border: 'border-cyan-400/50',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]',
  },
  magenta: {
    bg: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white',
    border: 'border-pink-400/50',
    glow: 'shadow-[0_0_15px_rgba(244,114,182,0.5)]',
  },
  emerald: {
    bg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white',
    border: 'border-emerald-400/50',
    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.5)]',
  },
  amber: {
    bg: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black',
    border: 'border-amber-400/60',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
  },
  slate: {
    bg: 'bg-slate-800 hover:bg-slate-700 text-slate-200',
    border: 'border-slate-600/50',
    glow: 'shadow-none',
  },
};

export const CustomCyberButton: React.FC<CustomCyberButtonProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  shape = 'rounded',
  leftIcon,
  rightIcon,
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const theme = VARIANTS[variant] || VARIANTS.cyan;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  }[size];

  const roundedClasses = {
    rounded: 'rounded-xl',
    pill: 'rounded-full',
    square: 'rounded-md',
  }[shape];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center font-tech font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer border select-none ${sizeClasses} ${roundedClasses} ${theme.bg} ${theme.border} ${
        glow ? theme.glow : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
