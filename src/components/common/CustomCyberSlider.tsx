import React from 'react';

export interface CustomCyberSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  variant?: 'neon-cyan' | 'candy-pink' | 'neon-green' | 'cyber-purple';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showBezel?: boolean;
  showGlow?: boolean;
  formatValue?: (val: number) => string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const VARIANTS = {
  'neon-cyan': {
    fill: 'from-cyan-500 to-sky-400',
    thumbBorder: 'border-cyan-300',
    thumbGlow: 'shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    badgeBg: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
  },
  'candy-pink': {
    fill: 'from-pink-500 to-rose-400',
    thumbBorder: 'border-pink-300',
    thumbGlow: 'shadow-[0_0_10px_rgba(244,114,182,0.8)]',
    badgeBg: 'bg-pink-950/70 text-pink-300 border-pink-500/40',
  },
  'neon-green': {
    fill: 'from-emerald-500 to-green-400',
    thumbBorder: 'border-emerald-300',
    thumbGlow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]',
    badgeBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
  },
  'cyber-purple': {
    fill: 'from-purple-500 to-fuchsia-400',
    thumbBorder: 'border-purple-300',
    thumbGlow: 'shadow-[0_0_10px_rgba(192,132,252,0.8)]',
    badgeBg: 'bg-purple-950/70 text-purple-300 border-purple-500/40',
  },
};

export const CustomCyberSlider: React.FC<CustomCyberSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  variant = 'neon-cyan',
  showValue = false,
  formatValue,
  disabled = false,
  ariaLabel,
  className = '',
}) => {
  const theme = VARIANTS[variant] || VARIANTS['neon-cyan'];

  // Clamp & compute percentage
  const clampedVal = Math.min(Math.max(value, min), max);
  const percentage = max > min ? Math.max(0, Math.min(100, ((clampedVal - min) / (max - min)) * 100)) : 0;

  const displayVal = formatValue ? formatValue(clampedVal) : `${Math.round(percentage)}%`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className={`relative flex items-center gap-3 w-full ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {/* Slider track container */}
      <div className="relative flex-1 flex items-center h-6 select-none group">
        {/* Background track */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-[#070b1e] border border-cyan-500/20 overflow-hidden shadow-inner">
          {/* Active fill */}
          <div
            className={`h-full bg-gradient-to-r ${theme.fill} transition-all duration-75`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real HTML Range Input for accessibility & smooth touch drag */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedVal}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedVal}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />

        {/* Styled Cyber Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 ${
            theme.thumbBorder
          } ${theme.thumbGlow} pointer-events-none transition-transform duration-75 group-hover:scale-110`}
          style={{ left: `${percentage}%` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mx-auto my-0.5" />
        </div>
      </div>

      {/* Value Readout Badge */}
      {showValue && (
        <span
          className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold tracking-wider border shrink-0 ${theme.badgeBg}`}
        >
          {displayVal}
        </span>
      )}
    </div>
  );
};
