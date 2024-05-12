#ifndef BLOCK_H
#define BLOCK_H

class Block {
public:
   Block(int x_, int y_, int health_) : x(x_), y(y_), health(health_) {}

   int getX() const { return x; }
   int getY() const { return y; }
   int getHealth() const { return health; }

   void destroy() { 
      if (health > 0) health--;
   }

private:
   int x;
   int y;
   int health;
};

#endif // BLOCK_H
