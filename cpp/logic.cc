#include "./game.h"
#include <array>
#include <emscripten/emscripten.h>
#include <iostream>
#include <string>
#include <vector>

short ROWS, COLS, SIZE, BLOCK_WIDTH, BLOCK_HEIGHT, WIDTH, HEIGHT, FPS, padW, padH, ballR;
float padX, padY, ballSpeed;
short totalFrameCount = 0;
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
EM_JS(void, drawLine, (short rows, short cols, short w, short h), {
   ctx.strokeStyle = "#fff";
   for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
         ctx.beginPath();
         ctx.lineWidth = 2;
         ctx.rect(j * w + 2, i * h + 2, w - 4, h - 4);
         ctx.stroke();
      }
   }
});

extern "C" {



EMSCRIPTEN_KEEPALIVE void setup(short rows, short cols, short size, float _padX, float _padY, short _padW, short _padH, short _ballR, float _ballSpeed, short _FPS) {
   ROWS = rows;
   COLS = cols;
   SIZE = size;
   BLOCK_WIDTH = SIZE;
   BLOCK_HEIGHT = SIZE / 4 * 3;
   WIDTH = SIZE * 9;
   HEIGHT = SIZE * 16;
   padX = _padX;
   padY = _padY;
   padW = _padW;
   padH = _padH;
   ballR = _ballR;
   ballSpeed = _ballSpeed;
   FPS = _FPS;
}
EMSCRIPTEN_KEEPALIVE void init(char *level) {
   game.blocks.clear();
   game.stars.clear();
   game.paddle.glows.clear();
   game.lava.glows.clear();
   totalFrameCount = 0;
   game.init(WIDTH, HEIGHT, SIZE, level, padX, padY, padW, padH, padX, padY - ballR, ballR, ballSpeed, BLOCK_WIDTH, BLOCK_HEIGHT);
}

EMSCRIPTEN_KEEPALIVE void update() {
   game.update();
   totalFrameCount++;
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
EMSCRIPTEN_KEEPALIVE void drawOutline(float x) {
   drawLine(ROWS, COLS, BLOCK_WIDTH, BLOCK_HEIGHT);
}
EMSCRIPTEN_KEEPALIVE short getTotalTime(float x) {
   return totalFrameCount / FPS;
}
}