#ifndef ENGINE_H
#define ENGINE_H

#include "physics.h"
#include <vector>

struct NativeBlock {
    float x;
    float y;
    float w;
    float h;
    int col;
    int row;
    int health;
    int initialHealth;
    bool isDead;
    float hitAnim;
    int counter;
    int portalPairIndex; // -1 if unlinked
    int portalPairId;
    int portalRechargeTimer;
};

struct NativeBall {
    float x;
    float y;
    float prevX;
    float prevY;
    float vx;
    float vy;
    float radius;
    float speed;
    float baseSpeed;
    bool isActive;
    bool isMega;
    int warpCooldown;
    int paddleCooldown;
    int lastHitBlockIndex;
    int lastHitBlockCooldown;
};

struct NativePaddle {
    float x;
    float y;
    float width;
    float height;
    float vx;
    float prevX;
    float targetX;
    float maxSpeed;
};

struct NativeEvent {
    int type; // 1: wall, 2: paddle, 3: block_damage, 4: block_destroy, 5: ball_lost, 6: portal_warp, 7: emp_explode, 8: shield_bounce, 9: crit_damage, 10: powerup_collect
    int blockIndex;
    float hitX;
    float hitY;
    int combo;
    int source; // 0: ball, 1: emp, 2: laser
    float epicenterX;
    float epicenterY;
};

class BreakoutEngine {
public:
    float worldWidth;
    float worldHeight;
    float blockWidth;
    float blockHeight;

    NativePaddle paddle;
    std::vector<NativeBall> balls;
    std::vector<NativeBlock> blocks;
    std::vector<NativeEvent> events;

    int remainingBreakable;
    int combo;
    bool hasShield;
    bool isMegaBall;
    int ballImpactLevel;
    float baseBallRadius;
    float baseBallSpeed;

    BreakoutEngine();

    void init(float width, float height, float padW, float padH, float ballR, float speed, float blockW, float blockH);
    void loadBlocks(const int* data, int count, float blockW, float blockH);
    void pairPortals();
    void resetBall(float x, float y, float vx, float vy);
    void setPaddleTarget(float targetX);
    void setModifiers(int shieldActive, int megaActive, int impactLvl, float maxPadSpeed);
    void spawnExtraBalls(int count);
    void update(int substeps);

    void damageBlock(int blockIndex, int damage);
    bool resolvePaddleBounce(NativeBall& ball, float halfPadW, float prevBallY);
    int handlePortalCollision(NativeBall& ball, NativeBlock& block, int blockIdx);
    void detonateEmpReactor(int blockIdx);

    int getEventCount() const { return (int)events.size(); }
    void clearEvents() { events.clear(); }
};

#endif // ENGINE_H
