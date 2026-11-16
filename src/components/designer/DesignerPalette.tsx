import React from 'react';
import { STANDARD_TOOLS, SPECIAL_TOOLS } from './DesignerTypes';
import { PaletteBlockCanvas } from './PaletteBlockCanvas';

interface DesignerPaletteProps {
  selectedTool: number;
  hasPendingPortal: boolean;
  onSelectTool: (toolId: number) => void;
}

export const DesignerPalette: React.FC<DesignerPaletteProps> = ({
  selectedTool,
  hasPendingPortal,
  onSelectTool,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {/* ── ROW 1: STANDARD CORES (HP 1 - 5) ── */}
      <div className="grid grid-cols-5 gap-1">
        {STANDARD_TOOLS.map((hp) => {
          const isSelected = selectedTool === hp;
          return (
            <button
              key={hp}
              type="button"
              data-tool-id={hp}
              onClick={() => onSelectTool(hp)}
              style={{
                backgroundColor: isSelected ? 'rgba(0, 247, 255, 0.18)' : 'rgba(8, 13, 36, 0.9)',
                border: isSelected ? '2px solid #00f7ff' : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isSelected
                  ? '0 0 12px rgba(0, 247, 255, 0.5), inset 0 0 4px rgba(0, 247, 255, 0.25)'
                  : 'none',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
              }}
              className="flex flex-col items-center justify-center rounded-lg p-0.5 transition-all cursor-pointer h-10 relative"
            >
              <div className="w-full h-5 relative flex items-center justify-center">
                <PaletteBlockCanvas toolId={hp} isSelected={isSelected} />
              </div>
              <span
                style={{ color: isSelected ? '#00f7ff' : '#94a3b8' }}
                className="font-tech text-[8px] font-black uppercase tracking-wider"
              >
                {hp}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ROW 2: TACTICAL MATRIX (Titanium, Portal, Detonator, Eraser) ── */}
      <div className="grid grid-cols-4 gap-1">
        {SPECIAL_TOOLS.map((tool) => {
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              data-tool-id={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={tool.label}
              style={{
                backgroundColor: isSelected ? 'rgba(0, 247, 255, 0.18)' : 'rgba(8, 13, 36, 0.9)',
                border: isSelected ? `2px solid ${tool.color}` : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isSelected
                  ? `0 0 12px ${tool.color}70, inset 0 0 4px ${tool.color}30`
                  : 'none',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
              }}
              className="flex flex-col items-center justify-center rounded-lg p-0.5 transition-all cursor-pointer h-10 relative"
            >
              <div className="w-full h-5 relative flex items-center justify-center">
                <PaletteBlockCanvas toolId={tool.id} isSelected={isSelected} />
              </div>
              <span
                style={{ color: isSelected ? tool.color : '#94a3b8' }}
                className="font-tech text-[8px] font-black uppercase tracking-wider truncate w-full text-center"
              >
                {tool.shortLabel}
              </span>
              {tool.id === 7 && hasPendingPortal && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
