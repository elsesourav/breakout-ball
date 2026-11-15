import React from 'react';
import { useGame } from '../context/GameContext';
import { ActiveTab } from '../types/game';
import { SegmentedControl } from '@elsesourav/react-ui';
import { UserAvatarMenu } from './auth/UserAvatarMenu';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useGame();

  const options = [
    { value: 'local', label: 'Arcade' },
    { value: 'online', label: 'Arena' },
    { value: 'armory', label: 'Armory' },
    { value: 'profile', label: 'Profile' },
  ];

  return (
    <header className="mobile-nav-header flex items-center justify-between px-2.5 py-1.5 gap-2">
      <div className="flex-1">
        <SegmentedControl
          label="Game Navigation"
          options={options}
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ActiveTab)}
          variant="primary"
          className="w-full shadow-lg"
        />
      </div>
      <UserAvatarMenu />
    </header>
  );
};
