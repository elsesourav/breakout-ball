import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { BlockData } from '../types/game';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_ROWS,
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y,
  BALL_RADIUS,
  BALL_SPEED,
  BLOCK_COLORS,
} from '../constants/game';
import { soundManager } from '../utils/audio';
import { GameHUD } from './GameHUD';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
}

export const GameCanvas: React.FC = () => {
  const {
    selectedLevel,
    setScreen,
    settings,
    recordLevelCompletion,
    openPreview,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state
  const [lives, setLives] = useState<number>(3);
  const [timeUsed, setTimeUsed] = useState<number>(0);
  const [countdownText, setCountdownText] = useState<string | null>('3');

  // Mutable game loop references
  const gameStateRef = useRef({
    isPlaying: false,
    isCountingDown: true,
    lives: 3,
    startTime: 0,
    elapsedTime: 0,
    paddleX: CANVAS_WIDTH / 2,
    targetPaddleX: CANVAS_WIDTH / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: PADDLE_Y - BALL_RADIUS - 5,
    ballVx: 0,
    ballVy: 0,
    blocks: [] as BlockData[],
    particles: [] as Particle[],
    stars: [] as Star[],
    keysPressed: { ArrowLeft: false, ArrowRight: false, KeyA: false, KeyD: false },
  });

  // Initialize Stars
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
      });
    }
    gameStateRef.current.stars = stars;
  }, []);

  // Initialize Level & Countdown
  useEffect(() => {
    if (!selectedLevel) return;

    // Deep copy blocks
    gameStateRef.current.blocks = selectedLevel.blocks.map((b) => ({
      ...b,
      currentHp: b.h,
    }));
    gameStateRef.current.lives = 3;
    gameStateRef.current.paddleX = CANVAS_WIDTH / 2;
    gameStateRef.current.targetPaddleX = CANVAS_WIDTH / 2;
    gameStateRef.current.ballX = CANVAS_WIDTH / 2;
    gameStateRef.current.ballY = PADDLE_Y - BALL_RADIUS - 5;
    gameStateRef.current.ballVx = 0;
    gameStateRef.current.ballVy = 0;
    gameStateRef.current.isPlaying = false;
    gameStateRef.current.isCountingDown = true;
    gameStateRef.current.particles = [];

    setLives(3);
    setTimeUsed(0);
    setCountdownText('3');

    // Countdown sequence: 3 -> 2 -> 1 -> Play
    const t1 = setTimeout(() => {
      setCountdownText('2');
      soundManager.playClick();
    }, 800);

    const t2 = setTimeout(() => {
      setCountdownText('1');
      soundManager.playClick();
    }, 1600);

    const t3 = setTimeout(() => {
      setCountdownText(null);
      gameStateRef.current.isCountingDown = false;
      gameStateRef.current.isPlaying = true;
      gameStateRef.current.startTime = performance.now();

      // Launch ball upwards with slight random horizontal angle
      const angle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1) + (Math.random() * 0.2 - 0.1);
      gameStateRef.current.ballVx = Math.sin(angle) * BALL_SPEED;
      gameStateRef.current.ballVy = -Math.cos(angle) * BALL_SPEED;
      soundManager.playSideHit();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      soundManager.stopBgMusic();
    };
  }, [selectedLevel]);

  // Handle Win
  const handleLevelWin = useCallback(
    (finalTime: number) => {
      if (!selectedLevel) return;
      gameStateRef.current.isPlaying = false;
      setCountdownText('Level Win!');
      soundManager.playWin();

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      const result = recordLevelCompletion(selectedLevel.id, finalTime);

      setTimeout(() => {
        setCountdownText(null);
        openPreview(selectedLevel);
      }, 2500);
    },
    [selectedLevel, recordLevelCompletion, openPreview]
  );

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    gameStateRef.current.isPlaying = false;
    setCountdownText('Game Over!');
    soundManager.playGameOver();

    setTimeout(() => {
      setCountdownText(null);
      if (selectedLevel) {
        openPreview(selectedLevel);
      } else {
        setScreen('menu');
      }
    }, 2500);
  }, [selectedLevel, openPreview, setScreen]);

  // Reset ball on life lost
  const handleLifeLost = useCallback(() => {
    gameStateRef.current.lives -= 1;
    const remainingLives = gameStateRef.current.lives;
    setLives(remainingLives);
    soundManager.playDamage();

    if (remainingLives <= 0) {
      handleGameOver();
      return;
    }

    // Reset ball position
    gameStateRef.current.ballX = gameStateRef.current.paddleX;
    gameStateRef.current.ballY = PADDLE_Y - BALL_RADIUS - 8;
    gameStateRef.current.ballVx = 0;
    gameStateRef.current.ballVy = 0;

    // Small delay then relaunch
    setTimeout(() => {
      if (gameStateRef.current.isPlaying) {
        const angle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
        gameStateRef.current.ballVx = Math.sin(angle) * BALL_SPEED;
        gameStateRef.current.ballVy = -Math.cos(angle) * BALL_SPEED;
      }
    }, 600);
  }, [handleGameOver]);

  // Spawns block explosion particles
  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color,
        alpha: 1.0,
        life: 1.0,
      });
    }
  };

  // Main animation / physics loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Update timer
      if (state.isPlaying && !state.isCountingDown) {
        const elapsed = (performance.now() - state.startTime) / 1000;
        state.elapsedTime = elapsed;
        setTimeUsed(elapsed);
      }

      // 1. Move paddle with keyboard keys
      const keySpeed = 16;
      if (state.keysPressed.ArrowLeft || state.keysPressed.KeyA) {
        state.targetPaddleX = Math.max(PADDLE_WIDTH / 2, state.targetPaddleX - keySpeed);
      }
      if (state.keysPressed.ArrowRight || state.keysPressed.KeyD) {
        state.targetPaddleX = Math.min(
          CANVAS_WIDTH - PADDLE_WIDTH / 2,
          state.targetPaddleX + keySpeed
        );
      }

      // Smooth paddle interpolation
      state.paddleX += (state.targetPaddleX - state.paddleX) * 0.35;

      // 2. Physics & Ball movement
      if (state.isPlaying) {
        state.ballX += state.ballVx;
        state.ballY += state.ballVy;

        // Bounce left/right boundaries
        if (state.ballX - BALL_RADIUS <= 0) {
          state.ballX = BALL_RADIUS;
          state.ballVx = Math.abs(state.ballVx);
          soundManager.playSideHit();
        } else if (state.ballX + BALL_RADIUS >= CANVAS_WIDTH) {
          state.ballX = CANVAS_WIDTH - BALL_RADIUS;
          state.ballVx = -Math.abs(state.ballVx);
          soundManager.playSideHit();
        }

        // Bounce top boundary
        if (state.ballY - BALL_RADIUS <= 0) {
          state.ballY = BALL_RADIUS;
          state.ballVy = Math.abs(state.ballVy);
          soundManager.playSideHit();
        }

        // Bottom boundary (lava / floor)
        if (state.ballY - BALL_RADIUS >= CANVAS_HEIGHT) {
          handleLifeLost();
        }

        // Paddle collision
        const paddleLeft = state.paddleX - PADDLE_WIDTH / 2;
        const paddleRight = state.paddleX + PADDLE_WIDTH / 2;
        const paddleTop = PADDLE_Y;
        const paddleBottom = PADDLE_Y + PADDLE_HEIGHT;

        if (
          state.ballY + BALL_RADIUS >= paddleTop &&
          state.ballY - BALL_RADIUS <= paddleBottom &&
          state.ballX >= paddleLeft &&
          state.ballX <= paddleRight &&
          state.ballVy > 0
        ) {
          // Calculate bounce angle based on hit location (-1 to +1)
          const hitOffset = (state.ballX - state.paddleX) / (PADDLE_WIDTH / 2);
          const maxAngle = (Math.PI / 180) * 60; // 60 degrees max
          const bounceAngle = hitOffset * maxAngle;

          state.ballVx = BALL_SPEED * Math.sin(bounceAngle);
          state.ballVy = -BALL_SPEED * Math.cos(bounceAngle);
          state.ballY = paddleTop - BALL_RADIUS;
          soundManager.playSideHit();
        }

        // Block collisions
        let remainingBreakable = 0;
        for (let i = 0; i < state.blocks.length; i++) {
          const block = state.blocks[i];
          if ((block.currentHp ?? 0) <= 0) continue;

          if (block.h >= 1 && block.h <= 5) {
            remainingBreakable++;
          }

          const bx = block.x * BLOCK_WIDTH;
          const by = block.y * BLOCK_HEIGHT;
          const bw = BLOCK_WIDTH;
          const bh = BLOCK_HEIGHT;

          // AABB collision check
          const nearestX = Math.max(bx, Math.min(state.ballX, bx + bw));
          const nearestY = Math.max(by, Math.min(state.ballY, by + bh));
          const deltaX = state.ballX - nearestX;
          const deltaY = state.ballY - nearestY;

          if (deltaX * deltaX + deltaY * deltaY < BALL_RADIUS * BALL_RADIUS) {
            // Determine collision normal (hit from top/bottom or left/right)
            const overlapX = (bw / 2 + BALL_RADIUS) - Math.abs(state.ballX - (bx + bw / 2));
            const overlapY = (bh / 2 + BALL_RADIUS) - Math.abs(state.ballY - (by + bh / 2));

            if (overlapX < overlapY) {
              state.ballVx = -state.ballVx;
            } else {
              state.ballVy = -state.ballVy;
            }

            // If destructible, decrease HP
            if (block.h >= 1 && block.h <= 5) {
              block.currentHp = (block.currentHp ?? block.h) - 1;
              const colorConfig = BLOCK_COLORS[block.h] || BLOCK_COLORS[1];
              spawnParticles(nearestX, nearestY, colorConfig.border);
              soundManager.playBlockHit();

              if (block.currentHp <= 0) {
                remainingBreakable--;
              }
            } else {
              // Wall block
              soundManager.playSideHit();
            }
            break; // One collision per frame
          }
        }

        // Win check
        if (remainingBreakable === 0 && state.blocks.some((b) => b.h >= 1 && b.h <= 5)) {
          handleLevelWin(state.elapsedTime);
        }
      }

      // Update particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        p.alpha = Math.max(0, p.life);
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // 3. Render Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Deep space radial background
      const bgGrad = ctx.createRadialGradient(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        100,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        CANVAS_HEIGHT
      );
      bgGrad.addColorStop(0, '#0a0050');
      bgGrad.addColorStop(1, '#020014');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Stars
      state.stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Bottom danger line / lava glow
      const lavaGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT - 30, 0, CANVAS_HEIGHT);
      lavaGrad.addColorStop(0, 'rgba(255, 0, 80, 0.1)');
      lavaGrad.addColorStop(1, 'rgba(255, 0, 50, 0.8)');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);

      // Draw Blocks
      state.blocks.forEach((block) => {
        const hp = block.currentHp ?? block.h;
        if (hp <= 0) return;
        const config = BLOCK_COLORS[block.h] || BLOCK_COLORS[1];

        const padding = 3;
        const bx = block.x * BLOCK_WIDTH + padding;
        const by = block.y * BLOCK_HEIGHT + padding;
        const bw = BLOCK_WIDTH - padding * 2;
        const bh = BLOCK_HEIGHT - padding * 2;
        const r = Math.min(bw, bh) * 0.2;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, r) : ctx.rect(bx, by, bw, bh);

        const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
        grad.addColorStop(0, config.bg[0]);
        grad.addColorStop(1, config.bg[1]);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = config.border;
        ctx.lineWidth = 3;
        ctx.stroke();

        // HP label inside block
        ctx.fillStyle = config.text;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.h === 6 ? '∞' : String(hp), bx + bw / 2, by + bh / 2 + 1);
        ctx.restore();
      });

      // Draw Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      });

      // Draw Paddle
      const px = state.paddleX - PADDLE_WIDTH / 2;
      const py = PADDLE_Y;
      const pw = PADDLE_WIDTH;
      const ph = PADDLE_HEIGHT;
      const pr = ph / 2;

      ctx.save();
      // Outer glow
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15;

      // Paddle body
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(px, py, pw, ph, pr) : ctx.rect(px, py, pw, ph);
      const padGrad = ctx.createLinearGradient(px, py, px, py + ph);
      padGrad.addColorStop(0, '#65f2ff');
      padGrad.addColorStop(0.3, '#0000ff');
      padGrad.addColorStop(0.7, '#6600ff');
      padGrad.addColorStop(1, '#65f2ff');
      ctx.fillStyle = padGrad;
      ctx.fill();

      // Paddle border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Top shine
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(px + 10, py + 3, pw - 20, ph * 0.35, pr / 2) : null;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
      ctx.restore();

      // Draw Ball
      const bx = state.ballX;
      const by = state.ballY;
      const br = BALL_RADIUS;

      ctx.save();
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;

      const ballGrad = ctx.createRadialGradient(
        bx - br * 0.35,
        by - br * 0.35,
        br * 0.1,
        bx,
        by,
        br
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.2, '#00ffff');
      ballGrad.addColorStop(0.7, '#0033cc');
      ballGrad.addColorStop(1, '#00ffff');

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [handleLifeLost, handleLevelWin]);

  // Touch and mouse control handlers
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const scaleX = CANVAS_WIDTH / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;

    gameStateRef.current.targetPaddleX = Math.max(
      PADDLE_WIDTH / 2,
      Math.min(CANVAS_WIDTH - PADDLE_WIDTH / 2, canvasX)
    );
  };

  // Keyboard control handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') gameStateRef.current.keysPressed.ArrowLeft = true;
      if (e.code === 'ArrowRight') gameStateRef.current.keysPressed.ArrowRight = true;
      if (e.code === 'KeyA') gameStateRef.current.keysPressed.KeyA = true;
      if (e.code === 'KeyD') gameStateRef.current.keysPressed.KeyD = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') gameStateRef.current.keysPressed.ArrowLeft = false;
      if (e.code === 'ArrowRight') gameStateRef.current.keysPressed.ArrowRight = false;
      if (e.code === 'KeyA') gameStateRef.current.keysPressed.KeyA = false;
      if (e.code === 'KeyD') gameStateRef.current.keysPressed.KeyD = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gyroscope control
  useEffect(() => {
    if (!settings.gyroscope || typeof window === 'undefined') return;

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null) return;
      const range = 45 * (1 - settings.gyroSensitivity);
      const normalized = Math.max(-range, Math.min(range, e.gamma)) / range;
      const target = CANVAS_WIDTH / 2 + normalized * (CANVAS_WIDTH / 2);
      gameStateRef.current.targetPaddleX = Math.max(
        PADDLE_WIDTH / 2,
        Math.min(CANVAS_WIDTH - PADDLE_WIDTH / 2, target)
      );
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation);
    return () => window.removeEventListener('deviceorientation', handleDeviceOrientation);
  }, [settings.gyroscope, settings.gyroSensitivity]);

  return (
    <>
      <GameHUD
        lives={lives}
        timeUsed={timeUsed}
        countdown={countdownText}
        onExit={() => {
          soundManager.stopBgMusic();
          setScreen('menu');
        }}
      />
      <canvas
        ref={canvasRef}
        id="mainCanvas"
        className="active"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      />
    </>
  );
};
