#include "./paddle.h"

Paddle::Paddle(float _x, float _y, short _w, short _h) : x(_x), y(_y), w(_w), h(_h), tx(_x), ty(_y) {}

void Paddle::draw(FunctionPtr fun) {
   fun(x, y, w, h);
}

void Paddle::update() {
   x = (tx - x) * percentage;
   y = (ty - y) * percentage;
}