class Ball {
   constructor(x, y, r, speed, setupLevel, onlyY = true) {
      this.x = x;
      this.y = y;
      this.fr = r;
      this.r = r;
      this.px = this.x;
      this.py = this.y;
      this.s = speed;
      this.speed = this.s / 5;
      this.vx = this.speed * random(-1, 1);
      this.vy = onlyY ? -this.speed : -this.speed * (random() > 0.5 ? 1 : -1);
      this.setupLevel = setupLevel;
      this.lastPowerUse;
      this.color = "#ffffff";
   }

   draw() {
      ctx.fillStyle = color;
      strokeStyle(255, 255, 0, 1);
      arc(this.x, this.y, this.r + 4, true, 1);
   }

   update() {
      for (let i = 0; i < 30; i++) {
         this.px = this.x;
         this.py = this.y;
         this.x += this.vx;
         this.y += this.vy;
         this.setupLevel && this.setupLevel.collision();
      }
   }
}