#include "./block.h"

Block::Block(int x_, int y_, short _width, short _height, int health_) : x(x_), y(y_), width(_width), height(_height), health(health_) {}

void Block::draw(DrawBlockPtr drawBlock) {
   drawBlock(x, y, width, height, health);
}

void Block::destroy() {
   if (health > 0) health--;
}
