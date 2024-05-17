#include "./game.h"
#include "./ball.h"
#include "./block.h"
#include "./createBlocks.h"
#include "./paddle.h"
#include "./random.h"

#include <iostream>
using namespace std;

Game::Game() {}

void Game::init(short _WIDTH, short _HEIGHT, short _SIZE, char *level, float padX, float padY, short padW, short padH, float ballX, float ballY, short ballR, float BallSpeed, short _blockWidth, short _blockHeight) {
   WIDTH = _WIDTH;
   HEIGHT = _HEIGHT;
   SIZE = _SIZE;
   blockWidth = _blockWidth;
   blockHeight = _blockHeight;
   isNeedDrawBlocks = true;

   ball.init(ballX, ballY, ballR, BallSpeed);
   paddle.init(padX, padY, padW, padH, BallSpeed, WIDTH);
   blocks = parser.convertStringToBlocks(level, blockWidth, blockHeight);
}

void Game::draw(DrawBallPtr drawBall, DrawPaddlePtr drawPaddle, DrawBlockPtr drawBlock, DrawParticle drawParticle, ClearCvs clearCvs, ClearStaticCvs clearStaticCvs) {
   clearCvs(WIDTH, HEIGHT);
   ball.draw(drawBall);
   paddle.draw(drawPaddle);

   if (isNeedDrawBlocks) {
      clearStaticCvs(WIDTH, HEIGHT);
      isNeedDrawBlocks = false;
      for (auto &block : blocks) {
         block.draw(drawBlock);
      }
   }

   for (auto &particle : particles) {
      particle.draw(drawParticle);
   }
}

void Game::createParticles(float x, float y, short colorIndex) {
   short gap = blockWidth / 8;

   for (short i = 0; i < blockHeight; i += gap) {
      for (short j = 0; j < blockWidth; j += gap) {
         float size = rnd(1.0f, (float) SIZE / 8);
         float _x = x + j;
         float _y = y + i;
         particles.push_back(Particle(_x, _y, size, colorIndex));
      }
   }

}

void Game::update() {
   short i = 0;

   ball.update();
   paddle.update();

   // update particles
   for (auto &particle : particles) {
      i++;
      if(particle.update()) {
         particles.erase(particles.begin() + i);
      }
   }

   // check the collision

   if (ball.checkPaddleCollision(&paddle)) {
      ball.reverseY();
   }

   if (ball.x - ball.r <= 0 || ball.x + ball.r >= WIDTH) {
      ball.reverseX();
   }
   if (ball.y - ball.r <= 0) {
      ball.reverseY();
   }

   i = 0;
   for (auto &block : blocks) {
      if (!block.isDead && ball.checkBlockCollision(&block)) {
         short side = ball.collisionSide(&block); // 1 for left, right, 0 for top bottom

         if (side == 1) {
            ball.reverseX();
         } else {
            ball.reverseY();
         }
         bool is = block.damage();
         isNeedDrawBlocks = true;

         if (is) {
            createParticles(block.x, block.y, block.health);

            block.isDead = true;
            blocks.erase(blocks.begin() + i);
         }
         break;
      }
      i++;
   }
}