#include "./glow.h"
#include "./random.h"

Glow::Glow(float _offX, float _offY, float _size, float *_x, float *_y, short _maxWidth, short _maxHeight, short _colorIndex) : x(_x), y(_y), size(_size), offX(_offX), offY(_offY), maxWidth(_maxWidth), maxHeight(_maxHeight), colorIndex(_colorIndex) {
   vx = rnd(-_size * 2, _size * 2);
   vy = rnd(-_size * 2, _size * 2);

   alpha = rnd(0.0f, 1.0f);
   alphaRet = rnd(0.01f, 0.1f);
   flip = rnd(0.0f, 1.0f) > .5f ? -1.0f : 1.0f;
}

void Glow::draw(DrawGlowPtr drawGlow) {
   drawGlow((*x - maxWidth / 2) + offX, (*y - maxHeight * 0.2) + offY, size, alpha, colorIndex);
}

void Glow::update() {
   offX += vx;
   offY += vy;
   alpha += (alphaRet * flip);

   if (alpha < 0) flip = 1;
   if (alpha > 1.0f) flip = -1;

   if (offX < 0) offX  = maxWidth;
   if (offX > maxWidth) offX = 0;
   if (offY < 0) offY  = maxHeight;
   if (offY > maxHeight) offY = 0;
}
