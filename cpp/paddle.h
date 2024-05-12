#ifndef PADDLE_H
#define PADDLE_H

typedef void (*FunctionPtr)(float, float, short, short);

class Paddle {
public:
   Paddle(float x, float y, short w, short h);
   void draw(FunctionPtr fun);
   void update();

private:
   short w, h;
   float x, y, tx, ty;
   float percentage = 0.3f;
   bool isPointerLock = false;
};

#endif // PADDLE_H
