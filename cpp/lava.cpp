#include "./lava.h"
#include "./random.h"

void Lava::init(float _x, float _y, short _w, short _h, float speed) {
   x = _x;
   y = _y;
   w = _w;
   h = _h;
   offsetX = (x + w / 2);

   // setup glows
   short numGlows = (w / 50) * (h / 50);

   for (short i = 0; i < numGlows; i++) {
      float H = h * rnd(0.4f, 0.9f);
      float size = rnd(1.0f, 6.0f);
      float offX = rnd(0.0f, (float)w);
      float offY = rnd(0.0f, (float)H);
      short colorIndex = (int) rnd(0.0f, 5.0f);
      glows.push_back(Glow(offX, offY, size, speed / 8, speed / 2, &offsetX, &y, w, H, colorIndex));
   }
}

void Lava::draw(DrawLavaPtr drawLava, DrawGlowPtr drawGlow) {
   drawLava(x, y, w, h);
   for (auto &glow : glows)
      glow.draw(drawGlow);
}

void Lava::update() {
   for (auto &glow : glows)
      glow.update();
}