import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH } from '../constants/game';
import { soundManager } from '../utils/audio';
import { currencyService } from '../services/currency';
import { GameHUD } from './GameHUD';
import { ParticleBackdrop } from './ParticleBackdrop';
import { GameEngine } from '../engine/GameEngine';
import { ScoreState } from '../engine/types';
import type { ActiveBuffInfo } from '../engine/powerUps';
import { isTodayDailyMission, isDailyMissionCompleted } from '../services/dailyApex';
import { cyberToast } from './common/CyberToast';

interface CanvasDisplaySize {
  width: number;
  height: number;
  topPadding: number;
  bottomPadding: number;
}

function computeGameCanvasSize(containerW: number, containerH: number): CanvasDisplaySize {
  const GAME_ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;
  const topPadding = Math.max(54, Math.min(68, Math.round(containerH * 0.075)));
  const bottomPadding = Math.max(18, Math.min(28, Math.round(containerH * 0.035)));
  const horizontalMargin = containerW < 360 ? 6 : 14;
  const boundH = Math.min(Math.max(160, containerH - topPadding - bottomPadding), 600);
  const boundW = Math.min(Math.max(120, containerW - horizontalMargin * 2), Math.round(600 * GAME_ASPECT));
  let width = boundW;
  let height = Math.round(width / GAME_ASPECT);
  if (height > boundH) {
    height = boundH;
    width = Math.round(height * GAME_ASPECT);
  }
  return { width: Math.round(width / 2) * 2, height: Math.round(height / 2) * 2, topPadding, bottomPadding };
}

