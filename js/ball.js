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

      this.htmlBall.style.transition = `none`;
      this.htmlBall.style.transform = `translate(${this.x - this.r}px, ${
         this.y - this.r
      }px)`;
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

   #getIntersectPoint() {
      const range = innerHeight;
      const angle = Math.atan2(-this.vx, this.vy) + Math.PI / 2; // ball angle in radians
      const ballTX = this.x + Math.cos(angle) * range;
      const ballTY = this.y + Math.sin(angle) * range;
      const A = new Point(this.x, this.y);
      const B = new Point(ballTX, ballTY);

      const intersectPoints = [];

      // boundary collision
      (() => {
         const a = new Point(this.r, this.r);
         const b = new Point(this.cvs.width - this.r, this.r);
         const c = new Point(this.cvs.width - this.r, this.cvs.height - this.r);
         const d = new Point(this.r, this.cvs.height - this.r);

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
         const pa = new Point(this.r, paddle.y - this.r);
         const pb = new Point(this.cvs.width - this.r, paddle.y - this.r);

         const intersect = getIntersection(A, B, pa, pb, "top");
         intersect && intersectPoints.push(intersect);
      })();

      // block collision
      blocks.forEach((block) => {
         const { x, y, w, h } = block;

         const a = new Point(x * w - this.r, y * h - this.r);
         const b = new Point(x * w + w + this.r, y * h - this.r);
         const c = new Point(x * w + w + this.r, y * h + h + this.r);
         const d = new Point(x * w - this.r, y * h + h + this.r);
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

      try {
         if (min.x == this.preX && min.y == this.preY) {
            min = mins[1] || mins[0];
         }
         this.preX = min.x;
         this.preY = min.y;
      } catch (error) {
         console.log(mins);
         console.log(min);
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
         const { distanceY, x, y, side } = this.#getIntersectPoint(
            this.game.paddle,
            this.game.blocks
         );

         const steps = Math.abs(distanceY / this.vy);
         const timeMS = FRAME_RATE * steps;
         this.countSteps = steps;
         this.x = x;
         this.y = y;
         if (side === "left" || side === "right") this.vx *= -1;
         if (side === "top" || side === "bottom") this.vy *= -1;

         this.htmlBall.style.transition = `transform ${timeMS}ms linear`;
         this.htmlBall.style.transform = `translate(${x - this.r}px, ${
            y - this.r
         }px)`;

         // console.log(timeMS);
      }
   }

   draw(ctx) {
      ctx.drawImage(this.image, this.x, this.y, this.dr * 2, this.dr * 2);
   }
}
