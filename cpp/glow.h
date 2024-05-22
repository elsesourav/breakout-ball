#ifndef GLOW_H
#define GLOW_H

typedef void (*DrawGlowPtr)(float, float, float, float, short colorIndex);

class Glow {
public:
   float *x, *y, offX, offY, size, vx, vy, alpha, flip, alphaRet;
   short maxWidth, maxHeight;
   short colorIndex;

   Glow(float offX, float offY, float size, float speedX, float speedY, float *x, float *y, short maxWidth, short maxHeight, short colorIndex); 
   void draw(DrawGlowPtr drawGlow);
   void update();
};

#endif // GLOW_H

