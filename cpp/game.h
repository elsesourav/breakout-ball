#ifndef GAME_H
#define GAME_H

#include "./createBlocks.h"
#include "./ball.h"
#include "./paddle.h"
#include "./block.h"
#include <vector>
#include <iostream>

typedef void (*DrawBallPtr)(float, float, short);
typedef void (*DrawPaddlePtr)(float, float, short, short);
typedef void (*DrawBlockPtr)(float, float, short, short);

class Game {
public:
   Game();
   void init(short WIDTH, short HEIGHT, short SIZE, char *level, float padX, float padY, short padW, short padH, float ballX, float ballY, short ballR, float BallSpeed);

   void draw(DrawBallPtr drawBall, DrawPaddlePtr drawPaddle, DrawBlockPtr drawBlock);

private:
   short WIDTH, HEIGHT, SIZE;
   Blocks parser;
   std::vector<Block> blocks;
   Ball ball;
   Paddle paddle;
};

#endif // GAME_H
