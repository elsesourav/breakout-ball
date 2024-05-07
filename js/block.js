class Block {
   constructor(x, y, w, h, health, images) {
      this.x = x;
      this.y = y;
      this.dx = x * w;
      this.dy = y * h;
      this.w = w;
      this.h = h;
      this.top = y * h;
      this.bottom = y * h + h;
      this.left = x * w;
      this.right = x * w + w;
      this.images = images;
      this.health = health - 1;
      this.isVisible = true;
      this.isCompleted = false;
      this.particles = [];
   }

   #setParticle(gap) {
      const { x, y, w, h } = this;
      const offset = 2 + 0.5 * 6;

      for (let i = offset; i < h - offset * 2; i += gap) {
         for (let j = offset; j < w - offset * 2; j += gap) {
            const px = x * w + j;
            const py = y * h + i;
            const size = Math.ceil(Math.random() * gap);
            this.particles.push(
               new Particle(px, py, size, this.images[this.health + 1].color)
            );
         }
      }
   }

   damage() {
      if (this.health === this.images.length - 1) return;
      this.health--;
      if (this.health < 0) {
         this.isVisible = false;
         this.#setParticle(this.w / 8);
      } else {
         this.#setParticle(this.w / 4);
      }
   }

   drawOutline(ctx) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.rect(this.dx, this.dy, this.w, this.h);
      ctx.stroke();
   }

   majorUpdate() {
      for (let i = 0; i < this.particles.length; i++) {
         if (this.particles[i] && !this.particles[i].isVisible) {
            this.particles.splice(i--, 1);
         }
      }

      if (!this.isVisible && this.particles.length == 0) {
         this.isCompleted = true;
      }
   }

   draw(ctx) {
      if (this.isVisible) {
         ctx.drawImage(
            this.images[this.health].image,
            this.dx,
            this.dy,
            this.w,
            this.h
         );
      }
      this.particles.forEach((particle) => {
         if (particle) {
            particle.draw(ctx);
            particle.update();
         }
      });
   }
}
