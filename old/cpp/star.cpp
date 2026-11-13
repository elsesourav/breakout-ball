#include "./star.h"
#include "./random.h"

Star::Star(float _x, float _y, float _size, short _windowWidth, short _windowHeight) : x(_x), y(_y), size(_size), windowWidth(_windowWidth), windowHeight(_windowHeight) {
   vx = rnd(-_size / 16, _size / 16);
   vy = rnd(-_size / 16, _size / 16);

   maxAlpha = rnd(-10.0f, 10.0f);
   alpha = rnd(-9.0f, 9.0f);
   flip = rnd(0.0f, 1.0f) > 0.5f ? -1.0f : 1.0f;

}

void Star::draw(DrawStar drawStar) {
   if (alpha > 0.0f) drawStar(x, y, size, alpha);
}

void Star::update() {
   x += vx;
   y += vy;
   alpha += (0.01f * flip);

   if (alpha < -maxAlpha) flip = 1;
   if (alpha > maxAlpha) flip = -1;

   if (x < 0) x  = windowWidth;
   if (x > windowWidth) x = 0;
   if (y < 0) y  = windowHeight;
   if (y > windowHeight) y = 0;
}
