import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
} from '../constants/game';
import { soundManager } from '../utils/audio';
import { GameHUD } from './GameHUD';
import { ParticleBackdrop } from './ParticleBackdrop';
import { GameEngine } from '../engine/GameEngine';
import { ScoreState } from '../engine/types';

export const GameCanvas: React.FC = () => {
  const {
    selectedLevel,
    localLevels,
    setScreen,
    settings,
    recordLevelCompletion,
    startPlayLevel,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Reactive UI state
  const [lives, setLives] = useState<number>(3);
  const [timeUsed, setTimeUsed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [countdownText, setCountdownText] = useState<string | null>('3');
  const [summaryState, setSummaryState] = useState<ScoreState | null>(null);
  const [liveScoreState, setLiveScoreState] = useState<ScoreState | null>(null);
  const [attemptId, setAttemptId] = useState<number>(0);

  // Key tracking
  const keysPressed = useRef<{ ArrowLeft: boolean; ArrowRight: boolean; KeyA: boolean; KeyD: boolean }>({
    ArrowLeft: false,
    ArrowRight: false,
    KeyA: false,
    KeyD: false,
  });

  // Check if there is a next level in campaign
  const currentLevelIndex = selectedLevel
    ? localLevels.findIndex((l) => l.id === selectedLevel.id)
    : -1;
  const hasNextLevel =
    currentLevelIndex >= 0 && currentLevelIndex < localLevels.length - 1;
  const levelNumber = currentLevelIndex >= 0 ? currentLevelIndex + 1 : 1;

  // Handle Level Victory
  const handleLevelWin = useCallback(
    async (finalScore: ScoreState) => {
      if (!selectedLevel) return;

      // Confetti burst
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.55 },
      });

      setSummaryState(finalScore);

      try {
        await recordLevelCompletion(selectedLevel.id, finalScore.timeUsed);
      } catch (err) {
        console.error('Error saving score:', err);
      }
    },
    [selectedLevel, recordLevelCompletion]
  );

  // Handle Game Over
  const handleGameOver = useCallback((finalScore: ScoreState) => {
    setSummaryState(finalScore);
  }, []);

  const handleLevelWinRef = useRef(handleLevelWin);
  handleLevelWinRef.current = handleLevelWin;

  const handleGameOverRef = useRef(handleGameOver);
  handleGameOverRef.current = handleGameOver;

  // Sync runtime settings without tearing down the game
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setVibrate(settings.vibrate);
      engineRef.current.setBallSkin(settings.ballSkin);
    }
  }, [settings.vibrate, settings.ballSkin]);

  // Initialize Engine & Level (strictly bound to selectedLevel.id and attemptId)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLevel) return;

    let isDisposed = false;

    // Reset UI state
    setLives(3);
    setTimeUsed(0);
    setScore(0);
    setCombo(0);
    setCountdownText('3');
    setSummaryState(null);
    setLiveScoreState(null);

    const engine = new GameEngine(canvas, {
      onScoreUpdate: (st) => {
        if (isDisposed) return;
        setLiveScoreState(st);
        setScore(st.score);
        setTimeUsed(st.timeUsed);
      },
      onLivesChange: (l) => {
        if (isDisposed) return;
        setLives(l);
      },
      onComboChange: (c) => {
        if (isDisposed) return;
        setCombo(c);
      },
      onLevelWin: (st) => {
        if (isDisposed) return;
        handleLevelWinRef.current?.(st);
      },
      onGameOver: (st) => {
        if (isDisposed) return;
        handleGameOverRef.current?.(st);
      },
    });

    engine.setVibrate(settings.vibrate);
    engine.setBallSkin(settings.ballSkin);
    engineRef.current = engine;

    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    let t3: ReturnType<typeof setTimeout> | undefined;
    let t4: ReturnType<typeof setTimeout> | undefined;

    // Initialize WASM and start loop, then initiate countdown
    engine.initialize().then(() => {
      if (isDisposed) return;
      engine.startLevel(selectedLevel);
      engine.startLoop();

      // Countdown sequence: 3 -> 2 -> 1 -> GO! with distinct cyber audio
      setCountdownText('3');
      soundManager.playCountdownTick(3);

      t1 = setTimeout(() => {
        if (isDisposed) return;
        setCountdownText('2');
        soundManager.playCountdownTick(2);
      }, 800);

      t2 = setTimeout(() => {
        if (isDisposed) return;
        setCountdownText('1');
        soundManager.playCountdownTick(1);
      }, 1600);

      t3 = setTimeout(() => {
        if (isDisposed) return;
        setCountdownText('GO!');
        soundManager.playCountdownGo();
        engine.launchBall();

        t4 = setTimeout(() => {
          if (!isDisposed) setCountdownText(null);
        }, 800);
      }, 2400);
    });

    return () => {
      isDisposed = true;
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
      if (t4) clearTimeout(t4);
      engine.destroy();
      engineRef.current = null;
      soundManager.stopBgMusic();
    };
  }, [selectedLevel?.id, attemptId]);

  // Keyboard navigation loop
  useEffect(() => {
    let keyFrameId: number;

    const handleKeyLoop = () => {
      const engine = engineRef.current;
      if (engine) {
        const keySpeed = 22;
        if (keysPressed.current.ArrowLeft || keysPressed.current.KeyA) {
          engine.movePaddleRelative(-keySpeed);
        }
        if (keysPressed.current.ArrowRight || keysPressed.current.KeyD) {
          engine.movePaddleRelative(keySpeed);
        }
      }
      keyFrameId = requestAnimationFrame(handleKeyLoop);
    };

    keyFrameId = requestAnimationFrame(handleKeyLoop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') keysPressed.current.ArrowLeft = true;
      if (e.code === 'ArrowRight') keysPressed.current.ArrowRight = true;
      if (e.code === 'KeyA') keysPressed.current.KeyA = true;
      if (e.code === 'KeyD') keysPressed.current.KeyD = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') keysPressed.current.ArrowLeft = false;
      if (e.code === 'ArrowRight') keysPressed.current.ArrowRight = false;
      if (e.code === 'KeyA') keysPressed.current.KeyA = false;
      if (e.code === 'KeyD') keysPressed.current.KeyD = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(keyFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gyroscope tilt control
  useEffect(() => {
    if (!settings.gyroscope || typeof window === 'undefined') return;

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || !engineRef.current) return;
      const range = 45 * (1 - settings.gyroSensitivity);
      const normalized = Math.max(-range, Math.min(range, e.gamma)) / range;
      const target = CANVAS_WIDTH / 2 + normalized * (CANVAS_WIDTH / 2);
      engineRef.current.setPaddleTarget(
        Math.max(PADDLE_WIDTH / 2, Math.min(CANVAS_WIDTH - PADDLE_WIDTH / 2, target))
      );
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation);
    return () => window.removeEventListener('deviceorientation', handleDeviceOrientation);
  }, [settings.gyroscope, settings.gyroSensitivity]);

  // Touch and mouse control handlers
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const scaleX = CANVAS_WIDTH / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;

    engineRef.current.setPaddleTarget(
      Math.max(PADDLE_WIDTH / 2, Math.min(CANVAS_WIDTH - PADDLE_WIDTH / 2, canvasX))
    );
  };

  // Replay Current Level
  const handleRetry = () => {
    if (!selectedLevel) return;
    soundManager.playClick();
    setSummaryState(null);
    setAttemptId((prev) => prev + 1);
  };

  // Advance to Next Mission
  const handleNextLevel = () => {
    if (hasNextLevel && localLevels[currentLevelIndex + 1]) {
      setSummaryState(null);
      startPlayLevel(localLevels[currentLevelIndex + 1]);
    } else {
      setScreen('menu');
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none"
      style={{ width: '100%', height: '100%' }}
    >
      <ParticleBackdrop />
      <GameHUD
        lives={lives}
        timeUsed={timeUsed}
        countdown={countdownText}
        score={score}
        combo={combo}
        onExit={() => {
          soundManager.stopBgMusic();
          setScreen('menu');
        }}
        summaryState={summaryState}
        onRetry={handleRetry}
        onNextLevel={handleNextLevel}
        hasNextLevel={hasNextLevel}
        levelNumber={levelNumber}
        totalBreakable={liveScoreState?.totalBreakable ?? 0}
        blocksDestroyed={liveScoreState?.blocksDestroyed ?? 0}
      />
      <canvas
        ref={canvasRef}
        id="mainCanvas"
        className="w-full h-full object-contain active cursor-crosshair touch-none"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      />
    </div>
  );
};
