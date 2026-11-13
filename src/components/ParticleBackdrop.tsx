import React from 'react';
import { EngineCanvas } from '../../packages/graphics-engine/src/EngineCanvas';
import { useGame } from '../context/GameContext';

export const ParticleBackdrop: React.FC = () => {
  const { settings } = useGame();

  if (settings.wasmParticles === false) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
      style={{ opacity: 0.38 }}
    >
      <EngineCanvas
        maxParticles={12000}
        interactive={false}
        className="w-full h-full"
      />
    </div>
  );
};
