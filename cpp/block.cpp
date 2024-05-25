#include "./block.h"

Block::Block(short _x, short _y, short _w, short _h, short _health, bool _onlyOutline) : i(_y), j(_x), x(_x * _w), y(_y * _h), w(_w), h(_h), health(_health), onlyOutline(_onlyOutline){
   isDead = false;
   isHover = false;
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
