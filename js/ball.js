class Ball {
   constructor(x, y, r, speed, canvas) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.s = speed;
      this.cvs = canvas;
      this.g = 0.03;
      this.vx = speed * (Math.random() * 2 - 1);
      this.vy = -speed;
   }

   collusion(angle) {
      this.vx = this.s * Math.cos(angle);
      this.vy = -this.s * Math.sin(angle);
   }

   #addPadForce() {
      this.vy = -this.s;
   }

   destroy() {
      // add particles
   }

   update(paddle, blocks) {
      const { x: padX, y: padY, w: padW, h: padH } = paddle;
      let _vx = this.vx / this.s;
      let _vy = this.vy / this.s;
      let _g = this.g / this.s;
      let i = 0;
      let isBreak = false;

      for (; i < this.s; i++) {
         // update x, y
         this.x += _vx;
         this.y += _vy;
         this.vy += _g;

         // side walls collusion detection
         if (this.x + this.r > this.cvs.width || this.x - this.r < 0) {
            isBreak = true;
            this.vx = -this.vx;
            break;
         } else if (this.y - this.r < 0) {
            isBreak = true;
            this.vy = -this.vy;
            break;

            // paddle collision detection
         } else if (
            this.y + this.r > padY &&
            this.y + this.r < padY + padH &&
            this.x + this.r > padX - padW / 2 &&
            this.x - this.r < padX + padW / 2
         ) {
            const angle = (this.x - padX) * 0.5;
            const dx = Math.sin(toRadians(angle));
            this.vx += dx;
            this.vy = -this.s;
            isBreak = true;
            break;

            // block collision detection
         } else {
            const block = blocks.find(
               ({ x, y, w, h, isVisible }) =>
                  isVisible &&
                  this.x + this.r >= x * w &&
                  this.x - this.r <= x * w + w &&
                  this.y + this.r >= y * h &&
                  this.y - this.r <= y * h + h
            );
            if (block) {
               const { x, y, w, h } = block;

               if (this.y <= y * h || this.y >= y * h + h) {
                  this.vy *= -1;
               }
               
               if (this.x <= x * w || this.x >= x * w + w) {
                  this.vx *= -1;
               }
               block.damage();
               isBreak = true;
               break;
            }
         }
      }


      if (isBreak) {
         this.x += (this.vx / this.s) * (this.s - i);
         this.y += (this.vy / this.s) * (this.s - i);
         this.vy += (this.g / this.s) * (this.s - i);
      }
   }

   draw(ctx) {
      ctx.fillStyle = "#DDDDDD";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
         this.x - this.r * 0.1,
         this.y - this.r * 0.1,
         this.r - this.r * 0.2,
         0,
         Math.PI * 2,
         false
      );
      ctx.fill();
      ctx.closePath();
   }
}
