#ifndef ENGINE_HPP
#define ENGINE_HPP

#include "particle.hpp"
#include "physics.hpp"
#include "lighting.hpp"
#include "contour.hpp"

#define MAX_SHOCKWAVES 8
#define MAX_LIGHTS 4

class GraphicsEngine {
public:
    float width;
    float height;
    int maxParticles;
    int particleCount;

    Particle* particles;
    WebGLVertex* vertexBuffer;

    Shockwave shockwaves[MAX_SHOCKWAVES];
    LightEmitter lights[MAX_LIGHTS];

    float cursorX;
    float cursorY;
    int cursorDown;

    float springK;
    float damping;

    GraphicsEngine(float w, float h, int maxP);
    ~GraphicsEngine();

    void init();
    void update(float dt);
    void addBurst(float x, float y, float radius, float force);
    void setCursor(float x, float y, int isDown);

    WebGLVertex* getVertexBuffer() const { return vertexBuffer; }
    int getVertexCount() const { return particleCount; }
};

#endif // ENGINE_HPP
