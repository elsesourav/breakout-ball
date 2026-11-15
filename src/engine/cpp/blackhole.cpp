#include "blackhole.h"
#include <cstdlib>
#include <algorithm>

BlackHoleSingularity::BlackHoleSingularity()
    : centerX(0.0f),
      centerY(0.0f),
      eventHorizonRadius(36.0f),
      accretionDiskRadius(110.0f),
      gravitationalConstant(4200.0f),
      rotationSpeed(1.4f),
      animTick(0.0f) {}

void BlackHoleSingularity::init(float cx, float cy, float horizonR, float accretionR, int particleCount) {
    centerX = cx;
    centerY = cy;
    eventHorizonRadius = horizonR;
    accretionDiskRadius = accretionR;
    animTick = 0.0f;
    accretionParticles.clear();
    accretionParticles.reserve(particleCount);

    for (int i = 0; i < particleCount; ++i) {
        BlackHoleParticle p;
        p.angle = ((float)rand() / (float)RAND_MAX) * 6.2831853f;
        p.distance = horizonR + ((float)rand() / (float)RAND_MAX) * (accretionR - horizonR);
        p.speed = 1.2f + ((float)rand() / (float)RAND_MAX) * 2.2f;
        p.size = 1.5f + ((float)rand() / (float)RAND_MAX) * 3.5f;
        p.alpha = 0.3f + ((float)rand() / (float)RAND_MAX) * 0.7f;
        p.colorTone = rand() % 4;
        p.x = centerX + std::cos(p.angle) * p.distance;
        p.y = centerY + std::sin(p.angle) * (p.distance * 0.14f); // Compact horizontal accretion (no overflow)
        accretionParticles.push_back(p);
    }
}

void BlackHoleSingularity::update(float dt) {
    animTick += dt;

    for (auto& p : accretionParticles) {
        // Orbit around singularity with Keplerian-like faster speed closer to center
        float orbitRate = rotationSpeed * (accretionDiskRadius / (p.distance + 12.0f)) * dt;
        p.angle += orbitRate;

        // Inward suction drift
        p.distance -= (0.15f * p.speed) * (60.0f * dt);
        if (p.distance <= eventHorizonRadius * 0.75f) {
            // Respawn at outer edge of accretion disk
            p.distance = accretionDiskRadius * (0.85f + ((float)rand() / (float)RAND_MAX) * 0.25f);
            p.angle = ((float)rand() / (float)RAND_MAX) * 6.2831853f;
            p.alpha = 0.2f + ((float)rand() / (float)RAND_MAX) * 0.6f;
        }

        p.x = centerX + std::cos(p.angle) * p.distance;
        p.y = centerY + std::sin(p.angle) * (p.distance * 0.14f);
    }
}

void BlackHoleSingularity::applySuctionToStar(SuctionStar& star, float worldWidth, float worldHeight, float dt) {
    float dx = centerX - star.x;
    float dy = centerY - star.y;
    float distSq = dx * dx + dy * dy;
    float dist = std::sqrt(distSq);

    // Baseline downward drift
    star.y += star.speed * 0.8f * (60.0f * dt);

    if (dist > 4.0f) {
        float invDist = 1.0f / dist;
        float dirX = dx * invDist;
        float dirY = dy * invDist;

        // Swirl vortex perpendicular vector
        float tanX = -dirY;
        float tanY = dirX;

        // Gravitational acceleration G / (r^2 + softening)
        float pullForce = std::min(4.5f, gravitationalConstant / (distSq + 1400.0f));

        star.x += (dirX * pullForce * 1.8f + tanX * pullForce * 0.85f) * (60.0f * dt);
        star.y += (dirY * pullForce * 1.8f + tanY * pullForce * 0.85f) * (60.0f * dt);
    }

    // Event horizon swallow condition
    if (dist < eventHorizonRadius * 0.8f || star.y > centerY + 25.0f) {
        star.y = -10.0f - (((float)rand() / (float)RAND_MAX) * 20.0f);
        star.x = ((float)rand() / (float)RAND_MAX) * worldWidth;
        star.alpha = 0.2f + ((float)rand() / (float)RAND_MAX) * 0.7f;
    }
}
