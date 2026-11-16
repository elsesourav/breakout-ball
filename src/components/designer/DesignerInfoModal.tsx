import React from 'react';
import { Info, X, Undo2, FlipHorizontal, Trash2, Play, Save, Check } from 'lucide-react';
import { BlockIconPreview } from './PaletteBlockCanvas';
import { isMac, isTouchDevice } from './DesignerTypes';

interface DesignerInfoModalProps {
  onClose: () => void;
}

export const DesignerInfoModal: React.FC<DesignerInfoModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-5">
      <div
        style={{
          backgroundColor: 'rgba(7, 11, 28, 0.98)',
          border: '1.5px solid rgba(0, 247, 255, 0.45)',
          boxShadow: '0 0 35px rgba(0, 247, 255, 0.25), inset 0 0 20px rgba(0, 247, 255, 0.08)',
        }}
        className="w-full max-w-lg max-h-[90vh] rounded-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#0a1030] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-[#00f7ff] tracking-wider">
                STUDIO GUIDE
              </h3>
              <p className="font-tech text-[10px] text-cyan-300/70">
                BLOCKS & EDITOR MANUAL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs font-sans">
          {/* SECTION 1: BLOCKS GUIDE */}
          <div>
            <h4 className="font-display font-black text-xs text-cyan-300 tracking-wider uppercase mb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
              Blocks Guide
            </h4>
            <div className="space-y-2.5">
              {/* Standard Blocks HP 1-5 */}
              <div className="p-3 rounded-xl bg-[#0b1232] border border-cyan-500/25 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5].map((hp) => (
                    <BlockIconPreview key={hp} toolId={hp} width={42} height={22} />
                  ))}
                  <span className="font-display font-black text-xs text-cyan-300 ml-1">
                    Standard Blocks (1 to 5 Hits)
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Break when hit by the ball. The number shows how many hits are needed to destroy the block (1 to 5). Breaking blocks awards points and can drop power-up items.
                </p>
              </div>

              {/* Titanium Block */}
              <div className="p-3 rounded-xl bg-[#0b1232] border border-slate-500/25 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <BlockIconPreview toolId={6} width={50} height={24} />
                  <span className="font-display font-black text-xs text-slate-200">
                    Titanium Block (Unbreakable)
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Indestructible metal block. Balls always bounce off it at full speed. Use this to create walls, deflection funnels, and bounce corridors.
                </p>
              </div>

              {/* Portal Gate */}
              <div className="p-3 rounded-xl bg-[#0b1232] border border-cyan-500/35 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <BlockIconPreview toolId={7} pairId={1} width={50} height={24} />
                  <span className="font-display font-black text-xs text-[#00f7ff]">
                    Portal Gate (Linked Color Pairs)
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Teleports balls between color-matched gates (Cyan, Magenta, Amber, Emerald). When a ball penetrates at least 50% into a portal, it instantly emerges from its partner preserving velocity and angle!
                </p>
                <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/35 text-[11px] text-cyan-200 flex items-center gap-1.5 mt-0.5">
                  <strong className="text-cyan-400 shrink-0">💡 Drag & Move:</strong>
                  <span>Touch and drag any placed portal to reposition entrance and exit anywhere on the grid!</span>
                </div>
              </div>

              {/* Blast Detonator */}
              <div className="p-3 rounded-xl bg-[#0b1232] border border-amber-500/35 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <BlockIconPreview toolId={8} width={50} height={24} />
                  <span className="font-display font-black text-xs text-amber-300">
                    Blast Detonator (Explosive Bomb)
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Explodes immediately on impact! Releases a shockwave dealing 2 damage to all nearby blocks in a radius. If another detonator is nearby, it triggers a chain explosion!
                </p>
              </div>

              {/* Eraser */}
              <div className="p-3 rounded-xl bg-[#0b1232] border border-rose-500/25 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <BlockIconPreview toolId={0} width={50} height={24} />
                  <span className="font-display font-black text-xs text-rose-400">
                    Eraser (Remove Blocks)
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Tap or drag across blocks to erase them from the matrix. Erasing either portal in a pair automatically removes its partner too.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: STUDIO TOOLS */}
          <div>
            <h4 className="font-display font-black text-xs text-cyan-300 tracking-wider uppercase mb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
              Editor Tools
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo & Redo</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  {isTouchDevice ? (
                    'Step backward or forward through your edits.'
                  ) : isMac ? (
                    <>
                      Step backward or forward through your edits. (Shortcuts:{' '}
                      <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                        ⌘Z
                      </kbd>{' '}
                      /{' '}
                      <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                        ⌘⇧Z
                      </kbd>{' '}
                      or{' '}
                      <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                        ⌘Y
                      </kbd>
                      )
                    </>
                  ) : (
                    <>
                      Step backward or forward through your edits. (Shortcuts:{' '}
                      <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                        Ctrl+Z
                      </kbd>{' '}
                      /{' '}
                      <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                        Ctrl+Y
                      </kbd>
                      )
                    </>
                  )}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Horizontal Mirror</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Copies the left half of the grid over to the right half for instant symmetry.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Grid</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Erases all placed blocks so you can start a fresh design from scratch.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  <span>Test Level</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Play your level immediately with real paddle physics, ball speeds, and power-ups.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-[#00f7ff] font-bold">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Arena</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Name your custom level and choose <strong>Private</strong> (only in your blueprints) or <strong>Public</strong> (shared with the community in Online Arena).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-[#0a1030] border-t border-cyan-500/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-display font-black text-xs bg-cyan-400 hover:bg-cyan-300 text-black cursor-pointer shadow-[0_0_12px_rgba(0,247,255,0.4)] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>GOT IT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
