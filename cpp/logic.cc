#include <emscripten/emscripten.h>
#include "./particle.h"
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
}