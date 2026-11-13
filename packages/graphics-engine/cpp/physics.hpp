#ifndef PHYSICS_HPP
#define PHYSICS_HPP

#include "particle.hpp"
#include <cmath>

inline void update_physics(Particle& p, float dt, float springK, float damping) {
    // 1. Hooke's Law elastic return force
    float dx = p.originX - p.x;
    float dy = p.originY - p.y;
    float fx = dx * springK;
    float fy = dy * springK;

    // 2. Viscous damping against current velocity
    fx -= p.vx * damping;
    fy -= p.vy * damping;

    // 3. Symplectic Euler integration
    p.vx += (fx / p.mass) * dt;
    p.vy += (fy / p.mass) * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
}

inline void apply_shockwave(Particle& p, const Shockwave& sw) {
    if (!sw.active) return;
    float dx = p.x - sw.x;
    float dy = p.y - sw.y;
    float distSq = dx * dx + dy * dy;
    float r = sw.radius;

    // Evaluate proximity to the shockwave perimeter shell
    float ringThickness = 32.0f;
    float dist = sqrtf(distSq);
    float diff = fabsf(dist - r);

    if (diff < ringThickness && dist > 0.001f) {
        float factor = (1.0f - diff / ringThickness) * (sw.force / (1.0f + r * 0.02f));
        float nx = dx / dist;
        float ny = dy / dist;
        p.vx += nx * factor;
        p.vy += ny * factor;
    }
}

inline void apply_cursor_force(Particle& p, float cursorX, float cursorY, float radius, float force, bool isRepel) {
    float dx = p.x - cursorX;
    float dy = p.y - cursorY;
    float distSq = dx * dx + dy * dy;
    float rSq = radius * radius;

    if (distSq < rSq && distSq > 0.001f) {
        float dist = sqrtf(distSq);
        float factor = (1.0f - dist / radius) * force;
        float nx = dx / dist;
        float ny = dy / dist;

        if (isRepel) {
            p.vx += nx * factor;
            p.vy += ny * factor;
        } else {
            p.vx -= nx * factor;
            p.vy -= ny * factor;
        }
    }
}

#endif // PHYSICS_HPP
