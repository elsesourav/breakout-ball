class Ball {
   constructor(x, y, r, speed) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.s = speed;
      this.px = this.x;
      this.py = this.y;
      this.vx = speed * Math.random(-1, 1);
      this.vy = -speed * (Math.random() > 0.5 ? 1 : -1);
   }

   draw(ctx) {
      ctx.fillStyle = "#ffffff77";
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);

      ctx.fillStyle = "#ffffff";
      ctx.arc(this.x, this.y, this.r - this.r * 0.2, 0, Math.PI * 2, false);
   }

   update() {
      this.px = this.x;
      this.py = this.y;
      this.x += this.vx;
      this.y += this.vy;
   }
}
