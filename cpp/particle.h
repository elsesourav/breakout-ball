#ifndef PARTIAL_H
#define PARTIAL_H

#include <cstdlib> // Include this for the definition of rnd()

typedef void (*DrawParticle)(float, float, float, float, short);

class Particle {
public:
   float x, y, size, gravity, friction, vx, vy, alpha;
   short colorIndex;

   Particle(float x, float y, float size, short colorIndex); 
   void draw(DrawParticle drawParticle);
   bool update();

};

#endif // PARTIAL_H

