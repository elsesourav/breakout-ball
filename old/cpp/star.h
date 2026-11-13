#ifndef STAR_H
#define STAR_H

typedef void (*DrawStar)(float, float, float, float);

class Star {
public:
   float x, y, size, vx, vy, alpha, flip, maxAlpha;
   short windowWidth, windowHeight;

   Star(float x, float y, float size, short windowWidth, short windowHeight); 
   void draw(DrawStar drawStar);
   void update();

};

#endif // STAR_H

