#ifndef PADDLE_H
#define PADDLE_H

typedef void (*DrawPaddlePtr)(float, float, short, short);

class Paddle {
public:
   short w, h;
   float x, y, tx, ty, v, deltaMove, windowWidth, percentage, movePercentage;
   bool isPointerLock;

   void init(float x, float y, short w, short h, float ballSpeed, short windowWidth);
   void draw(DrawPaddlePtr drawPaddle);
   void update();
   void moveLeft();
   void moveRight();
   float moveTarget(float tx);
};

#endif // PADDLE_H