export const GameCanvas: React.FC = () => {
  const {
    selectedLevel,
    localLevels,
    onlineLevels,
    setScreen,
    setActiveTab,
    settings,
    recordLevelCompletion,
    startPlayLevel,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [displaySize, setDisplaySize] = useState<CanvasDisplaySize>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 360;
    const h = typeof window !== 'undefined' ? window.innerHeight : 640;
    return computeGameCanvasSize(w, h);
  });

  useEffect(() => {
    const updateSize = () => {
      const el = containerRef.current;
      const w = el ? el.clientWidth : window.innerWidth;
      const h = el ? el.clientHeight : window.innerHeight;
      setDisplaySize(computeGameCanvasSize(w, h));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  // Reactive UI state
  const [lives, setLives] = useState<number>(3);
  const [timeUsed, setTimeUsed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [countdownText, setCountdownText] = useState<string | null>('3');
  const [summaryState, setSummaryState] = useState<ScoreState | null>(null);
  const [liveScoreState, setLiveScoreState] = useState<ScoreState | null>(null);
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuffInfo[]>([]);
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

  const [coresEarned, setCoresEarned] = useState<number>(0);
  const [isFirstClear, setIsFirstClear] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number>(3);
  const [previousStars, setPreviousStars] = useState<number>(0);
  const [totalClaimedForLevel, setTotalClaimedForLevel] = useState<number>(0);
  const [maxCoresForLevel, setMaxCoresForLevel] = useState<number>(0);
  const [remainingCoresForLevel, setRemainingCoresForLevel] = useState<number>(0);

  // Win presentation timers to gracefully reveal summary window over 2-3 seconds
  const winTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearWinTimers = useCallback(() => {
    if (winTimeoutRef.current) {
      clearTimeout(winTimeoutRef.current);
      winTimeoutRef.current = null;
    }
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
  }, []);

  // Handle Level Victory
  const handleLevelWin = useCallback(
    async (finalScore: ScoreState) => {
      if (!selectedLevel) return;

      const isMobile =
        typeof window !== 'undefined' &&
        (window.innerWidth <= 768 || 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0);

      // Lightweight, localized celebratory blast with reduced spread for mobile & low-end devices
      confetti({
        particleCount: isMobile ? 22 : 38,
        spread: isMobile ? 32 : 46,
        origin: { y: 0.55 },
        ticks: isMobile ? 120 : 180,
        scalar: isMobile ? 0.8 : 0.95,
      });

      // Subtle second accent burst only on desktop devices
      if (!isMobile) {
        if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
        confettiTimeoutRef.current = setTimeout(() => {
          confetti({
            particleCount: 22,
            spread: 38,
            origin: { y: 0.45 },
            ticks: 130,
            scalar: 0.9,
          });
        }, 650);
      }

      try {
        const result = await recordLevelCompletion(
          selectedLevel.id,
          finalScore.timeUsed,
          finalScore.lives
        );
        setCoresEarned(result?.coresEarned ?? 0);
        setIsFirstClear(result?.isFirstClear ?? false);
        setStarsEarned(result?.starsEarned ?? Math.min(3, Math.max(1, finalScore.lives)));
        setPreviousStars(result?.previousStars ?? 0);
        setTotalClaimedForLevel(result?.totalClaimedForLevel ?? 0);
        setMaxCoresForLevel(result?.maxCoresForLevel ?? 0);
        setRemainingCoresForLevel(result?.remainingCoresForLevel ?? 0);
      } catch (err) {
        console.error('Error saving score:', err);
      }

      // Delay showing the winning window by ~1.9s so the player can celebrate on canvas first
      if (winTimeoutRef.current) clearTimeout(winTimeoutRef.current);
      winTimeoutRef.current = setTimeout(() => {
        setSummaryState(finalScore);
      }, 1900);
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

    // Guard: Prevent playing today's Daily Apex Mission if already claimed
    if (isTodayDailyMission(selectedLevel.id, onlineLevels) && isDailyMissionCompleted()) {
      soundManager.playLockTap();
      cyberToast.info('Daily Apex Mission already completed for today!');
      setScreen('menu');
      setActiveTab('online');
      return;
    }

    let isDisposed = false;

    // Reset UI state
    setLives(3);
    setTimeUsed(0);
    setScore(0);
    setCombo(0);
    setCountdownText('3');
    setSummaryState(null);
    setLiveScoreState(null);
    setActiveBuffs([]);

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
      onBuffsChange: (b) => {
        if (isDisposed) return;
        setActiveBuffs(b);
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
      clearWinTimers();
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
    clearWinTimers();
    soundManager.playClick();
    setSummaryState(null);
    setAttemptId((prev) => prev + 1);
  };

  const isDaily = selectedLevel ? isTodayDailyMission(selectedLevel.id, onlineLevels) : false;

  const isArcade = Boolean(
    selectedLevel && localLevels.some((l) => l.id === selectedLevel.id)
  );
  const gameMode: 'arcade' | 'arena' = isArcade ? 'arcade' : 'arena';

  const handleExit = () => {
    clearWinTimers();
    soundManager.stopBgMusic();
    if (isArcade) {
      setActiveTab('local');
    } else {
      setActiveTab('online');
    }
    setScreen('menu');
  };

  // Advance to Next Mission
  const handleNextLevel = () => {
    clearWinTimers();
    if (hasNextLevel && localLevels[currentLevelIndex + 1]) {
      setSummaryState(null);
      startPlayLevel(localLevels[currentLevelIndex + 1]);
    } else {
      handleExit();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-between bg-[#03040c] overflow-hidden select-none"
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `
          radial-gradient(ellipse 95% 20% at 50% 0%,   rgba(255,215,0,0.12)   0%, transparent 75%),
          radial-gradient(ellipse 90% 20% at 50% 30%,  rgba(244,63,94,0.10)   0%, transparent 75%),
          radial-gradient(ellipse 90% 20% at 50% 65%,  rgba(183,115,255,0.10) 0%, transparent 75%),
          radial-gradient(ellipse 95% 25% at 50% 100%, rgba(0,247,255,0.14)   0%, transparent 75%)
        `,
      }}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
      <GameHUD
        lives={lives}
        timeUsed={timeUsed}
        countdown={countdownText}
        score={score}
        combo={combo}
        activeBuffs={activeBuffs}
        onExit={handleExit}
        onPause={() => engineRef.current?.pause()}
        onResume={() => engineRef.current?.resume()}
        summaryState={summaryState}
        onRetry={isDaily && summaryState?.status === 'win' ? undefined : handleRetry}
        onNextLevel={handleNextLevel}
        hasNextLevel={hasNextLevel}
        levelNumber={levelNumber}
        totalBreakable={liveScoreState?.totalBreakable ?? 0}
        blocksDestroyed={liveScoreState?.blocksDestroyed ?? 0}
        coresEarned={coresEarned}
        isFirstClear={isFirstClear}
        starsEarned={starsEarned}
        previousStars={previousStars}
        totalClaimedForLevel={totalClaimedForLevel}
        maxCoresForLevel={maxCoresForLevel}
        remainingCoresForLevel={remainingCoresForLevel}
        totalCores={currencyService.getBalance()}
        isDailyMission={isDaily}
        gameMode={gameMode}
      />
      <div
        className="relative flex-1 w-full flex flex-col items-center justify-center pointer-events-auto"
        style={{ paddingTop: `${displaySize.topPadding}px`, paddingBottom: `${displaySize.bottomPadding}px` }}
      >
        <canvas
          ref={canvasRef}
          id="mainCanvas"
          className="block active cursor-crosshair touch-none rounded-xl border border-cyan-500/20"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: `${displaySize.width}px`, height: `${displaySize.height}px` }}
          onMouseDown={handlePointerMove}
          onMouseMove={handlePointerMove}
          onTouchStart={handlePointerMove}
          onTouchMove={handlePointerMove}
        />
      </div>
    </div>
  );
};
