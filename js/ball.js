class Ball {
   constructor(x, y, r, speed, image, game) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.dr = r + 2;
      this.s = speed;
      this.game = game;
      this.vx = speed * (Math.random() * 2 - 1);
      this.vy = -speed;
      this.image = image;
      this.countSteps = 0;
      const bound = $("main").getBoundingClientRect();
      this.offsetLeft = bound.left;
      this.offsetTop = bound.top;
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

   #getMinPoint(A, B, startX, startY, endX, endY) {
      const a = new Point(startX, startY);
      const b = new Point(endX, startY);
      const c = new Point(endX, endY);
      const d = new Point(startX, endY);

      const intersects = [
         getIntersection(A, B, a, b, "top"),
         getIntersection(A, B, b, c, "right"),
         getIntersection(A, B, c, d, "bottom"),
         getIntersection(A, B, d, a, "left"),
      ].filter((e) => e);

      return intersects.sort((a, b) => a.offset - b.offset)[0];
   }

   #getIntersectPoint() {
      const { cvs, paddle, blocks } = this.game;

      const range = innerHeight;
      const angle = Math.atan2(-this.vx, this.vy) + Math.PI / 2; // ball angle in radians
      const ballTX = this.x + Math.cos(angle) * range;
      const ballTY = this.y + Math.sin(angle) * range;
      const A = new Point(this.x, this.y);
      const B = new Point(ballTX, ballTY);

      const intersectPoints = [];

      // boundary collision
      (() => {
         const minPoint = this.#getMinPoint(A, B, this.r, this.r, cvs.width - this.r, cvs.height - this.r);
         minPoint && intersectPoints.push(minPoint);
      })();

      // paddle collision
      (() => {
         const pa = new Point(this.r, paddle.y - this.r);
         const pb = new Point(cvs.width - this.r, paddle.y - this.r);

         const intersect = getIntersection(A, B, pa, pb, "top");
         intersect && intersectPoints.push(intersect);
      })();

      // block collision
      blocks.forEach((block) => {
         const { dx, dy, w, h, isVisible } = block;

         if (isVisible) {
            const minPoint = this.#getMinPoint(A, B, dx - this.r, dy - this.r, dx + w + this.r, dy + h + this.r);
            minPoint && intersectPoints.push({ ...minPoint, block });
         }
      });

      const mins = intersectPoints.sort((a, b) => a.offset - b.offset);
      let min = mins[0];

      if (min.x == this.preX && min.y == this.preY) {
         min = mins[1] || mins[0];
      }

      return {
         distanceY: this.y - min.y,
         x: min.x,
         y: min.y,
         side: min.side,
         block: min.block ? min.block : null,
      };
   }

   update() {
      if (this.countSteps-- <= 0) {
         const { distanceY, x, y, side } = this.#getIntersectPoint();

         const steps = Math.abs(distanceY / this.vy);
         // const timeMS = FRAME_RATE * steps; 
         this.countSteps = steps;
         this.x = x;
         this.y = y;
         if (side === "left" || side === "right") this.vx *= -1;
         if (side === "top" || side === "bottom") this.vy *= -1;

      }
      this.x += this.vx;
      this.y += this.vy;
   }

   draw(ctx) {
      ctx.drawImage(this.image, this.x, this.y, this.dr * 2, this.dr * 2);
   }
}
