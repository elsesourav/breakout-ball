#ifndef BALL_H
#define BALL_H

#include "./paddle.h"
#include "./block.h"

typedef void (*DrawBallPtr)(float, float, short);

class Ball {
public:
   short r;
   float x, y, vx, vy, speed, x1, x2, y1, y2;

   void init(float x, float y, short r,  float speed);
   void draw(DrawBallPtr drawBall);
   void updateX1X2Y1Y2();
   void update();
   void reverseY();
   void reverseX();
   bool checkPaddleCollision(Paddle *paddle);
   short checkBlockCollision(Block *block);
};

#endif // BALL_H
