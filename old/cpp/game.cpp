#include "./game.h"
#include "./ball.h"
#include "./block.h"
#include "./paddle.h"
#include "./random.h"
#include "./star.h"

#include <iostream>
using namespace std;

Game::Game() {}

void Game::setup(short _WIDTH, short _HEIGHT, short _SIZE, float _padX, float _padY, short _padW, short _padH, float _ballX, float _ballY, short _ballR, float _ballSpeed, short _blockWidth, short _blockHeight, short _FPS, DrawBallPtr _drawBall, DrawPaddlePtr _drawPaddle, DrawBlockPtr _drawBlock, DrawParticlePtr _drawParticle, DrawStarPtr _drawStar, DrawGlowPtr _drawGlow, DrawLavaPtr _drawLava, ClearCvsPtr _clearCvs, ClearCvsPtr _clearCanvasWidthNoAlpha, ShowHealthPtr _showHealth, ShowTimePtr _showTime, ShowCountDownPtr _showCountDown, ShowGameOverPtr _showGameOver, ShowGameCompletePtr _showGameComplete, VibrateAudioStatusPtr _vibrate_audio) {
   WIDTH = _WIDTH;
   HEIGHT = _HEIGHT;
   SIZE = _SIZE;
   FPS = _FPS;
   blockWidth = _blockWidth;
   blockHeight = _blockHeight;

   padX = _padX;
   padY = _padY;
   padW = _padW;
   padH = _padH;
   ballX = _ballX;
   ballY = _ballY;
   ballR = _ballR;
   ballSpeed = _ballSpeed;
   numStars = (WIDTH / 80) * (HEIGHT / 80);

   drawBall = _drawBall;
   drawPaddle = _drawPaddle;
   drawBlock = _drawBlock;
   drawParticle = _drawParticle;
   drawStar = _drawStar;
   drawGlow = _drawGlow;
   drawLava = _drawLava;
   clearCvs = _clearCvs;
   clearCanvasWidthNoAlpha = _clearCanvasWidthNoAlpha;
   showHealth = _showHealth;
   showTime = _showTime;
   showCountDown = _showCountDown;
   showGameOver = _showGameOver;
   showGameComplete = _showGameComplete;
   vibrate_audio =  _vibrate_audio;
}

void Game::init(int *array, int length) {
   paddleHidden = false;
   gamePose = true;
   gameOver = false;
   gameComplete = false;
   totalFrameCount = 0;
   paddleHiddenCount = 0;
   paddleMaxHidden = SIZE / 8;
   startingCountDown = FPS * 3;
   health = 3;

   blocks.clear();
   stars.clear();
   particles.clear();
   paddle.glows.clear();
   lava.glows.clear();
   clearCanvasWidthNoAlpha(WIDTH, HEIGHT);

   ball.init(ballX, ballY, ballR, 1);
   paddle.init(padX, padY, padW, padH, ballSpeed, WIDTH);
   lava.init(0, padY + SIZE * 0.8, WIDTH, HEIGHT * 0.05, ballSpeed / 4);

   for (short i = 0; i < length; i += 3) {
      blocks.push_back(Block(array[i], array[i + 1], blockWidth, blockHeight, array[i + 2]));
   }

   wallLength = 0;
   for (auto &block : blocks) {
      if (block.health == 6)
         wallLength++;
   }

   // setup stars
   for (short i = 0; i < numStars; i++) {
      float size = rnd(1.0f, (float)SIZE / 32);
      float x = rnd(0.0f, (float)WIDTH);
      float y = rnd(0.0f, (float)HEIGHT);
      stars.push_back(Star(x, y, size, WIDTH, HEIGHT));
   }
}

void Game::createParticles(float x, float y, float w, float h, short colorIndex, float _sizeMul, float mul) {
   short gap = w / (4 * mul);

   for (short i = 0; i < h; i += gap) {
      for (short j = 0; j < w; j += gap) {
         float size = rnd(1.0f, (float)SIZE / 8 * _sizeMul);
         float _x = x + j;
         float _y = y + i;
         particles.push_back(Particle(_x, _y, size, colorIndex));
      }
   }
}

void Game::draw() {

   clearCvs(WIDTH, HEIGHT);
   for (auto &star : stars)
      star.draw(drawStar);
   if (!gameOver && !gameComplete)
      ball.draw(drawBall);
   paddle.draw(drawPaddle, drawGlow);

   for (auto &block : blocks) {
      if (block.health > 0)
         block.draw(drawBlock);
   }

   lava.draw(drawLava, drawGlow);

   for (auto &particle : particles) {
      particle.draw(drawParticle);
   }
}

