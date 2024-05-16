#ifndef PADDLE_H
#define PADDLE_H

typedef void (*DrawPaddlePtr)(float, float, short, short);

class Paddle {
public:
   void init(float x, float y, short w, short h);
   void draw(DrawPaddlePtr drawPaddle);
   void update();

private:
   short w, h;
   float x, y, tx, ty;
   float percentage = 0.3f;
   bool isPointerLock = false;
};

#endif // PADDLE_H
