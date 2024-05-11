#ifndef PARTIAL_H
#define PARTIAL_H

#include <cstdlib> // Include this for the definition of rnd()

typedef void (*FunctionPtr)(float, float, float, float, short);

class Particle {
private:
   float x, y, size, gravity, friction, vx, vy, alpha;
   bool isVisible;
   short colorIndex;

public:
   Particle(float x, float y, float size, short colorIndex); 
   void draw(FunctionPtr fun);
   void update();
};

#endif // PARTIAL_H

