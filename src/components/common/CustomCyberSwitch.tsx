import React from 'react';

export interface CustomCyberSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  onLabel?: string;
  offLabel?: string;
  showText?: boolean;
  variant?: 'neon-green' | 'neon-cyan' | 'cyber-purple' | 'magenta';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const VARIANTS = {
  'neon-green': {
    activeTrack: 'bg-emerald-950/80 border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    activeThumb: 'bg-gradient-to-tr from-emerald-400 to-green-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]',
    activeText: 'text-emerald-300',
  },
  'neon-cyan': {
    activeTrack: 'bg-cyan-950/80 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    activeThumb: 'bg-gradient-to-tr from-cyan-400 to-sky-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]',
    activeText: 'text-cyan-300',
  },
  'cyber-purple': {
    activeTrack: 'bg-purple-950/80 border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.35)]',
    activeThumb: 'bg-gradient-to-tr from-purple-400 to-fuchsia-300 shadow-[0_0_10px_rgba(192,132,252,0.9)]',
    activeText: 'text-purple-300',
  },
  'magenta': {
    activeTrack: 'bg-pink-950/80 border-pink-400/60 shadow-[0_0_12px_rgba(236,72,153,0.35)]',
    activeThumb: 'bg-gradient-to-tr from-pink-400 to-rose-300 shadow-[0_0_10px_rgba(244,114,182,0.9)]',
    activeText: 'text-pink-300',
  },
};

export const CustomCyberSwitch: React.FC<CustomCyberSwitchProps> = ({
  checked,
  onChange,
  onLabel = 'ON',
  offLabel = 'OFF',
  showText = false,
  variant = 'neon-green',
  size = 'md',
  disabled = false,
  ariaLabel,
  className = '',
}) => {
  const theme = VARIANTS[variant] || VARIANTS['neon-green'];

  const dimensions = {
    sm: { track: 'w-10 h-5 px-0.5', thumb: 'w-4 h-4', translate: 'translate-x-5', text: 'text-[9px]' },
    md: { track: 'w-12 h-6 px-1', thumb: 'w-4 h-4', translate: 'translate-x-6', text: 'text-[10px]' },
    lg: { track: 'w-14 h-7 px-1', thumb: 'w-5 h-5', translate: 'translate-x-7', text: 'text-[11px]' },
  }[size];

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center rounded-full transition-all duration-200 cursor-pointer select-none border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 ${
        dimensions.track
      } ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-700/50'
          : checked
          ? theme.activeTrack
          : 'bg-[#0a0e24] border-slate-700/60 shadow-inner'
      } ${className}`}
    >
      {/* Background status text */}
      {showText && (
        <span
          className={`absolute font-mono font-black tracking-wider uppercase transition-opacity duration-150 pointer-events-none ${
            dimensions.text
          } ${
            checked
              ? `left-2 ${theme.activeText} opacity-90`
              : 'right-2 text-slate-400 opacity-60'
          }`}
        >
          {checked ? onLabel : offLabel}
        </span>
      )}

      {/* Sliding indicator thumb */}
      <span
        className={`inline-block rounded-full transition-transform duration-200 ease-out transform ${
          dimensions.thumb
        } ${
          checked
            ? `${dimensions.translate} ${theme.activeThumb}`
            : 'translate-x-0 bg-slate-500 shadow-sm'
        }`}
      />
    </button>
  );
};
