#include "./ball.h"
#include "./random.h"

void Ball::init(float _x, float _y, short _r, float _speed) {
   x = _x;
   y = _y;
   r = _r;
   speed = _speed;
   vx = rnd(-1.0f, 1.0f);
   vy = -_speed;
}

void Ball::draw(DrawBallPtr drawBall) {
   drawBall(x, y, r);
}

void Ball::update() {
   x += vx;
   y += vy;
}