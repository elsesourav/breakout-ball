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
    <div className="w-full max-w-sm px-3.5 pt-4 pb-2 flex items-center justify-between select-none">
      {/* Kicker Tag (smaller text) & Main Subtext (increased text size) */}
      <div className="flex flex-col">
        <span
          className="font-tech text-[10px] font-bold tracking-widest text-cyan-400 uppercase leading-none mb-1"
          style={{ textShadow: '0 0 8px rgba(0, 247, 255, 0.4)' }}
        >
          {title}
        </span>
        <h2 className="font-display font-black text-xs tracking-wider text-slate-100 uppercase leading-tight">
          {subtitle}
        </h2>
      </div>

      {/* Right Slot (e.g. Cores Badge) */}
      {rightSlot && <div className="flex items-center">{rightSlot}</div>}
    </div>
  );
};
