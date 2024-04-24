class Block {
   constructor(x, y, w, h, health, onlyOutline = false) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.r = 6;
      this.health = health - 1;
      this.onlyOutline = onlyOutline;
      this.isDestroyed = false;
      this.isComplete = false;
      this.colors = [
         ["#00bcb9", "#4ffffc"],
         ["#bfc200", "#fcff59"],
         ["#00d00e", "#3bff48"],
         ["#8c00ff", "#af4eff"],
         ["#ff005d", "#ff4e8f"],
         ["#ffffff", "#ffffff"],
      ];
      this.path = [];
      this.#setupPath();
      this.particles = [];
   }

   setHealth(health) {
      this.health = health - 1;
   }

   setOnlyOutline(onlyOutline) {
      this.onlyOutline = onlyOutline;  
   }

   #setupPath() {
      const { x, y, w, h, r } = this;
      const offset = 2 + 0.5 * (6 - this.health);
      const X = x * w + offset;
      const Y = y * h + offset;
      const W = w - 2 * offset;
      const H = h - 2 * offset;

      const path1 = create2dRoundedRectPath(X, Y, W, H, r);
      
      const inOffset = 3;
      const inX = X + inOffset;
      const inY = Y + inOffset;
      const inW = W - inOffset * 2;
      const inH = H / 1.5 - inOffset * 2;
      
      const path2 = create2dRoundedRectPath(inX, inY, inW, inH, r);

      this.path = [path1, path2];
   }

   #setParticle(gap) {
      const { x, y, w, h } = this;
      const offset = 2 + 0.5 * 6;

      for (let i = offset; i < h - offset * 2; i += gap) {
         for (let j = offset; j < w - offset * 2; j += gap) {
            const px = x * w + j;
            const py = y * h + i;
            this.particles.push(new Particle(px, py, 1, this.colors[0][0]));
         }
      }
   }

   damage() {
      if (this.health === this.colors.length - 2) return;

      this.health--;
      if (this.health < 0) {
         this.isDestroyed = true;
         this.health = 0;
         this.#setParticle(2);
      } else {
         this.#setParticle(4);
      }
      this.#setupPath();
   }


   drawOutline(ctx) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke(this.path[0]);
   }

   draw(ctx) {
      if (!this.isDestroyed) {
         const [color, stroke] = this.colors[this.health];

         ctx.lineWidth = 2;
         ctx.strokeStyle = stroke;
         ctx.stroke(this.path[0]);

         ctx.fillStyle = color;
         ctx.fill(this.path[0]);

         ctx.fillStyle = "#fff4";
         ctx.fill(this.path[1]);
      
      } else {
         this.particles.forEach((particle) => {
            particle.draw(ctx);
            particle.update();
         });
         this.particles = this.particles.filter(
            (particle) => !particle.isDestroyed
         );

         if (this.health === 0 && this.particles.length === 0) {
            this.isComplete = true;
         }
      }
   }
}