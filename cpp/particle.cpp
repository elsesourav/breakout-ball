#include "./particle.h"
#include "./random.h" // Assuming this is where rnd() is defined

Particle::Particle(float x, float y, float size, short colorIndex) : x(x), y(y), size(size), colorIndex(colorIndex), gravity(0.05f), friction(0.99f), alpha(rnd(1.0f, 2.0f)), vx(rnd(2.0f, 5.0f)), vy(rnd(2.0f, 5.0f)), isVisible(false) {}

void Particle::draw(FunctionPtr fun) { // Added return type
   fun(x, y, size, alpha, colorIndex);
}

void Particle::update() {
   if (alpha < 0.01f) {
      isVisible = false;
      alpha = 0.0f;
      return;
   }
   x += vx;
   y += vy;
   vx *= friction;
   vy *= friction;
   vy += gravity;
   alpha *= 0.02f;
}
