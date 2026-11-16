import React from 'react';
import { CoreIcon } from './CoreIcon';
import { Plus } from 'lucide-react';

interface TopCoresBadgeProps {
  cores: number;
  isPulsing?: boolean;
  onOpenShop: () => void;
  className?: string;
}

export const TopCoresBadge: React.FC<TopCoresBadgeProps> = ({
  cores,
  isPulsing = false,
  onOpenShop,
  className = '',
}) => {
  // Format cores compactly if extremely large (e.g. 100k+), otherwise comma-formatted
  const formattedCores =
    cores >= 1000000
      ? `${(cores / 1000000).toFixed(1)}M`
      : cores >= 100000
      ? `${(cores / 1000).toFixed(0)}k`
      : cores.toLocaleString();

  return (
    <div
      id="top-cores-badge"
      data-pulsing={isPulsing ? 'true' : 'false'}
      onClick={onOpenShop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpenShop();
        }
      }}
      title="View Cores & Open Core Shop"
      style={{
        background: isPulsing
          ? 'linear-gradient(135deg, rgba(14, 25, 58, 0.98) 0%, rgba(30, 48, 105, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(10, 16, 42, 0.92) 0%, rgba(18, 26, 64, 0.94) 100%)',
        border: isPulsing
          ? '1.8px solid #00f7ff'
          : '1.5px solid rgba(0, 247, 255, 0.42)',
        boxShadow: isPulsing
          ? '0 0 22px rgba(0, 247, 255, 0.85), inset 0 0 10px rgba(0, 247, 255, 0.4)'
          : '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 247, 255, 0.2)',
      }}
      className={`h-8 w-[80px] sm:w-[100px] px-2 md:px-2.5 rounded-full flex items-center justify-between cursor-pointer select-none transition-colors duration-200 group pointer-events-auto flex-shrink-0 ${
        isPulsing ? 'core-counter-bump-active' : 'hover:scale-105 active:scale-95'
      } ${className}`}
    >
      {/* Cores Value (centered in fixed space) */}
      <span
        className={`flex-1 text-center font-tech font-black text-sm tracking-wide transition-colors truncate px-1 ${
          isPulsing ? 'text-white' : 'text-cyan-100'
        }`}
        style={{
          textShadow: isPulsing
            ? '0 0 14px rgba(0, 247, 255, 0.95), 0 0 6px #ffffff'
            : '0 0 8px rgba(0, 247, 255, 0.5)',
        }}
      >
        {formattedCores}
      </span>

      {/* Cores Icon on the right (after the number) */}
      <div
        id="top-cores-badge-icon"
        className="relative flex items-center justify-center flex-shrink-0"
      >
        <CoreIcon
          size={17}
          glow
          variant="cyan"
          className={`transition-transform duration-300 ${
            isPulsing ? 'scale-125 rotate-12 drop-shadow-[0_0_12px_#00f7ff]' : ''
          } group-hover:rotate-12 group-hover:scale-110`}
        />
        {/* Destination absorption ripple effect when collecting cores into icon */}
        {isPulsing && (
          <span
            className="absolute -inset-1 rounded-full pointer-events-none animate-ping opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(0, 247, 255, 0.8) 0%, transparent 70%)',
            }}
          />
        )}
      </div>
    </div>
  );
};
