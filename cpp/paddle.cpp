#include "./paddle.h"

void Paddle::init(float _x, float _y, short _w, short _h,  float ballSpeed, short _windowWidth) {
   x = _x;
   y = _y;
   w = _w;
   h = _h;
   tx = _x;
   ty = _y;
   v = ballSpeed * 2;
   windowWidth = _windowWidth;
   deltaMove = 0.0f;
   percentage = 0.1f;
   movePercentage = 0.5f;
   isPointerLock = false;
}

void Paddle::draw(DrawPaddlePtr drawPaddle) {
   drawPaddle(x, y, w, h);
}

void Paddle::update() {
   x += (tx - x) * percentage;
   y += (ty - y) * percentage;
   deltaMove *= movePercentage;
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