#ifndef LEVEL_MAKER_H
#define LEVEL_MAKER_H

#include "./block.h"
#include <iostream>
#include <vector>

typedef void (*DrawBlockPtr)(float, float, short, short, short);
typedef void (*DrawBlockAlphaPtr)(float, float, short, short, short);
typedef void (*DrawBlockOutlinePtr)(float, float, short, short);
typedef void (*ClearCvsPtr)(short, short);

class LevelMaker {
public:
   short rows, cols, WIDTH, HEIGHT, SIZE, blockWidth, blockHeight;
   std::vector<Block> blocks;

   DrawBlockPtr drawBlock;
   DrawBlockAlphaPtr drawBlockAlpha;
   DrawBlockOutlinePtr drawBlockOutline;
   ClearCvsPtr clearCanvas;

   LevelMaker();
   void setup(short rows, short cols, short WIDTH, short HEIGHT, short SIZE, short blockWidth, short blockHeight, DrawBlockPtr drawBlock, DrawBlockAlphaPtr drawBlockAlpha, DrawBlockOutlinePtr drawBlockOutline, ClearCvsPtr clearCanvas);
   void init(int *array, int length);
   void addBlock(short j, short i, short health);
   void removeBlock(short j, short i);
   void hoverBlock(short j, short i, short health);
   void draw();
};

#endif // LEVEL_MAKER_H
