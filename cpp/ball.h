#ifndef BALL_H
#define BALL_H

typedef void (*DrawBallPtr)(float, float, short);

class Ball {
public:
   void init(float x, float y, short r,  float speed);
   void draw(DrawBallPtr drawBall);
   void update();

private:
   short r;
   float x, y, vx, vy, speed;
};

#endif // BALL_H
