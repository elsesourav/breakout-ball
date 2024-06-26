#ifndef LAVA_H
#define LAVA_H

#include "./glow.h"
#include <iostream>
#include <vector>

typedef void (*DrawLavaPtr)(float, float, float, float);
typedef void (*DrawGlowPtr)(float, float, float, float, short colorIndex);

class Lava {
public:
   float w, h, x, y, fixX;
   std::vector<Glow> glows;

   void init(float x, float y, short w, short h, float speed);
   void draw(DrawLavaPtr drawLava, DrawGlowPtr drawGlow);
   void update();
};

#endif // LAVA_H
