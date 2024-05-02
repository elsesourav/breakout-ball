class Block {
   constructor(x, y, w, h, health, images, colors) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.images = images;
      this.colors = colors;
      this.health = health - 1;
      this.isVisible = true;
      this.isComplete = false;
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
            this.particles.push(new Particle(px, py, size, this.colors[this.health + 1][0]));
         }
      }
   }

   damage() {
      if (this.health === this.colors.length - 1) return;
      this.health--;
      if (this.health < 0) {
         this.isVisible = false;
         this.#setParticle(10);
      } else {
         this.#setParticle(20);
      }
   }

   drawOutline(ctx) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.rect(this.x * this.w, this.y * this.h, this.w, this.h);
      ctx.stroke();
   }

   majorUpdate() {
      this.particles = this.particles.filter((particle) => !particle.isVisible);

      if (!this.isVisible && this.particles.length == 0) {
         this.isComplete = true;
      }
   }

   draw(ctx) {
      if (this.isVisible) {
         ctx.drawImage(this.images[this.health], this.x * this.w, this.y * this.h);
      } 
      this.particles.forEach((particle) => {
         particle.draw(ctx);
         particle.update();
      });
   }
}
