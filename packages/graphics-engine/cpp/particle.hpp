#ifndef PARTICLE_HPP
#define PARTICLE_HPP

#include <cmath>

// POD Vertex structure aligned for WebGL gl.bufferSubData streaming
// 7 floats = 28 bytes per point sprite
struct WebGLVertex {
    float x;      // World X coordinate
    float y;      // World Y coordinate
    float r;      // Red channel [0.0 .. 1.0]
    float g;      // Green channel [0.0 .. 1.0]
    float b;      // Blue channel [0.0 .. 1.0]
    float a;      // Alpha channel [0.0 .. 1.0]
    float size;   // Per-particle point size in pixels
};

// Internal particle state representation
struct Particle {
    float originX, originY;  // Home anchor position
    float x, y;              // Current position
    float vx, vy;            // Velocity vector
    float r, g, b, a;        // Base pigment
    float mass;              // Inertia weight
    float size;              // Visual footprint
};

// Radial shockwave representation
struct Shockwave {
    float x, y;
    float radius;
    float maxRadius;
    float force;
    int active;
};

#endif // PARTICLE_HPP
