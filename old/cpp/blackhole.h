#ifndef OLD_BLACKHOLE_H
#define OLD_BLACKHOLE_H

#include "./glow.h"
#include <iostream>
#include <vector>
#include <cmath>

typedef void (*DrawBlackHolePtr)(float, float, float, float, float);
typedef void (*DrawSingularityGlowPtr)(float, float, float, float, short colorIndex);

struct OldSingularityStar {
    float x;
    float y;
    float speed;
    float alpha;
};

class BlackHole {
public:
    float x, y, w, h;
    float centerX, centerY;
    float horizonRadius;
    float animTick;
    std::vector<Glow> plasmaGlows;

    void init(float _x, float _y, short _w, short _h, float speed);
    void draw(DrawBlackHolePtr drawHole, DrawSingularityGlowPtr drawGlow);
    void update(float dt);
    void applySuction(OldSingularityStar& star, float screenW, float screenH);
};

#endif // OLD_BLACKHOLE_H
