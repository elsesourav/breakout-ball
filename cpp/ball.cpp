#include "./ball.h"
#include "./random.h"

Ball::Ball(float _x, float _y, float _speed, short _r) : x(_x), y(_y), speed(_speed), r(_r), vx(rnd(-1.0f, 1.0f)), vy(-_speed) {}

void Ball::draw(FunctionPtr fun) {
   fun(x, y, r);
}

void Ball::update() {
   x += vx;
   y += vy;
}