import React from 'react';
import { BallSkinSelector } from '../profile/BallSkinSelector';

export const SkinsTab: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <BallSkinSelector />
    </div>
  );
};
