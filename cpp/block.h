#ifndef BLOCK_H
#define BLOCK_H

typedef void (*DrawBlockPtr)(float, float, short, short, short);

class Block {
public:
   int x;
   int y;
   short w, h;
   int health;
   bool isDead;

   Block(int x, int y, short width, short w, int h);
   void draw(DrawBlockPtr drawBlock);
   bool damage();

};

#endif // BLOCK_H
