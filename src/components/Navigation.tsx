import React from 'react';
import { useGame } from '../context/GameContext';
import { ActiveTab } from '../types/game';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useGame();

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'local', label: 'Local' },
    { key: 'online', label: 'Online' },
    { key: 'create', label: 'Create' },
    { key: 'profile', label: 'Profile' },
  ];

  const getMoveLeft = () => {
    switch (activeTab) {
      case 'local':
        return '0%';
      case 'online':
        return '25%';
      case 'create':
        return '50%';
      case 'profile':
        return '75%';
      default:
        return '0%';
    }
  };

  return (
    <header id="selectMode">
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className={`mode ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.key)}
        >
          <p>{tab.label}</p>
        </div>
      ))}
      <div
        className="move"
        style={{
          left: getMoveLeft(),
          background: activeTab === 'profile' ? '#07002680' : 'transparent',
        }}
      />
    </header>
  );
};
