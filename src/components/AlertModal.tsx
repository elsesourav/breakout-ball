import React from 'react';
import { useGame } from '../context/GameContext';

export const AlertModal: React.FC = () => {
  const { alertConfig, hideAlert } = useGame();

  if (!alertConfig) return null;

  const {
    title,
    message,
    btn1Text = 'Cancel',
    btn2Text = 'Confirm',
    btn1Color,
    btn2Color,
    titleColor,
    singleBtn = false,
    onConfirm,
    onCancel,
  } = alertConfig;

  const handleBtn1 = () => {
    hideAlert();
    onCancel?.();
  };

  const handleBtn2 = () => {
    hideAlert();
    onConfirm?.();
  };

  return (
    <div id="floatingInputShow" className="floating-window-outer active">
      <div className="floating-window-inner">
        <h3 className="floating-title" style={{ color: titleColor || '#00ffff' }}>
          {title}
        </h3>
        <p className="floating-message">{message}</p>
        <div className="floating-buttons">
          <button
            className="floating-btn btn1"
            style={{ color: btn1Color || '#ffffff' }}
            onClick={handleBtn1}
          >
            {btn1Text}
          </button>
          {!singleBtn && (
            <button
              className="floating-btn btn2"
              style={{ color: btn2Color || '#1eff00' }}
              onClick={handleBtn2}
            >
              {btn2Text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
