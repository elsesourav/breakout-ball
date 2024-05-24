#ifndef BALL_H
#define BALL_H

#include "./block.h"
#include "./paddle.h"
#include <array>


typedef void (*DrawBallPtr)(float, float, short);

class Ball {
public:
   short r, left, right, top, bottom, min, second;
   float x, y, preX, preY, vx, vy, speed, x1, x2, y1, y2, dx, dy;
   std::array<short, 4> numbers;

   void init(float x, float y, short r, float speed);
   void reset(float x, float y);
   void draw(DrawBallPtr drawBall);
   void updateX1X2Y1Y2();
   void update();
   void reverseY();
   void reverseX();
   short getCollisionSide(float X1, float Y1, float X2, float Y2, float offset);
   short checkPaddleCollision(Paddle *paddle);
   short checkBlockCollision(Block *block);
};

#endif // BALL_H
