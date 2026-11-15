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
      {/* Title & Subtext (No left icon, clean and compact font size) */}
      <div className="flex flex-col">
        <h1
          className="font-display font-black text-xs tracking-wider text-cyan-300 leading-none"
          style={{
            color: '#00f7ff',
            textShadow: '0 0 10px rgba(0, 247, 255, 0.4)',
          }}
        >
          {title}
        </h1>
        <span className="font-tech text-[9.5px] text-slate-400 tracking-widest mt-1 uppercase">
          {subtitle}
        </span>
      </div>

      {/* Right Slot (e.g. Cores Currency Badge or Status Badge) */}
      {rightSlot && <div className="flex items-center">{rightSlot}</div>}
    </div>
  );
};
