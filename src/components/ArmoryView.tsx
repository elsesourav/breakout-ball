import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Zap, Flame, ShoppingBag, Gauge, Palette } from 'lucide-react';
import { currencyService } from '../services/currency';
import { UpgradeState } from '../constants/upgrades';
import { BallTab } from './armory/BallTab';
import { PowerTab } from './armory/PowerTab';
import { ShopTab } from './armory/ShopTab';
import { BallSkinSelector } from './profile/BallSkinSelector';

type ArmoryTab = 'skins' | 'ball' | 'powerups' | 'shop';

export const ArmoryView: React.FC = () => {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState<ArmoryTab>('skins');
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [upgrades, setUpgrades] = useState<UpgradeState>(() => currencyService.getUpgrades());

  // Synchronize state with currencyService on mount and username change
  useEffect(() => {
    currencyService.load(user.username).then(() => {
      setCores(currencyService.getBalance());
      setUpgrades(currencyService.getUpgrades());
    });
  }, [user.username]);

  const handleUpgrade = useCallback(
    (id: string) => {
      const success = currencyService.purchaseUpgrade(id, user.username);
      if (success) {
        setCores(currencyService.getBalance());
        setUpgrades(currencyService.getUpgrades());
      }
    },
    [user.username]
  );

  const handleCoresUpdated = useCallback(() => {
    setCores(currencyService.getBalance());
    setUpgrades(currencyService.getUpgrades());
  }, []);

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center pt-3.5 pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* 1. Armory Header & Cores Balance */}
      <div className="w-full max-w-sm px-3.5 flex flex-col gap-2.5 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_#00f7ff]">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span
                className="font-display font-black text-sm tracking-wider text-cyan-300 leading-none"
                style={{ color: '#00f7ff', textShadow: '0 0 10px rgba(0, 247, 255, 0.4)' }}
              >
                CYBER ARMORY
              </span>
              <span className="font-tech text-[10px] text-slate-400 tracking-widest mt-0.5">
                KINETIC UPGRADES & WORKSHOP
              </span>
            </div>
          </div>

          {/* Cores Currency Badge */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
              border: '1.5px solid rgba(0, 247, 255, 0.5)',
              boxShadow: '0 0 12px rgba(0, 247, 255, 0.3)',
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span className="font-tech font-bold text-xs text-cyan-200">
              {cores.toLocaleString()}
            </span>
            <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
              CORES
            </span>
          </div>
        </div>

        {/* 2. Armory Category Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090d24]/90 border border-cyan-500/25 shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab('skins')}
            style={
              activeTab === 'skins'
                ? {
                    background: 'linear-gradient(135deg, #00f7ff 0%, #0088cc 100%)',
                    color: '#000000',
                    boxShadow: '0 0 12px rgba(0, 247, 255, 0.4)',
                  }
                : { color: '#94a3b8' }
            }
            className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg font-tech font-bold text-[11px] transition-all cursor-pointer"
          >
            <Palette className="w-3 h-3" />
            <span>SKINS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ball')}
            style={
              activeTab === 'ball'
                ? {
                    background: 'linear-gradient(135deg, #00f7ff 0%, #0088cc 100%)',
                    color: '#000000',
                    boxShadow: '0 0 12px rgba(0, 247, 255, 0.4)',
                  }
                : { color: '#94a3b8' }
            }
            className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg font-tech font-bold text-[11px] transition-all cursor-pointer"
          >
            <Gauge className="w-3 h-3" />
            <span>UPGRADES</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('powerups')}
            style={
              activeTab === 'powerups'
                ? {
                    background: 'linear-gradient(135deg, #b773ff 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    boxShadow: '0 0 12px rgba(183, 115, 255, 0.4)',
                  }
                : { color: '#94a3b8' }
            }
            className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg font-tech font-bold text-[11px] transition-all cursor-pointer"
          >
            <Flame className="w-3 h-3" />
            <span>DROPS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            style={
              activeTab === 'shop'
                ? {
                    background: 'linear-gradient(135deg, #ffd700 0%, #d97706 100%)',
                    color: '#000000',
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)',
                  }
                : { color: '#94a3b8' }
            }
            className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg font-tech font-bold text-[11px] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>SHOP</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="w-full max-w-sm px-3.5 flex flex-col gap-3">
        {activeTab === 'skins' && <BallSkinSelector />}
        {activeTab === 'ball' && (
          <BallTab upgrades={upgrades} cores={cores} onUpgrade={handleUpgrade} />
        )}
        {activeTab === 'powerups' && (
          <PowerTab upgrades={upgrades} cores={cores} onUpgrade={handleUpgrade} />
        )}
        {activeTab === 'shop' && (
          <ShopTab cores={cores} username={user.username} onCoresUpdated={handleCoresUpdated} />
        )}
      </div>
    </div>
  );
};
