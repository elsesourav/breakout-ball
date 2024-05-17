#include "./paddle.h"

void Paddle::init(float _x, float _y, short _w, short _h,  float ballSpeed, short _windowWidth) {
   x = _x;
   y = _y;
   w = _w;
   h = _h;
   tx = _x;
   ty = _y;
   windowWidth = _windowWidth;
   v = ballSpeed * 2;
}

void Paddle::draw(DrawPaddlePtr drawPaddle) {
   drawPaddle(x, y, w, h);
}

void Paddle::update() {
   x += (tx - x) * percentage;
   y += (ty - y) * percentage;
}

void Paddle::moveLeft() {
   tx -= v;
}
void Paddle::moveRight() {
   tx += v;
}
float Paddle::moveTarget(float _tx) {
   if (_tx - w / 2 >= 0 && _tx + w / 2 <= windowWidth) {
      tx = _tx;
   }
   return tx;
}