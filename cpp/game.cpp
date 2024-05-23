#include "./game.h"
#include "./ball.h"
#include "./block.h"
#include "./createBlocks.h"
#include "./paddle.h"
#include "./random.h"
#include "./star.h"

#include <iostream>

Game::Game() {}

void Game::init(short _WIDTH, short _HEIGHT, short _SIZE, char *level, float padX, float padY, short padW, short padH, float ballX, float ballY, short ballR, float ballSpeed, short _blockWidth, short _blockHeight) {
   WIDTH = _WIDTH;
   HEIGHT = _HEIGHT;
   SIZE = _SIZE;
   blockWidth = _blockWidth;
   blockHeight = _blockHeight;

   paddleHidden = false;
   paddleMaxHidden = _SIZE / 8;
   paddleHiddenCount = 0;

   ball.init(ballX, ballY, ballR, ballSpeed);
   paddle.init(padX, padY, padW, padH, ballSpeed, WIDTH);
   lava.init(0, padY + _SIZE * 0.8, WIDTH, HEIGHT * 0.05, ballSpeed / 4);
   blocks = parser.convertStringToBlocks(level, blockWidth, blockHeight);

   // setup stars
   float numStars = (WIDTH / 80) * (HEIGHT / 80);

   for (short i = 0; i < numStars; i++) {
      float size = rnd(1.0f, (float)SIZE / 32);
      float x = rnd(0.0f, (float)WIDTH);
      float y = rnd(0.0f, (float)HEIGHT);
      stars.push_back(Star(x, y, size, WIDTH, HEIGHT));
   }
}

void Game::createParticles(float x, float y, short colorIndex, short mul) {
   short gap = blockWidth / (4 * mul);

   for (short i = 0; i < blockHeight; i += gap) {
      for (short j = 0; j < blockWidth; j += gap) {
         float size = rnd(1.0f, (float)SIZE / 8);
         float _x = x + j;
         float _y = y + i;
         particles.push_back(Particle(_x, _y, size, colorIndex));
      }
   }
}

void Game::draw(DrawBallPtr drawBall, DrawPaddlePtr drawPaddle, DrawBlockPtr drawBlock, DrawParticlePtr drawParticle, DrawStarPtr drawStar, DrawGlowPtr drawGlow, DrawLavaPtr drawLava, ClearCvsPtr clearCvs) {

   clearCvs(WIDTH, HEIGHT);
   for (auto &star : stars)
      star.draw(drawStar);
   ball.draw(drawBall);
   paddle.draw(drawPaddle, drawGlow);

   for (auto &block : blocks) {
      block.draw(drawBlock);
   }

   for (auto &particle : particles) {
      particle.draw(drawParticle);
   }

   lava.draw(drawLava, drawGlow);
}

void Game::update() {
   short i = 0;

   for (auto &star : stars)
      star.update();
   ball.update();
   paddle.update();
   lava.update();

   // update particles
   for (auto &particle : particles) {
      i++;
      if (particle.update()) {
         particles.erase(particles.begin() + i);
      }
   }

   // check the collision
   // paddle collision
   if (!paddleHidden) {
      short dir = ball.checkPaddleCollision(&paddle);
      if (dir != 0) {
         if (dir == 1)
            ball.reverseX();
         else if (dir == -1)
            ball.reverseY();

         float nvx = (paddle.tx - paddle.x) * 0.1f;
         ball.vx += nvx > 8.0f ? 8.0f : nvx < -8.0f ? -8.0f
                                                    : nvx;
         if (ball.vx > ball.speed / 1.4)
            ball.vx = ball.speed / 1.4;
         if (ball.vx < -ball.speed / 1.4)
            ball.vx = -ball.speed / 1.4;

         paddleHidden = true;
      }
   } else {
      paddleHiddenCount++;
      if (paddleHiddenCount >= paddleMaxHidden) {
         paddleHidden = false;
         paddleHiddenCount = 0;
      }
   }

   if (ball.x1 <= 0 || ball.x2 >= WIDTH) {
      ball.reverseX();
   }
   if (ball.y1 <= 0) {
      ball.reverseY();
   }

   // block collision
   i = 0;
   for (auto &block : blocks) {
      short dir = ball.checkBlockCollision(&block);

      if (!block.isDead && dir != 0) {
         // cout << dir << endl;
         if (dir == 1) {
            ball.reverseX();
         } else if (dir == -1) {
            ball.reverseY();
         } else if (dir == 2) {
            ball.reverseX();
            ball.reverseY();
         }

         short is = block.damage();

         if (is == 2) {
            createParticles(block.x, block.y, block.health, 2);

            block.isDead = true;
            blocks.erase(blocks.begin() + i);
         } else if (is == 1) {
            createParticles(block.x, block.y, block.health, 1);
         }
         break;
      }
      i++;
   }
}