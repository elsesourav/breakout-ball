#include "./game.h"
#include <array>
#include <emscripten/emscripten.h>
#include <string>
#include <iostream>
#include <vector>

short ROWS, COLS, SIZE, BLOCK_WIDTH, BLOCK_HEIGHT, WIDTH, HEIGHT;
Game game;

EM_JS(void, clearCanvas, (short w, short h), {
   ctx.globalAlpha = 0.2;
   ctx.fillStyle = "#000";
   ctx.fillRect(0, 0, w, h);
   ctx.globalAlpha = 1;
});
EM_JS(void, drawBall, (float x, float y, short r), {
   ctx.drawImage(ballImage, x - r, y - r, r * 2, r * 2);
});
EM_JS(void, drawPaddle, (float x, float y, short w, short h), {
   ctx.drawImage(paddleImage, x - w / 2, y, w, h);
});
EM_JS(void, drawParticle, (float x, float y, float s, float alpha, short colorIndex), {
   ctx.globalAlpha = alpha;
   ctx.fillStyle = blockImages[colorIndex].stroke;
   ctx.fillRect(x, y, s, s);
   ctx.globalAlpha = 1;
});
EM_JS(void, drawStar, (float x, float y, float s, float alpha), {
   ctx.globalAlpha = alpha;
   ctx.fillStyle = "#FFF";
   ctx.fillRect(x, y, s, s);
   ctx.globalAlpha = 1;
});
EM_JS(void, drawGlow, (float x, float y, float s, float alpha, short colorIndex), {
   ctx.globalAlpha = alpha;
   ctx.fillStyle = glowColors[colorIndex];
   ctx.fillRect(x, y, s, s);
   ctx.globalAlpha = 1;
});
EM_JS(void, drawBlock, (float x, float y, short w, short h, short health), {
   if (health > 0)
      ctx.drawImage(blockImages[health - 1].image, x, y, w, h);
});
EM_JS(void, drawLava, (float x, float y, float w, float h), {
   ctx.fillStyle = "#f00";
   ctx.fillRect(x, y, w, h);
   ctx.fillStyle = "#ff03";
   ctx.fillRect(x, y, w, h / 6);
   ctx.fillStyle = "#00000005";
   ctx.fillRect(x, y + h / 2, w, h / 2);
});

extern "C" {

EMSCRIPTEN_KEEPALIVE void init(short rows, short cols, short size, char *level, float padX, float padY, short padW, short padH, short ballR, float BallSpeed) {
   ROWS = rows;
   COLS = cols;
   SIZE = size;
   BLOCK_WIDTH = SIZE;
   BLOCK_HEIGHT = SIZE / 4 * 3;
   WIDTH = SIZE * 9;
   HEIGHT = SIZE * 16;

   game.blocks.clear();
   game.stars.clear();
   game.paddle.glows.clear();
   game.lava.glows.clear();
   game.init(WIDTH, HEIGHT, SIZE, level, padX, padY, padW, padH, padX, padY - ballR, ballR, BallSpeed, BLOCK_WIDTH, BLOCK_HEIGHT);
}

EMSCRIPTEN_KEEPALIVE void update() {
   game.update();
}
EMSCRIPTEN_KEEPALIVE void draw() {
   game.draw(drawBall, drawPaddle, drawBlock, drawParticle, drawStar, drawGlow, drawLava, clearCanvas);
}
EMSCRIPTEN_KEEPALIVE void moveLeft() {
   game.paddle.moveLeft();
}
EMSCRIPTEN_KEEPALIVE void moveRight() {
   game.paddle.moveRight();
}
EMSCRIPTEN_KEEPALIVE float moveTarget(float tx) {
   return game.paddle.moveTarget(tx);
}
EMSCRIPTEN_KEEPALIVE float moveDirect(float x) {
   return game.paddle.moveDirect(x);
}
}