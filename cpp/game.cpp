#include "./game.h"
#include "./ball.h"
#include "./block.h"
#include "./createBlocks.h"
#include "./paddle.h"

Game::Game() {}


void Game::init(short WIDTH, short HEIGHT, short SIZE, char *level, float padX, float padY, short padW, short padH, float ballX, float ballY, short ballR, float BallSpeed) {
   WIDTH = WIDTH;
   HEIGHT = HEIGHT;
   SIZE = SIZE;
   ball.init(ballX, ballY, ballR, BallSpeed);
   paddle.init(padX, padY, padW, padH);
   blocks = parser.convertStringToBlocks(level);
}

void Game::draw(DrawBallPtr drawBall, DrawPaddlePtr drawPaddle, DrawBlockPtr drawBlock) {
   ball.draw(drawBall);
   paddle.draw(drawPaddle);
   for (int i = 0; i < blocks.size(); i++) {
      blocks[i].draw(drawBlock);
   }
}

// void Game::update() {
// }
