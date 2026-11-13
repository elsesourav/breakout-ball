import React from 'react';
import { useGame } from '../context/GameContext';

export const ProfileView: React.FC = () => {
  const { user, settings, updateSettings, updateUser, setIsAuthModalOpen, setAuthMode } = useGame();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ volume: parseFloat(e.target.value) });
  };

  const toggleVibrate = () => {
    updateSettings({ vibrate: !settings.vibrate });
  };

  const toggleGyro = () => {
    updateSettings({ gyroscope: !settings.gyroscope });
  };

  const handleGyroSenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ gyroSensitivity: parseFloat(e.target.value) });
  };

  const handleAuthAction = () => {
    if (user.isLoggedIn) {
      updateUser({
        fullName: 'Guest Player',
        username: 'guest',
        email: '',
        isLoggedIn: false,
      });
    } else {
      setAuthMode('signin');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="map active profile">
      <div className="user">
        <div className="icon">
          <i className="sbi-user1" />
        </div>
        <div className="name">
          <p id="fullName">{user.fullName}</p>
          <p id="username">@{user.username}</p>
        </div>
      </div>

      <br />

      <div className="option">
        <i className="sbi-volume-medium" />
        <div className="seek-bar">
          <input
            id="volumeInput"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>

      <div className="option">
        <i className="sbi-vibration" />
        <p>Vibrate</p>
        <div
          className={`switch ${settings.vibrate ? 'active' : ''}`}
          id="vibrateOnOff"
          onClick={toggleVibrate}
        >
          <div className="inner">
            <div className="thumb" />
          </div>
        </div>
      </div>

      <div className="option gyro-on-off">
        <i className="sbi-screen-rotation" />
        <p>Gyroscope</p>
        <div
          className={`switch ${settings.gyroscope ? 'active' : ''}`}
          id="gyroOnOff"
          onClick={toggleGyro}
        >
          <div className="inner">
            <div className="thumb" />
          </div>
        </div>
      </div>

      <div className="option gyro-sen">
        <i className="sbi-screen-rotation" />
        <div className="seek-bar">
          <input
            id="gyroSenInput"
            type="range"
            min="0.05"
            max="0.7"
            step="0.01"
            value={settings.gyroSensitivity}
            onChange={handleGyroSenChange}
          />
        </div>
      </div>

      <div id="signOut" onClick={handleAuthAction}>
        <p>{user.isLoggedIn ? 'Sign Out' : 'Sign In / Sign Up'}</p>
      </div>

      <a
        href="https://github.com/elsesourav"
        id="copyright"
        target="_blank"
        rel="noopener noreferrer"
      >
        &copy; SouravBarui2024
      </a>
    </div>
  );
};
