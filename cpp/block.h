#ifndef BLOCK_H
#define BLOCK_H

typedef void (*DrawBlockPtr)(float, float, short, short, short);

class Block {
public:
   short x, y, w, h, health;
   float offset;
   float x1, x2, y1, y2;
   bool isDead;

   Block(short x, short y, short w, short h, short health);
   void draw(DrawBlockPtr drawBlock);
   short damage();

};

#endif // BLOCK_H
