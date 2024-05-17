#include "./ball.h"
#include "./random.h"
#include <cmath>
#include <iostream>
using namespace std;

void Ball::init(float _x, float _y, short _r, float _speed) {
   x = _x;
   y = _y;
   r = _r;
   speed = _speed;
   vx = rnd(-4.0f, 4.0f);
   vy = -_speed;
}

void Ball::draw(DrawBallPtr drawBall) {
   drawBall(x, y, r);
}

void Ball::update() {
   x += vx;
   y += vy;
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
   distanceX = std::abs(x - b->x);
   distanceY = std::abs(y - b->y);

   if (distanceX > (b->w / 2 + r)) return 0;
   if (distanceY > (b->h / 2 + r)) return 0;

   if (distanceX <= (b->w / 2)) return 1;
   if (distanceY <= (b->h / 2)) return -1;

   distanceSQR = std::pow((distanceX - b->w / 2), 2) + std::pow((distanceY - b->h / 2), 2);

   if (distanceSQR <= std::pow(r, 2)) return 2;
   return 0;
   // return x + r >= b->x && x - r <= b->x + b->w && y + r >= b->y && y - r <= b->y + b->h;
}

short Ball::collisionSide(Block *b) {
   float left = ((x + r) - (b->x + b->w / 2)) - b->w / 2;
   float right = ((b->x + b->w) - (x - r)) - b->w / 2;
   float top = ((y + r) - (b->y + b->h / 2)) - b->h / 2;
   float bottom = ((b->y + b->h) - (y - r)) - b->h / 2;

   // std::cout << "left: " << left << " ;right " << right << " ;top " << top << " ;bottom " << bottom << std::endl;
   float max = std::max(std::max(std::max(left, right), top), bottom);

   // std::cout << minimum << std::endl;
   if (max == left || max == right)
      return 1;

   return 0;
}