void Game::drawBlockOnly() {
   clearCvs(WIDTH, HEIGHT);
   for (auto &block : blocks)
      block.draw(drawBlock);
}

void Game::update() {
   short i = 0;
   for (auto &star : stars)
      star.update();
   if (!gamePose && !gameComplete) {
      for (short i = 0; i < ballSpeed; i++) {
         ball.update();

         // paddle collision
         if (!paddleHidden) {
            short dir = ball.checkPaddleCollision(&paddle);
            if (dir != 0) {
               if (dir == 1)
                  ball.goLeft();
               else if (dir == 2)
                  ball.goRight();
               else if (dir == 3)
                  ball.goTop();
               else if (dir == 4)
                  ball.goBottom();

               float nvx = (paddle.tx - paddle.x) * 0.02;
               ball.vx += nvx > ball.maxV ? ball.maxV : nvx < -ball.maxV ? -ball.maxV : nvx;

               if (ball.vx > ball.maxV)
                  ball.vx = ball.maxV;
               if (ball.vx < -ball.maxV)
                  ball.vx = -ball.maxV;

               paddleHidden = true;
               vibrate_audio(50, 2);
            }
         }

         // block collision
         blocks.erase(
             remove_if(blocks.begin(), blocks.end(), [this](Block &block) {
                short dir = this->ball.checkBlockCollision(&block);

                if (!block.isDead && dir != 0) {
                   if (dir == 1)
                      ball.goLeft();
                   else if (dir == 2)
                      ball.goRight();
                   else if (dir == 3)
                      ball.goTop();
                   else if (dir == 4)
                      ball.goBottom();

                   short is = block.damage();
                   if (is == 2) {
                      createParticles(block.x, block.y, blockWidth, blockHeight, block.health, 1, 2);
                      block.isDead = true;
                      this->vibrate_audio(50, 1);
                      return true;
                   } else if (is == 1) {
                      createParticles(block.x, block.y, blockWidth, blockHeight, block.health, 0.5, 1);
                     this->vibrate_audio(100, 1);
                   } else if (is == 0) {
                     this->vibrate_audio(50, 2);
                   }

                   return false;
                }
                return false;
             }),
             blocks.end());
      }
      paddle.update();
   } else {
      paddle.updateGlows();
   }
   lava.update();

   // update particles
   particles.erase(
       remove_if(particles.begin(), particles.end(), [](Particle &particle) {
          return particle.update();
       }),
       particles.end());

   if (paddleHidden) {
      paddleHiddenCount++;
      if (paddleHiddenCount >= paddleMaxHidden) {
         paddleHidden = false;
         paddleHiddenCount = 0;
      }
   }

   // wall collision
   if (ball.x1 <= 0) {
      ball.goRight();
      this->vibrate_audio(50, 2);
   } else if (ball.x2 >= WIDTH) {
      ball.goLeft();
      this->vibrate_audio(50, 2);
   }
   if (ball.y1 <= 0) {
      ball.goBottom();
      this->vibrate_audio(50, 2);
   }

   if (!gamePose && ball.y2 >= padY + padH * 4) {
      gamePose = true;
      createParticles(ball.x, ball.y - ballR * 2, ballR * 1.6, ballR * 1.6, 4, 0.4, 3);
      showHealth(health--);

      if (health <= 0) {
         gameOver = true;
         showGameOver((int)totalFrameCount / FPS);
         this->vibrate_audio(1000, 5);
         return;
      }
      ball.reset(ballX, ballY);
      paddle.reset(padX, padY);
      startingCountDown = FPS * 3;
      this->vibrate_audio(500, 3);
   }

   if (!gameComplete && wallLength >= blocks.size()) {
      gameComplete = true;
      this->vibrate_audio(0, 4);
      createParticles(ball.x, ball.y - ballR * 2, ballR * 1.6, ballR * 1.6, 4, 0.4, 3);
      showGameComplete((int)totalFrameCount / FPS);
   }

   if (startingCountDown >= 0) {
      if (startingCountDown % FPS == 0) {
         showCountDown((int)startingCountDown / FPS);
      }
      startingCountDown--;
      if (startingCountDown == 0)
         gamePose = false;
   } else if (!gameOver && !gameComplete) {
      totalFrameCount++;
      if (totalFrameCount % FPS == 0) {
         showTime((int)totalFrameCount / FPS);
      }
   }
}