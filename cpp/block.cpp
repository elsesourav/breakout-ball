#include "./block.h"

Block::Block(int x_, int y_, short _width, short _height, int health_) : x(x_ * _width), y(y_ * _height), w(_width), h(_height), health(health_), isDead(false) {}

void Block::draw(DrawBlockPtr drawBlock) {
   drawBlock(x, y, w, h, health);
}

bool Block::damage() {
   if (--health > 0) {
      return false;
   } else {
      return true;
   }
}
