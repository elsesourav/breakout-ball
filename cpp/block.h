#ifndef BLOCK_H
#define BLOCK_H

typedef void (*DrawBlockPtr)(float, float, short, short, short);

class Block {
public:
   Block(int x, int y, short width, short height, int health);

   void draw(DrawBlockPtr drawBlock);

   void destroy();

private:
   int x;
   int y;
   short width, height;
   int health;
};

#endif // BLOCK_H
