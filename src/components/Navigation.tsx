import React from 'react';
import { useGame } from '../context/GameContext';
import { ActiveTab } from '../types/game';
import { SegmentedControl } from '@elsesourav/react-ui';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useGame();

  const options = [
    { value: 'local', label: 'Local' },
    { value: 'online', label: 'Online' },
    { value: 'create', label: 'Create' },
    { value: 'profile', label: 'Profile' },
  ];

  return (
    <header className="mobile-nav-header">
      <div className="w-full px-2 py-1.5">
        <SegmentedControl
          label="Game Navigation"
          options={options}
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ActiveTab)}
          variant="primary"
          className="w-full shadow-lg"
        />
      </div>
    </header>
  );
};
