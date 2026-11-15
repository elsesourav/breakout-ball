import React from 'react';

interface CyberSectionHeaderProps {
  title: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
}

export const CyberSectionHeader: React.FC<CyberSectionHeaderProps> = ({
  title,
  subtitle,
  rightSlot,
}) => {
  return (
    <div className="w-full max-w-sm px-3.5 pt-6 pb-2.5 sm:pt-7 sm:pb-3 flex items-center justify-between select-none">
      {/* Category Kicker & Single-line Subtext */}
      <div className="flex-1 min-w-0 pr-2 flex flex-col overflow-hidden">
        <span
          className="font-display font-black text-[13px] tracking-wider text-cyan-300 leading-tight mb-0.5 truncate"
          style={{
            color: '#00f7ff',
            textShadow: '0 0 10px rgba(0, 247, 255, 0.45)',
          }}
        >
          {title}
        </span>
        <span className="font-tech text-[8.5px] text-slate-400 font-semibold tracking-[0.16em] uppercase leading-none truncate">
          {subtitle}
        </span>
      </div>

      {/* Right Slot (e.g. Cores Badge) */}
      {rightSlot && <div className="flex items-center flex-shrink-0">{rightSlot}</div>}
    </div>
  );
};
