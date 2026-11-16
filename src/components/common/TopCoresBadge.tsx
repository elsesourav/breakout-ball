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
  // Format cores compactly (e.g. 1.25k if >= 10000, else toLocaleString)
  const formattedCores =
    cores >= 10000
      ? `${(cores / 1000).toFixed(1)}k`
      : cores.toLocaleString();

  return (
    <div
      id="top-cores-badge"
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
          ? 'linear-gradient(135deg, rgba(14, 25, 58, 0.95) 0%, rgba(30, 41, 89, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(10, 16, 42, 0.92) 0%, rgba(18, 26, 64, 0.94) 100%)',
        border: isPulsing
          ? '1.5px solid #00f7ff'
          : '1.5px solid rgba(0, 247, 255, 0.42)',
        boxShadow: isPulsing
          ? '0 0 16px rgba(0, 247, 255, 0.6), inset 0 0 8px rgba(0, 247, 255, 0.25)'
          : '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 247, 255, 0.2)',
      }}
      className={`h-9 pl-1 pr-1.5 py-0.5 rounded-full flex items-center gap-1.5 cursor-pointer select-none transition-all duration-200 hover:scale-105 active:scale-95 group pointer-events-auto ${className}`}
    >
      {/* Plus button before the number */}
      <span
        className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 flex items-center justify-center font-bold text-xs shadow-[0_0_8px_rgba(0,247,255,0.4)] group-hover:bg-cyan-400 group-hover:text-black transition-all flex-shrink-0"
        title="Add Cores / Open Shop"
      >
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
      </span>

      {/* Cores Value */}
      <span
        className={`font-tech font-black text-sm tracking-wide transition-colors ${
          isPulsing ? 'text-white' : 'text-cyan-100'
        }`}
        style={{
          textShadow: '0 0 8px rgba(0, 247, 255, 0.5)',
        }}
      >
        {formattedCores}
      </span>

      {/* Cores Icon on the right */}
      <div className="flex items-center justify-center pl-0.5 flex-shrink-0">
        <CoreIcon
          size={18}
          glow
          variant="cyan"
          className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
        />
      </div>
    </div>
  );
};
