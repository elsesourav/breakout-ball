#include "./blackhole.h"
#include "./random.h"

void BlackHole::init(float _x, float _y, short _w, short _h, float speed) {
    x = _x;
    y = _y;
    w = _w;
    h = _h;
    centerX = x + w * 0.5f;
    centerY = y + h * 0.4f;
    horizonRadius = 38.0f;
    animTick = 0.0f;

    plasmaGlows.clear();
    short numGlows = 28;
    for (short i = 0; i < numGlows; i++) {
        float size = rnd(2.0f, 7.0f);
        float offX = rnd(-w * 0.45f, w * 0.45f);
        float offY = rnd(-h * 0.3f, h * 0.4f);
        short colorIndex = (int)rnd(0.0f, 4.0f);
        plasmaGlows.push_back(Glow(offX, offY, size, speed * 0.2f, speed * 0.6f, &centerX, &centerY, w, h, colorIndex));
    }
}

void BlackHole::draw(DrawBlackHolePtr drawHole, DrawSingularityGlowPtr drawGlow) {
    if (drawHole) {
        drawHole(centerX, centerY, w, h, animTick);
    }
    for (auto &glow : plasmaGlows) {
        glow.draw(drawGlow);
    }
}

void BlackHole::update(float dt) {
    animTick += dt;
    for (auto &glow : plasmaGlows) {
        glow.update();
    }
}

void BlackHole::applySuction(OldSingularityStar& star, float screenW, float screenH) {
    float dx = centerX - star.x;
    float dy = centerY - star.y;
    float dist = std::sqrt(dx * dx + dy * dy);

    star.y += star.speed * 0.75f;

    if (dist > 5.0f) {
        float pull = std::min(4.0f, 3200.0f / (dist * dist + 1000.0f));
        float dirX = dx / dist;
        float dirY = dy / dist;
        float tanX = -dirY;
        float tanY = dirX;

        star.x += dirX * pull * 1.5f + tanX * pull * 0.7f;
        star.y += dirY * pull * 1.5f + tanY * pull * 0.7f;
    }

    if (dist < horizonRadius || star.y > screenH + 15.0f) {
        star.y = -15.0f;
        star.x = rnd(0.0f, screenW);
    }
}
