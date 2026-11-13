import React from 'react';

interface GameHUDProps {
  lives: number;
  timeUsed: number;
  countdown: string | null; // "3", "2", "1", "Level Win!", "Game Over!"
  onExit: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ lives, timeUsed, countdown, onExit }) => {
  return (
    <>
      {/* Top Bar with Exit Button */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 20,
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={onExit}
          style={{
            background: 'rgba(10, 11, 20, 0.75)',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          }}
          title="Exit to Menu"
        >
          <i className="sbi-home" />
        </button>
      </div>

      {/* Floating Center Countdown / Outcome Overlay */}
      {countdown && (
        <div
          id="showCountDowns"
          className={
            countdown === 'Level Win!'
              ? 'gameWin'
              : countdown === 'Game Over!'
              ? 'gameOver'
              : countdown === '1'
              ? 's1'
              : countdown === '2'
              ? 's2'
              : countdown === '3'
              ? 's3'
              : ''
          }
        >
          <span>
            <p key={countdown}>{countdown}</p>
          </span>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div id="showGameStatus" className="active">
        {/* Lives Display: 3 Hearts */}
        <div id="showHealths" className={`s${lives}`}>
          <i className="sbi-heart" />
          <i className="sbi-heart" />
          <i className="sbi-heart" />
        </div>

        {/* Empty middle spacer since countdown is centered floating overlay */}
        <div />

        {/* Stopwatch Timer */}
        <div id="showTime" className="active">
          <p id="showTimeUsed">{timeUsed.toFixed(1)}</p>
          <span>s</span>
        </div>
      </div>
    </>
  );
};
