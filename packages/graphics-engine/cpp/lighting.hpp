#ifndef LIGHTING_HPP
#define LIGHTING_HPP

#include "particle.hpp"
#include <cmath>

struct LightEmitter {
    float x, y;
    float r, g, b;
    float intensity;
    float radius;
    int active;
};

inline void apply_lighting(WebGLVertex& v, const Particle& p, const LightEmitter& light) {
    if (!light.active) return;
    float dx = p.x - light.x;
    float dy = p.y - light.y;
    float distSq = dx * dx + dy * dy;
    float rSq = light.radius * light.radius;

    if (distSq < rSq) {
        float dist = sqrtf(distSq);
        float atten = (1.0f - dist / light.radius) * light.intensity;
        v.r = fminf(1.0f, v.r + light.r * atten);
        v.g = fminf(1.0f, v.g + light.g * atten);
        v.b = fminf(1.0f, v.b + light.b * atten);
    }
}

#endif // LIGHTING_HPP
