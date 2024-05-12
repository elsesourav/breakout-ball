#ifndef BALL_H
#define BALL_H

typedef void (*FunctionPtr)(float, float, short);

class Ball {
public:
   Ball(float x, float y, float speed, short r);
   void draw(FunctionPtr fun);
   void update();

private:
   short r;
   float x, y, vx, vy, speed;
};

#endif // BALL_H
