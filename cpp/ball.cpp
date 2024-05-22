#include "./ball.h"
#include "./random.h"
#include <cmath>
#include <iostream>
#include <array>
#include <algorithm>

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

void Ball::updateX1X2Y1Y2() {
   x1 = x-r;
   y1 = y-r;
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

bool Ball::checkPaddleCollision(Paddle *p) {
   float nx = p->x - p->w / 2;
   return x + r >= nx && x - r <= nx + p->w && y + r >= p->y && y - r <= p->y + p->h;
}

short Ball::checkBlockCollision(Block *b) {
   if (b->x1 < x2 && b->x2 > x1 && b->y1 < y2 && b->y2 > y1) {
      short left = x2 - b->x1;
      short right = b->x2 - x1;
      short top = y2 - b->y1;
      short bottom = b->y2 - y1;

      std::array<short, 4> numbers = {left, right, top, bottom};
      std::sort(numbers.begin(), numbers.end());

      short min = numbers[0];
      short second = numbers[1];
      float dx = x - preX;
      float dy = y - preY;

      if (abs(min - second) < b->offset) {
         if (min > b->offset / 2) {
            if (abs(dx) > abs(dy)) return 1;
            else return -1;
         }

      } else {
         if (min == left || min == right) return 1;
         else if (min == top || min == bottom) return -1;
      }

      return 0;
   }

   return 0;
}