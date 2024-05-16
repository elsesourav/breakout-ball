#include "./game.h"
#include <array>
#include <emscripten/emscripten.h>
#include <iostream>
#include <vector>

short ROWS, COLS, SIZE, BLOCK_WIDTH, BLOCK_HEIGHT, WIDTH, HEIGHT;

EM_JS(void, drawParticle, (float x, float y, float size, float alpha, short colorIndex), {
   // colorIndex use to get block current color
   ctx.globalAlpha = alpha;
   ctx.fillStyle = "red";
   ctx.fillRect(x, y, size, size);
   ctx.globalAlpha = 1;
});

EM_JS(void, drawBall, (float x, float y, short r), {
   ctx.drawImage(ballImage, x - r, y - r, r * 2, r * 2);
});

EM_JS(void, drawPaddle, (float x, float y, short w, short h), {
   ctx.drawImage(paddleImage, x - w / 2, y, w, h);
});

EM_JS(void, drawBlock, (float x, float y, short w, short h, short health), {
   ctx.drawImage(blockImages[health - 1].image, x * w, y * h, w, h);
});



Game game;


extern "C" {

EMSCRIPTEN_KEEPALIVE void init(short rows, short cols, short size, char *level, float padX, float padY, short padW, short padH, short ballR, float BallSpeed) {
   ROWS = rows;
   COLS = cols;
   SIZE = size;
   BLOCK_WIDTH = SIZE;
   BLOCK_HEIGHT = SIZE / 4 * 3;
   WIDTH = SIZE * 9;
   HEIGHT = SIZE * 16;

   game.init(WIDTH, HEIGHT, SIZE, level, padX, padY, padW, padH, padX, padY - ballR, ballR, BallSpeed, BLOCK_WIDTH, BLOCK_HEIGHT);
   game.draw(drawBall, drawPaddle, drawBlock);
}

// EMSCRIPTEN_KEEPALIVE void setLevel(char *level) {
//    // std::cout << level << std::endl;

//    Blocks parser;
//    std::vector<Block> blocks = parser.convertStringToBlocks(level);

//    // Print the blocks
//    for (const auto &block : blocks) {
//       std::cout << "x: " << block.getX() << ", y: " << block.getY() << ", health: " << block.getHealth() << std::endl;
//    }

//    blocks.clear();
// }
}