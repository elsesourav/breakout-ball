#ifndef GAME_H
#define GAME_H

#include "./createBlocks.h"
#include "./ball.h"
#include "./lava.h"
#include "./paddle.h"
#include "./particle.h"
#include "./star.h"
#include "./block.h"
#include <vector>
#include <iostream>

typedef void (*DrawBallPtr)(float, float, short);
typedef void (*DrawPaddlePtr)(float, float, short, short);
typedef void (*DrawBlockPtr)(float, float, short, short, short);
typedef void (*DrawParticlePtr)(float, float, float, float, short);
typedef void (*DrawStarPtr)(float, float, float, float);
typedef void (*DrawLavaPtr)(float, float, float, float);
typedef void (*DrawGlowPtr)(float, float, float, float, short colorIndex);
typedef void (*ClearCvsPtr)(short, short);

class Game {
public:
   short WIDTH, HEIGHT, SIZE, blockWidth, blockHeight, paddleWidth, paddleHeight;
   bool paddleHidden;
   short paddleMaxHidden, paddleHiddenCount;
   Blocks parser;
   std::vector<Block> blocks;
   std::vector<Particle> particles;
   std::vector<Star> stars;
   Ball ball;
   Lava lava;
   Paddle paddle;
   

   Game();
   void init(short WIDTH, short HEIGHT, short SIZE, char *level, float padX, float padY, short padW, short padH, float ballX, float ballY, short ballR, float BallSpeed, short blockWidth, short blockHeight);

   void draw(DrawBallPtr drawBall, DrawPaddlePtr drawPaddle, DrawBlockPtr drawBlock, DrawParticlePtr drawParticle, DrawStarPtr drawStar, DrawGlowPtr drawGlow, DrawLavaPtr drawLava, ClearCvsPtr clearCvs);

   void createParticles(float x, float y, short colorIndex, short mul);
   void update();

};

#endif // GAME_H
