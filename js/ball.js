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
      this.vx = speed * (Math.random() * 2 - 1);
      this.vy = -speed;
      this.countSteps = 0;
      this.preX = x;
      this.preY = y;
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

   #getIntersectPoint(paddle, blocks) {
      const range = innerHeight;
      const angle = Math.atan2(-this.vx, this.vy) + Math.PI / 2; // ball angle in radians
      // console.log(toDegrees(angle), -this.vx, this.vy);
      const ballTX = this.x + Math.cos(angle) * range;
      const ballTY = this.y + Math.sin(angle) * range;
      const A = new Point(this.x, this.y);
      const B = new Point(ballTX, ballTY);

      const intersectPoints = [];

      // boundary collision
      (() => {
         const a = new Point(0, 0);
         const b = new Point(this.cvs.width, 0);
         const c = new Point(this.cvs.width, this.cvs.height);
         const d = new Point(0, this.cvs.height);

         const intersects = [
            getIntersection(A, B, a, b, "top"),
            getIntersection(A, B, b, c, "right"),
            getIntersection(A, B, c, d, "bottom"),
            getIntersection(A, B, d, a, "left"),
         ].filter((e) => e);

         const [min] = intersects.sort((a, b) => a.offset - b.offset);
         min && intersectPoints.push(min);
      })();

      // paddle collision
      (() => {
         const pa = new Point(0, paddle.y);
         const pb = new Point(this.cvs.width, paddle.y);

         const intersect = getIntersection(A, B, pa, pb, "top");
         intersect && intersectPoints.push(intersect);
      })();

      // block collision
      blocks.forEach((block) => {
         const { x, y, w, h } = block;

         const a = new Point(x * w, y * h);
         const b = new Point(x * w + w, y * h);
         const c = new Point(x * w + w, y * h + h);
         const d = new Point(x * w, y * h + h);
         const intersects = [
            getIntersection(A, B, a, b, "top"),
            getIntersection(A, B, b, c, "right"),
            getIntersection(A, B, c, d, "bottom"),
            getIntersection(A, B, d, a, "left"),
         ].filter((e) => e);

         const [min] = intersects.sort((a, b) => a.offset - b.offset);
         min && intersectPoints.push({ ...min, block });
      });

      const mins = intersectPoints.sort((a, b) => a.offset - b.offset);
      let min = mins[0];


      // console.log(min.x == this.preX, min.y == this.preY);
      // console.log(`minX : ${min.x}, minY : ${min.y}, preX : ${this.preX}, preY : ${this.preY}`);


      if (min.x == this.preX && min.y == this.preY) {
         min = mins[1];
      }
      this.preX = min.x;
      this.preY = min.y; 

      
      return {
         distanceY: this.y - min.y,
         x: min.x,
         y: min.y,
         side: min.side,
         block: min.block ? min.block : null,
      };
   }

   update(paddle, blocks) {
      if (this.countSteps-- <= 0) {
         const { distanceY, x, y, side } = this.#getIntersectPoint(
            paddle,
            blocks
         );

         const steps = Math.abs(distanceY / this.vy);
         this.countSteps = steps;
         this.x = x;
         this.y = y;
         if (side === "left" || side === "right") this.vx *= -1;
         if (side === "top" || side === "bottom") this.vy *= -1;
         const timeMS = Math.round(FRAME_RATE * steps);

         // console.log(timeMS);
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
