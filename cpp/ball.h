#ifndef BALL_H
#define BALL_H

#include "./paddle.h"
#include "./block.h"

typedef void (*DrawBallPtr)(float, float, short);

class Ball {
public:
   short r;
   float x, y, vx, vy, speed;

   void init(float x, float y, short r,  float speed);
   void draw(DrawBallPtr drawBall);
   void update();
   void reverseY();
   void reverseX();
   bool checkPaddleCollision(Paddle *block);
   bool checkBlockCollision(Block *block);
   short collisionSide(Block *block);
};

#endif // BALL_H
