#include "./levelMaker.h"

LevelMaker::LevelMaker() {}

void LevelMaker::setup(short _rows, short _cols, short _WIDTH, short _HEIGHT, short _SIZE, short _blockWidth, short _blockHeight, DrawBlockPtr _drawBlock, DrawBlockAlphaPtr _drawBlockAlpha, DrawBlockOutlinePtr _drawBlockOutline, ClearCvsPtr _clearCanvas) {
   WIDTH = _WIDTH;
   HEIGHT = _HEIGHT;
   rows = _rows;
   cols = _cols;
   SIZE = _SIZE;
   blockWidth = _blockWidth;
   blockHeight = _blockHeight;

   drawBlock = _drawBlock;
   drawBlockAlpha = _drawBlockAlpha;
   drawBlockOutline = _drawBlockOutline;
   clearCanvas = _clearCanvas;
}

void LevelMaker::init(int *array, int length) {
   blocks.clear();
   for (short i = 0; i < length; i += 3) {
      if (array[i + 2] == 0) {
         blocks.push_back(Block(array[i], array[i + 1], blockWidth, blockHeight, 0));
      } else
         blocks.push_back(Block(array[i], array[i + 1], blockWidth, blockHeight, array[i + 2]));
   }
}
void LevelMaker::addBlock(short j, short i, short health) {
   blocks[i * rows + j].health = health;
   blocks[i * rows + j].isHover = false;
}
void LevelMaker::removeBlock(short _j, short _i) {
   for (auto &block : blocks) {
      if (block.j == _j && block.i == _i) {
         block.health = 0;
         block.isHover = false;
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

void LevelMaker::draw() {
   clearCanvas(WIDTH, HEIGHT);
   for (auto &block : blocks) {
      if (block.isHover) {
         if (block.hoverHealth > 0)
            drawBlockAlpha(block.x, block.y, block.w, block.h, block.hoverHealth);
         else drawBlockOutline(block.x, block.y, block.w, block.h);
      } else if (block.health > 0) {
         block.draw(drawBlock);
      } else {
         drawBlockOutline(block.x, block.y, block.w, block.h);
      }
   }
}
