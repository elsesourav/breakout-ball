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
    <div className="w-full max-w-sm px-3.5 pt-3.5 pb-2 flex items-center justify-between select-none">
      {/* Category Kicker & Single-line Subtext */}
      <div className="flex flex-col max-w-[210px] overflow-hidden">
        <span
          className="font-display font-black text-xs tracking-wider text-cyan-300 leading-none mb-1 truncate"
          style={{
            color: '#00f7ff',
            textShadow: '0 0 10px rgba(0, 247, 255, 0.4)',
          }}
        >
          {title}
        </span>
        <span className="font-tech text-[9.5px] text-slate-400 font-medium tracking-widest uppercase leading-none truncate">
          {subtitle}
        </span>
      </div>

      {/* Right Slot (e.g. Cores Badge) */}
      {rightSlot && <div className="flex items-center flex-shrink-0">{rightSlot}</div>}
    </div>
  );
};
