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
   vx = rnd(-speed / 4, speed / 4);
   vy = -speed;
   this->updateX1X2Y1Y2();
}
void Ball::reset(float _x, float _y) {
   x = _x;
   y = _y;
   preX = _x;
   preY = _y;
   vx = rnd(-speed / 4, speed / 4);
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
void Ball::goLeft() {
   vx = abs(vx) * -1;
}
void Ball::goRight() {
   vx = abs(vy);
}
void Ball::goTop() {
   vy = abs(vy) * -1;
}
void Ball::goBottom() {
   vy = abs(vy);
}

short Ball::getCollisionSide(float X1, float Y1, float X2, float Y2, float offset) {
/* 
   Left: 1
   Right: 2
   Top: 3
   Bottom: 4
*/
   float left = x2 - X1;
   float right = X2 - x1;
   float top = y2 - Y1;
   float bottom = Y2 - y1;

   std::vector<float> numbers = {left, right, top, bottom};
   std::sort(numbers.begin(), numbers.end());

   float min = numbers[0];
   float second = numbers[1];
   float dx = x - preX;
   float dy = y - preY;

   if (abs(min - second) < offset) {
      if (min > offset / 2) {
         if (abs(dx) > abs(dy)) {
            return (left < right) ? 1 : 2; // Return 1 for left, 2 for right
         } else {
            return (top < bottom) ? 3 : 4; // Return 3 for top, 4 for bottom
         }
      }
   } else {
      if (min == left) {
         return 1; // Left
      } else if (min == right) {
         return 2; // Right
      } else if (min == top) {
         return 3; // Top
      } else if (min == bottom) {
         return 4; // Bottom
      }
   }

   return 0; // No collision
}

short Ball::checkPaddleCollision(Paddle *p) {
   if (p->x1 < x2 && p->x2 > x1 && p->y1 < y2 && p->y2 > y1) {
      return getCollisionSide(p->x1, p->y1, p->x2, p->y2, p->offset / speed);
   }
   return 0;
}

short Ball::checkBlockCollision(Block *b) {
   if (b->x1 < x2 && b->x2 > x1 && b->y1 < y2 && b->y2 > y1) {
      return getCollisionSide(b->x1, b->y1, b->x2, b->y2, b->offset / speed);
   }
   return 0;
}