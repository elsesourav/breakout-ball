#include "./particle.h"
#include "./createBlocks.h"
#include <array>
#include <emscripten/emscripten.h>
#include <iostream>
#include <vector>

EM_JS(void, drawParticle, (float x, float y, float size, float alpha, short colorIndex), {
   // colorIndex use to get block current color
   ctx.globalAlpha = alpha;
   ctx.fillStyle = "red";
   ctx.fillRect(x, y, size, size);
   ctx.globalAlpha = 1;
});

short ROWS, COLS, SIZE, BLOCK_WIDTH, BLOCK_HEIGHT, WIDTH, HEIGHT;

extern "C" {

EMSCRIPTEN_KEEPALIVE void initialize(short rows, short cols, short size) {
   ROWS = rows;
   COLS = cols;
   SIZE = size;
   BLOCK_WIDTH = SIZE;
   BLOCK_HEIGHT = SIZE / 4 * 3;
   WIDTH = SIZE * 9;
   HEIGHT = SIZE * 16;

   Particle p = Particle(40, 60, 25, 1);
   p.draw(drawParticle);
}

EMSCRIPTEN_KEEPALIVE void setLevel(char *level) {
   // std::cout << level << std::endl;

   Blocks parser;
   std::vector<Block> blocks = parser.convertStringToBlocks(level);

   // Print the blocks
   for (const auto &block : blocks) {
      std::cout << "x: " << block.getX() << ", y: " << block.getY() << ", health: " << block.getHealth() << std::endl;
   }

   blocks.clear();
}
}