#include "./particle.h"
#include "./random.h"

Particle::Particle(float _x, float _y, float _size, short _colorIndex) : x(_x), y(_y), size(_size), colorIndex(_colorIndex) {
   gravity = 0.05f;
   friction = 0.99f;
   alpha = rnd(1.0f, _size / 4);
   vx = rnd(-_size, _size);
   vy = rnd(-_size, _size);
}

void Particle::draw(DrawParticle drawParticle) {
   drawParticle(x, y, size, alpha, colorIndex);
}

bool Particle::update() {
   if (alpha < 0.1f) {
      return true;
   }
   x += vx;
   y += vy;
   vx *= friction;
   vy *= friction;
   vy += gravity;
   alpha *= 0.98f;
   return false;
}
