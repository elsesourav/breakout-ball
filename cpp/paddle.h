#ifndef PADDLE_H
#define PADDLE_H

#include "./glow.h"
#include <iostream>
#include <string>
#include <vector>

typedef void (*DrawPaddlePtr)(float, float, short, short);
typedef void (*DrawGlowPtr)(float, float, float, float, short colorIndex);

class Paddle {
public:
   short w, h;
   float x, y, tx, ty, v, windowWidth, percentage;
   bool isPointerLock, colorIndex;
   std::vector<Glow> glows;

   void init(float x, float y, short w, short h, float ballSpeed, short windowWidth);
   void draw(DrawPaddlePtr drawPaddle, DrawGlowPtr drawGlow);
   void update();
   void moveLeft();
   void moveRight();
   float moveTarget(float tx);
};

#endif // PADDLE_H
