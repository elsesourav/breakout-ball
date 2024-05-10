#include <array>
#include <emscripten.h>

#include "block.hpp"

static constexpr short COLS = 10;
static constexpr short ROWS = 9;
static constexpr short SIZE = 64;
static constexpr short BLOCK_WIDTH = SIZE;
static constexpr short BLOCK_HEIGHT = 48;
static constexpr short WIDTH = SIZE * 9;
static constexpr short HEIGHT = SIZE * 16;


// static std::array<std::array<Box, COLS>, ROWS> blocks;
Block block(2, 2, 50, 50, 2);

extern "C" {

   EMSCRIPTEN_KEEPALIVE
   void draw() {
      block.draw();
   }
}