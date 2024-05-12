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
      this.#setupNextCollision();
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

   #setupNextCollision() {
      const { cvs, paddle, blocks } = this.game;
      const { r } = this;

      const range = innerHeight;
      const angle = Math.atan2(-this.vx, this.vy) + Math.PI / 2; // ball angle in radians
      const ballTX = this.x + Math.cos(angle) * range;
      const ballTY = this.y + Math.sin(angle) * range;
      const A = new Point(this.x, this.y);
      const B = new Point(ballTX, ballTY);

      const intersectPoints = [];

      // boundary collision
      (() => {
         const minPoint = this.#getMinPoint(
            A,
            B,
            r,
            r,
            cvs.width - r,
            cvs.height - r
         );
         minPoint && intersectPoints.push(minPoint);
      })();

      // paddle collision
      (() => {
         const pa = new Point(0, paddle.y - this.r);
         const pb = new Point(cvs.width, paddle.y - this.r);

         const intersect = getIntersection(A, B, pa, pb, "top");
         intersect && intersectPoints.push(intersect);
      })();

      // block collision
      blocks.forEach((block) => {
         const { dx, dy, w, h, isVisible } = block;

         if (isVisible) {
            const minPoint = this.#getMinPoint(A, B, dx - r, dy - r, dx + w + r, dy + h + r);
            minPoint && intersectPoints.push({ ...minPoint, block }); 
         }
         // console.log(intersectPoints);
      }); 

      const mins = intersectPoints.sort((a, b) => a.offset - b.offset);
      let min = mins[1] ? mins[1] : mins[0]; 

      // if (Math.round(min.x) == Math.round(this.x) && Math.round(min.y) == Math.round(this.y)) {
      //    min = mins[1] || mins[0];
      // }

      console.log(mins);
      console.log(this.x, this.y); 
      console.log(min);

      const steps = Math.ceil(Math.abs((this.y - min.y) / this.vy) + 0.01); 

      console.log(steps);

      if (min.side === "left" || min.side === "right") this.vx *= -1;
      if (min.side === "top" || min.side === "bottom") this.vy *= -1;

      this.countSteps = steps;
      this.fixSteps = steps;
      this.tx = min.x;
      this.ty = min.y;
      this.ox = this.x;
      this.oy = this.y;

      return {
         steps,
         x: min.x,
         y: min.y,
         block: min.block ? min.block : null,
      };
   }

   update() {
      this.countSteps--;
      console.log(this.countSteps);  

      const p = new PointDraw(this.tx, this.ty);
      p.draw(ctx, "P", false, this.dr); 

      this.x += (this.tx - this.ox) * (1 / this.fixSteps);
      this.y += (this.ty - this.oy) * (1 / this.fixSteps);

      if (this.countSteps == 0) {
         this.x = this.tx;
         this.y = this.ty;
         console.log("target Complete");
         const { steps, x, y, side } = this.#setupNextCollision();
      }
   }

   draw(ctx) {
      ctx.drawImage(
         this.image,
         this.x - this.r,
         this.y - this.r,
         this.dr * 2,
         this.dr * 2
      );
   }
}
