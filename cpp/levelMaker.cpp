#include "./levelMaker.h"

LevelMaker::LevelMaker() {}

void LevelMaker::setup(short _rows, short _cols, short _WIDTH, short _HEIGHT, short _SIZE, short _blockWidth, short _blockHeight) {
   WIDTH = _WIDTH;
   HEIGHT = _HEIGHT;
   rows = _rows;
   cols = _cols;
   SIZE = _SIZE;
   blockWidth = _blockWidth;
   blockHeight = _blockHeight;
}

void LevelMaker::init() {
   blocks.clear();
   for (short i = 0; i < cols; i++) {
      for (short j = 0; j < rows; j++) {
         blocks.push_back(Block(j, i, blockWidth, blockHeight, 0, true));
      }
   }
}
void LevelMaker::addBlock(short j, short i, short health) {
   for (auto &block : blocks) {
      if (block.j == j && block.i == i) {
         block.health = health;
         block.isHover = false;
         block.onlyOutline = false;
         break;
      }
   }
}
void LevelMaker::removeBlock(short _j, short _i) {
   for (auto &block : blocks) {
      if (block.j == _j && block.i == _i) {
         block.health = 0;
         block.isHover = false;
         block.onlyOutline = true;
         break;
      }
   }
}
void LevelMaker::hoverBlock(short j, short i, short health) {
   for (auto &block : blocks) {
      if (block.j == j && block.i == i) {
         block.hoverHealth = health;
         block.isHover = true;
      } else {
         block.isHover = false;
      }
   }
}

void LevelMaker::draw(DrawBlockPtr drawBlock, DrawBlockAlphaPtr drawBlockAlpha, DrawBlockOutlinePtr drawBlockOutline, ClearCvsPtr clearCanvas) {
   clearCanvas(WIDTH, HEIGHT);
   for (auto &block : blocks) {
      if (block.isHover) {
         drawBlockAlpha(block.x, block.y, block.w, block.h, block.hoverHealth);
      } else if (block.onlyOutline) {
         drawBlockOutline(block.x, block.y, block.w, block.h);
      } else {
         block.draw(drawBlock);
      }
   }
}
