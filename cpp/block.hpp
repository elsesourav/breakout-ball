#ifndef BLOCK_H
#define BLOCK_H
// #include "particle.hpp"

class Block {
private:
   short i, j, w, h, health;
   float x, y;
   bool isVisible;
   bool isCompleted;
   //std::vector<Particle> particles;
   // Particle particles[(w * h / 4)]; // size of each particle w, h = 4

public:
   Block(short j, short i, short w, short h, short health);

   void damage();

   void drawOutline();

   void majorUpdate();

   void draw();
};

#endif // BLOCK_H