#include "./ball.h"
#include "./random.h"
#include <algorithm>
#include <cmath>
#include <iostream>

void Ball::init(float _x, float _y, short _r, float _speed) {
   x = _x;
   y = _y;
   preX = _x;
   preY = _y;
   r = _r;
   speed = _speed;
   vx = rnd(-4.0f, 4.0f);
   vy = -_speed;
   this->updateX1X2Y1Y2();
}
void Ball::reset(float _x, float _y) {
   x = _x;
   y = _y;
   preX = _x;
   preY = _y;
   vx = rnd(-4.0f, 4.0f);
   vy = -speed;
   this->updateX1X2Y1Y2();
}

void Ball::updateX1X2Y1Y2() {
   x1 = x - r;
   y1 = y - r;
   x2 = x1 + r * 2;
   y2 = y1 + r * 2;
}

void Ball::draw(DrawBallPtr drawBall) {
   drawBall(x, y, r);
}

void Ball::update() {
   preX = x;
   preY = y;
   x += vx;
   y += vy;
   this->updateX1X2Y1Y2();
}
void Ball::reverseY() {
   vy *= -1;
}
void Ball::reverseX() {
   vx *= -1;
}

short Ball::getCollisionSide(float X1, float Y1, float X2, float Y2, float offset) {
   left = x2 - X1;
   right = X2 - x1;
   top = y2 - Y1;
   bottom = Y2 - y1;

   numbers = {left, right, top, bottom};
   std::sort(numbers.begin(), numbers.end());

   min = numbers[0];
   second = numbers[1];
   dx = x - preX;
   dy = y - preY;

   if (abs(min - second) < offset) {
      if (min > offset / 2) {
         if (abs(dx) > abs(dy))
            return 1;
         else
            return -1;
      }

   } else {
      if (min == left || min == right)
         return 1;
      else if (min == top || min == bottom)
         return -1;
   }

   return 0;
}

short Ball::checkPaddleCollision(Paddle *p) {
   if (p->x1 < x2 && p->x2 > x1 && p->y1 < y2 && p->y2 > y1) {
      return getCollisionSide(p->x1, p->y1, p->x2, p->y2, p->offset);
   }
   return 0;
}

short Ball::checkBlockCollision(Block *b) {
   if (b->x1 < x2 && b->x2 > x1 && b->y1 < y2 && b->y2 > y1) {
      return getCollisionSide(b->x1, b->y1, b->x2, b->y2, b->offset);
   } 
   return 0;
}