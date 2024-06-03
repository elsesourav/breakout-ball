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
   offset = w * 0.1f;
   windowWidth = _windowWidth;
   movePercentage = 0.1f;
   gyroPercentage = 0.3f;
   percentage = movePercentage;
   isPointerLock = false;
   fixY = y + h * 0.2f;

   // setup glows
   short numGlows = (w / 16) * (h / 16);
   float W = w * 0.9;
   float H = h * 0.9;

   for (short i = 0; i < numGlows; i++) {
      float size = rnd(1.0f, 3.0f);
      float offX = rnd(0.0f, (float)W);
      float offY = rnd(0.0f, (float)H);
      short colorIndex = (int)rnd(0.0f, 17.0f);
      glows.push_back(Glow(offX, offY, size, size * 2, size * 2, &x, &fixY, W, H, colorIndex));
   }

   this->updateX1X2Y1Y2();
}

void Paddle::reset(float _x, float _y) {
   x = _x;
   y = _y;
   tx = _x;
   ty = _y;
   isPointerLock = false;

   this->updateX1X2Y1Y2();
}

void Paddle::draw(DrawPaddlePtr drawPaddle, DrawGlowPtr drawGlow) {
   drawPaddle(x, y, w, h);
   for (auto &glow : glows)
      glow.draw(drawGlow);
}

void Paddle::updateX1X2Y1Y2() {
   x1 = x - w / 2;
   y1 = y;
   x2 = x1 + w;
   y2 = y1 + h;
}

void Paddle::update() {
   x += (tx - x) * percentage;
   y += (ty - y) * percentage;
   this->updateGlows();
}
void Paddle::updateGlows() {
   this->updateX1X2Y1Y2();
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
   percentage = movePercentage;
   if (_tx - w / 2 >= 0 && _tx + w / 2 <= windowWidth) {
      tx = _tx;
   }
   return tx;
}
float Paddle::moveDirect(float _x) {
   percentage = gyroPercentage;
   if (_x - w / 2 >= 0 && _x + w / 2 <= windowWidth) {
      tx = _x;
   } else if (_x - w / 2 < 0) {
      tx = w / 2;
   } else if (_x + w / 2 > windowWidth) {
      tx = windowWidth - w / 2;
   }
   return tx;
}