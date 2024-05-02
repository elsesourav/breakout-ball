class Particle {
   constructor(x, y, size, color) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.gravity = 0.05;
      this.friction = 0.99;
      this.speedX = Math.random() * 5 - 3;
      this.speedY = Math.random() * 5 - 3;
      this.alpha = Math.random() * 2;
      this.isVisible = false;
   }

   update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity -= 0.01;
      this.speedX *= this.friction;
      this.speedY *= this.friction;
      this.speedY += this.gravity;
      this.alpha -= 0.02;
      if (this.alpha < 0.02) {
         this.isVisible = true;
         this.alpha = 0;
      }
   }

   draw(ctx) {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.globalAlpha = 1;
   }
}
