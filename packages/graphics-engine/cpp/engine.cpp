#include "engine.hpp"
#include <cstdlib>
#include <cstring>
#include <cmath>

GraphicsEngine::GraphicsEngine(float w, float h, int maxP)
    : width(w), height(h), maxParticles(maxP), particleCount(0),
      cursorX(-1000.0f), cursorY(-1000.0f), cursorDown(0),
      springK(42.0f), damping(4.5f)
{
    particles = new Particle[maxParticles];
    vertexBuffer = new WebGLVertex[maxParticles];

    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        shockwaves[i].active = 0;
    }
    for (int i = 0; i < MAX_LIGHTS; i++) {
        lights[i].active = 0;
    }
}

GraphicsEngine::~GraphicsEngine() {
    delete[] particles;
    delete[] vertexBuffer;
}

void GraphicsEngine::init() {
    // Generate particle field with cyber/arcade neon palette
    float spacing = 14.0f;
    int cols = static_cast<int>(width / spacing);
    int rows = static_cast<int>(height / spacing);

    particleCount = 0;
    for (int r = 0; r < rows && particleCount < maxParticles; r++) {
        for (int c = 0; c < cols && particleCount < maxParticles; c++) {
            float ox = (c + 0.5f) * spacing;
            float oy = (r + 0.5f) * spacing;

            Particle& p = particles[particleCount];
            p.originX = ox;
            p.originY = oy;
            p.x = ox + (static_cast<float>(rand() % 200 - 100) * 0.1f);
            p.y = oy + (static_cast<float>(rand() % 200 - 100) * 0.1f);
            p.vx = 0.0f;
            p.vy = 0.0f;
            p.mass = 1.0f + static_cast<float>(rand() % 100) * 0.01f;
            p.size = 2.5f + static_cast<float>(rand() % 30) * 0.1f;

            // Palette gradient (cyan -> purple -> magenta arcade glow)
            float t = (ox / width + oy / height) * 0.5f;
            p.r = 0.1f + 0.8f * t;
            p.g = 0.6f + 0.4f * (1.0f - t);
            p.b = 0.95f;
            p.a = 0.75f + static_cast<float>(rand() % 25) * 0.01f;

            particleCount++;
        }
    }
}

void GraphicsEngine::addBurst(float x, float y, float radius, float force) {
    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        if (!shockwaves[i].active) {
            shockwaves[i].x = x;
            shockwaves[i].y = y;
            shockwaves[i].radius = 1.0f;
            shockwaves[i].maxRadius = radius;
            shockwaves[i].force = force;
            shockwaves[i].active = 1;
            break;
        }
    }
}

void GraphicsEngine::setCursor(float x, float y, int isDown) {
    cursorX = x;
    cursorY = y;
    cursorDown = isDown;
}

void GraphicsEngine::update(float dt) {
    // 1. Update active shockwaves
    for (int i = 0; i < MAX_SHOCKWAVES; i++) {
        if (shockwaves[i].active) {
            shockwaves[i].radius += (shockwaves[i].maxRadius - shockwaves[i].radius) * 7.5f * dt;
            if (shockwaves[i].radius >= shockwaves[i].maxRadius * 0.95f) {
                shockwaves[i].active = 0;
            }
        }
    }

    // 2. Physics & Vertex Streaming Loop
    float cursorRadius = cursorDown ? 140.0f : 80.0f;
    float cursorStrength = cursorDown ? 380.0f : 160.0f;

    for (int i = 0; i < particleCount; i++) {
        Particle& p = particles[i];

        // Apply shockwaves
        for (int s = 0; s < MAX_SHOCKWAVES; s++) {
            if (shockwaves[s].active) {
                apply_shockwave(p, shockwaves[s]);
            }
        }

        // Apply cursor interaction
        if (cursorX >= 0.0f && cursorY >= 0.0f) {
            apply_cursor_force(p, cursorX, cursorY, cursorRadius, cursorStrength, true);
        }

        // Apply Hooke's Law spring return with damping
        update_physics(p, dt, springK, damping);

        // Stream to flat WebGLVertex POD buffer
        WebGLVertex& v = vertexBuffer[i];
        v.x = p.x;
        v.y = p.y;
        v.r = p.r;
        v.g = p.g;
        v.b = p.b;
        v.a = p.a;
        v.size = p.size;
    }
}

// ==========================================
// Standalone WebAssembly C-ABI Exports
// ==========================================
extern "C" {

GraphicsEngine* engine_create(float width, float height, int maxParticles) {
    return new GraphicsEngine(width, height, maxParticles);
}

void engine_init(GraphicsEngine* engine) {
    if (engine) engine->init();
}

void engine_update(GraphicsEngine* engine, float dt) {
    if (engine) engine->update(dt);
}

void engine_add_burst(GraphicsEngine* engine, float x, float y, float radius, float force) {
    if (engine) engine->addBurst(x, y, radius, force);
}

void engine_set_cursor(GraphicsEngine* engine, float x, float y, int isDown) {
    if (engine) engine->setCursor(x, y, isDown);
}

WebGLVertex* engine_get_vertex_buffer(GraphicsEngine* engine) {
    return engine ? engine->getVertexBuffer() : nullptr;
}

int engine_get_vertex_count(GraphicsEngine* engine) {
    return engine ? engine->getVertexCount() : 0;
}

void engine_destroy(GraphicsEngine* engine) {
    if (engine) delete engine;
}

}
