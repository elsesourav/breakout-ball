#include "./block.h"

Block::Block(short x_, short y_, short _w, short _h, short _health) : x(x_ * _w), y(y_ * _h), w(_w), h(_h), health(_health) {
   isDead = false;
   offset = w * 0.1f;
   x1 = x;
   y1 = y;
   x2 = x + w;
   y2 = y + h;
}

void Block::draw(DrawBlockPtr drawBlock) {
   drawBlock(x, y, w, h, health);
}

short Block::damage() {
   if (health == 6) return 0;
   if (--health > 0) { 
      return 1;
   } else {
      return 2;
   }
}
