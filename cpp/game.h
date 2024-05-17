#ifndef GAME_H
#define GAME_H

#include "./createBlocks.h"
#include "./ball.h"
#include "./paddle.h"
#include "./particle.h"
#include "./block.h"
#include <vector>
#include <iostream>

typedef void (*DrawBallPtr)(float, float, short);
typedef void (*DrawPaddlePtr)(float, float, short, short);
typedef void (*DrawBlockPtr)(float, float, short, short, short);
typedef void (*DrawParticle)(float, float, float, float, short);
typedef void (*ClearCvs)(short, short);
typedef void (*ClearStaticCvs)(short, short);

class Game {
public:
   short WIDTH, HEIGHT, SIZE, blockWidth, blockHeight, paddleWidth, paddleHeight;
   Blocks parser;
   std::vector<Block> blocks;
   std::vector<Particle> particles;
   Ball ball;
   Paddle paddle;
   bool isNeedDrawBlocks;
   

   Game();
   void init(short WIDTH, short HEIGHT, short SIZE, char *level, float padX, float padY, short padW, short padH, float ballX, float ballY, short ballR, float BallSpeed, short blockWidth, short blockHeight);

   void draw(DrawBallPtr drawBall, DrawPaddlePtr drawPaddle, DrawBlockPtr drawBlock, DrawParticle drawParticle, ClearCvs clearCvs, ClearStaticCvs clearStaticCvs);

   void createParticles(float x, float y, short colorIndex);
   void update();

};

#endif // GAME_H
