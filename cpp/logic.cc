#include "./game.h"
#include "./levelMaker.h"
#include <emscripten/emscripten.h>
#include <iostream>

short ROWS, COLS, SIZE, BLOCK_WIDTH, BLOCK_HEIGHT, WIDTH, HEIGHT, FPS;
Game game;
LevelMaker maker;

EM_JS(void, clearCanvas, (short w, short h), {
   ctx.globalAlpha = 0.2;
   ctx.fillStyle = "#000";
   ctx.fillRect(0, 0, w, h);
   ctx.globalAlpha = 1;
});
EM_JS(void, clearCanvasWidthNoAlpha, (short w, short h), {
   ctx.clearRect(0, 0, w, h);
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
   ctx.drawImage(blockImages[health - 1].image, x, y, w, h);
});
EM_JS(void, drawBlockAlpha, (float x, float y, short w, short h, short health), {
   ctx.globalAlpha = 0.3;
   ctx.drawImage(blockImages[health - 1].image, x, y, w, h);
   ctx.globalAlpha = 1;
});
EM_JS(void, drawBlockOutline, (float x, float y, short w, short h), {
   ctx.globalAlpha = 0.3;
   ctx.lineWidth = 2;
   ctx.strokeStyle = "#fff";
   let off = 4;
   ctx.stroke(create2dRoundedRectPath(x + off, y + off, w - off * 2, h - off * 2, 15));
   ctx.globalAlpha = 1;
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
EM_JS(void, showHealth, (short health), {
   showHealths.classList = [];
   showHealths.classList.add(`s${health - 1}`);
});
EM_JS(void, showTimes, (short time), {
   showTimeUsed.innerText = time;
}); 
EM_JS(void, showCountDown, (short time), {
   showCountDowns.classList = [];
   showCountDowns.classList.add(`s${time}`);
});
EM_JS(void, showGameOver, (short time), {
   showCountDowns.classList = [];
   showCountDowns.classList.add("gameOver");
   

   setTimeout(() => {
      animation.stop();
      showCountDowns.classList = [];
      if (currentGameMode == "testing") setupPreview("testing", null, time);
      else setupPreview("playAgain", null, time);
   }, 2000);
});
EM_JS(void, showGameComplete, (short time), {
   showCountDowns.classList = [];
   showCountDowns.classList.add("gameWin");

   setTimeout(async () => {
      animation.stop();
      showCountDowns.classList = [];
      if (currentGameMode == "testing") setupPreview("testing", null, time);
      else {
         const data = await setupLevelRanking(currentPlayingLevel.id, time);
         setupPreview("playAgain", data, time);
         const info = getUserInfo();
         setupLocalLevel(info.levelsRecord);
      }

   }, 2000);
});
EM_JS(void, vibrate, (short time), {
   vibrateDevice(time);
});
 
extern "C" {

EMSCRIPTEN_KEEPALIVE void setup(short width, short height, short size, float padX, float padY, short padW, short padH, short ballR, float ballSpeed, short _FPS) {
   SIZE = size;
   BLOCK_WIDTH = size;
   BLOCK_HEIGHT = size / 4 * 3;
   WIDTH = width;
   HEIGHT = height;
   FPS = _FPS;
   game.setup(WIDTH, HEIGHT, size, padX, padY, padW, padH, padX, padY - ballR, ballR, ballSpeed, BLOCK_WIDTH, BLOCK_HEIGHT, FPS, drawBall, drawPaddle, drawBlock, drawParticle, drawStar, drawGlow, drawLava, clearCanvas, clearCanvasWidthNoAlpha, showHealth, showTimes, showCountDown, showGameOver, showGameComplete, vibrate);
}
EMSCRIPTEN_KEEPALIVE void init(int *array, int length) {
   game.init(array, length);
}
EMSCRIPTEN_KEEPALIVE void update() {
   game.update();
}
EMSCRIPTEN_KEEPALIVE void draw() {
   game.draw();
}
EMSCRIPTEN_KEEPALIVE void moveLeft() {
   game.paddle.moveLeft();
}
EMSCRIPTEN_KEEPALIVE void moveRight() {
   game.paddle.moveRight();
}
EMSCRIPTEN_KEEPALIVE float moveTarget(float tx) {
   if (game.gamePose) {
      return 0;
   } else {
      return game.paddle.moveTarget(tx);
   }
}
EMSCRIPTEN_KEEPALIVE float moveDirect(float x) {
   return game.paddle.moveDirect(x);
}
EMSCRIPTEN_KEEPALIVE void drawBlockOnly() {
   game.drawBlockOnly();
}
EMSCRIPTEN_KEEPALIVE void drawOutline(float x) {
   drawLine(ROWS, COLS, BLOCK_WIDTH, BLOCK_HEIGHT);
}

EMSCRIPTEN_KEEPALIVE void makerSetup(short rows, short cols, short width, short height, short size) {
   maker.setup(rows, cols, width, height, size, size, size / 4 * 3, drawBlock, drawBlockAlpha, drawBlockOutline, clearCanvas);
}
EMSCRIPTEN_KEEPALIVE void makerInit(int *array, int length) {
   maker.init(array, length);
}
EMSCRIPTEN_KEEPALIVE void makerDraw() {
   maker.draw();
}
EMSCRIPTEN_KEEPALIVE void makerAddBlock(short j, short i, short health) {
   maker.addBlock(j, i, health);
}
EMSCRIPTEN_KEEPALIVE void makerRemoveBlock(short j, short i) {
   maker.removeBlock(j, i);
}
EMSCRIPTEN_KEEPALIVE void makerHoverBlock(short j, short i, short health) {
   maker.hoverBlock(j, i, health);
}
EMSCRIPTEN_KEEPALIVE void processArray(int *array, int len) {

   for (int i = 0; i < len; ++i) {
      std::cout << "array[" << i << "] = " << array[i] << std::endl;
   }
    
}


}