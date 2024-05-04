class Ball {
   constructor(x, y, r, speed, canvas, blockW, blockH) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.dr = r + 2;
      this.s = speed;
      this.cvs = canvas;
      this.blockW = blockW;
      this.blockH = blockH;
      this.g = 0.03;
      this.vx = speed * (Math.random() * 2 - 1);
      this.vy = -speed;
      this.nearest = [
         [-1, -1, blockW, blockH],
         [0, -1, 0, blockH],
         [1, -1, r, blockH],
         [-1, 0, blockW, 0],
         [1, 0, this.r, 0],
         [-1, 1, blockW, this.r],
         [0, 1, 0, this.r],
         [1, 1, this.r, this.r],
      ];
   }

   collusion(angle) {
      this.vx = this.s * Math.cos(angle);
      this.vy = -this.s * Math.sin(angle);
   }

   destroy() {
      // add particles
   }

   blockCollision({ x, y, w, h, isVisible }) {
      return (
         isVisible &&
         this.x + this.r >= x * w &&
         this.x - this.r <= x * w + w &&
         this.y + this.r >= y * h &&
         this.y - this.r <= y * h + h
      );
   }

   paddleCollision({ x, y, w, h }) {
      return (
         this.y + this.r > y &&
         this.y + this.r < y + h &&
         this.x + this.r > x - w / 2 &&
         this.x - this.r < x + w / 2
      );
   }

   xWallCollision() {
      return this.x + this.r > this.cvs.width || this.x - this.r < 0;
   }

   topWallCollision() {
      return this.y - this.r < 0;
   }

   update(paddle, blocks) {
      const _vx = this.vx / this.s;
      const _vy = this.vy / this.s;
      let i = 0;

      for (; i < this.s; i++) {
         this.x += _vx;
         this.y += _vy;

         // side walls collusion detection
         if (this.xWallCollision()) {
            this.vx = -this.vx;
            break;
         } else if (this.topWallCollision()) {
            this.vy = -this.vy;
            break;

            // paddle collision detection
         } else if (this.paddleCollision(paddle)) {
            const angle = (this.x - paddle.x) * 0.5;
            const dx = Math.sin(toRadians(angle));
            this.vx += dx;
            this.vy = -this.s;
            paddle.hit();
            break;

            // block collision detection
         } else {
            const x = Math.floor(this.x / this.blockW);
            const y = Math.floor(this.y / this.blockH);

            const collisionBlocks = [];
            this.nearest.forEach(([ofx, ofy, dx, dy]) => {
               if (
                  blocks[y + ofy] &&
                  blocks[y + ofy][x + ofx] &&
                  this.blockCollision(blocks[y + ofy][x + ofx])
               ) {
                  const block = blocks[y + ofy][x + ofx];

                  collisionBlocks.push({
                     ofx: ofx,
                     ofy: ofy,
                     length:
                        Math.abs(this.x - block.x + dx) +
                        Math.abs(this.y - block.y + dy),
                  });
               }
            });

            if (collisionBlocks.length > 0) {
               collisionBlocks.sort((a, b) => a.length - b.length);
               const { ofx, ofy } = collisionBlocks[0];

               blocks[y + ofy][x + ofx].damage();
               this.vx *= ofx ? -1 : 1;
               this.vy *= ofy ? -1 : 1;
               break;
            }
         }
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
         this.x - this.dr * 0.1,
         this.y - this.dr * 0.1,
         this.dr - this.dr * 0.2,
         0,
         Math.PI * 2,
         false
      );
      ctx.fill();
      ctx.closePath();
   }
}
