#include "./paddle.h"
#include "./random.h"

void Paddle::init(float _x, float _y, short _w, short _h, float ballSpeed, short _windowWidth) {
   x = _x;
   y = _y;
   w = _w;
   h = _h;
   tx = _x;
   ty = _y;
   v = ballSpeed * 2;
   windowWidth = _windowWidth;
   percentage = 0.1f;
   isPointerLock = false;


   // setup glows
   short numGlows = (w / 16) * (h / 16);
   float W = w * 0.9;
   float H = h * 0.8;

   for (short i = 0; i < numGlows; i++) {
      float size = rnd(1.0f, 3.0f);
      float offX = rnd(0.0f, (float)W);
      float offY = rnd(0.0f, (float)H);
      short colorIndex = (int) rnd(0.0f, 17.0f);
      glows.push_back(Glow(offX, offY, size, &x, &y, W, H, colorIndex));
   }
}

void Paddle::draw(DrawPaddlePtr drawPaddle, DrawGlowPtr drawGlow) {
   drawPaddle(x, y, w, h);
   for (auto &glow : glows)
      glow.draw(drawGlow);
}

void Paddle::update() {
   x += (tx - x) * percentage;
   y += (ty - y) * percentage;

   for (auto &glow : glows)
      glow.update();
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
float Paddle::moveDirect(float _x) {
   if (_x - w / 2 >= 0 && _x + w / 2 <= windowWidth) {
      x = _x;
   }
   return x;
}