#include "block.hpp"
#include <emscripten.h>

extern "C" {
extern void drawBlocks(short health, float x, float y, short w, short h);


Block::Block(short j, short i, short w, short h, short health) : x(i * w), y(j * h), isVisible(false), isCompleted(false), health(health - 1) {}

void Block::damage() {
   // if (health == images.size() - 1)
   //    return;
   // health--;
   // if (health < 0) {
   //    isVisible = false;
   //    setParticle(w / 8);
   // } else {
   //    setParticle(w / 4);
   // }
}

// void Block::setParticle(float gap) {
//    const float offset = 2 + 0.5 * 6;
//    for (float i = offset; i < h - offset * 2; i += gap) {
//       for (float j = offset; j < w - offset * 2; j += gap) {
//          float px = x * w + j;
//          float py = y * h + i;
//          float size = std::ceil(std::rand() / (RAND_MAX + 1.0) * gap);
//          particles.push_back(Particle(px, py, size, images[health + 1].color));
//       }
//    }
// }

void Block::majorUpdate() {
   // for (int i = 0; i < particles.size(); i++) {
   //    if (!particles[i].isVisible()) {
   //       particles.erase(particles.begin() + i);
   //       i--;
   //    }
   // }

   // if (!isVisible && particles.size() == 0) {
   //    isCompleted = true;
   // }
}

void Block::drawOutline() {
   // ctx.lineWidth = 1;
   // ctx.strokeStyle = "#ffffff";
   // ctx.rect(dx, dy, w, h);
   // ctx.stroke();
}

void Block::draw() {
   // if (isVisible) {
   // ctx.drawImage(images[health].image, dx, dy, w, h);
   // }

   drawBlocks(health, x, y, w, h);

   // for (auto &particle : particles) {
   //    particle.draw(ctx);
   //    particle.update();
   // }
}
}