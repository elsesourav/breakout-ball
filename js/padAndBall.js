class Pad {
   constructor(x, y, w, h, canvas, gyroSen = 1) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.tx = this.x;
      this.r = 6;
      this.cvs = canvas;
      this.gyroSen = gyroSen;

      this.vx = 1;
      this.path = [];
      this.setup();
      this.#eventListener();
   }

   setup(gyroSen = this.gyroSen) {
      this.path = [];
      this.gyroSen = gyroSen;
   }

   #createPath() {
      const { x, y, w, h, r } = this;
      const X = x - w / 2;
      const sideW = w / 4;

      const s1 = create2dRoundedRectPath(x - sideW * 2, y, sideW, h, r);
      const s2 = create2dRoundedRectPath(x + sideW, y, sideW, h, r);

      const ss1 = create2dRoundedRectPath(
         x - sideW * 2 + 10,
         y,
         sideW / 3,
         h,
         r / 2
      );
      const ss2 = create2dRoundedRectPath(
         X + w - 10 - sideW / 3,
         y,
         sideW / 3,
         h,
         r / 2
      );
      const path1 = create2dRoundedRectPath(x - sideW - sideW * 0.3, y - h * 0.1, sideW * 2.6, h * 1.2, 4);
      const path2 = create2dRoundedRectPath(x - sideW, y + h * 0.1, sideW * 2, h * 0.8, 4);

      const light = create2dRoundedRectPath(X, y + h * 0.25, w, h / 2, r);

      this.path = [path1, path2, s1, s2, ss1, ss2, light];
   }

   #eventListener() {
      const { cvs } = this;
      const { left, width } = cvs.getBoundingClientRect();
      const scale = cvs.width / width;

      const moveHandler = (x) => {
         let t = (x - left) * scale;
         t = t < 0 ? 0 : t;
         this.tx = t > cvs.width ? cvs.width : t;
      }

      this.cvs.addEventListener("mouseenter", (e) => {
         moveHandler(e.clientX);
      });
      this.cvs.addEventListener("mousemove", (e) => {
         moveHandler(e.clientX);
      });
      this.cvs.addEventListener("touchstart", (e) => {
         moveHandler(e.touches[0].clientX);
      });
      this.cvs.addEventListener("touchmove", (e) => {
         moveHandler(e.touches[0].clientX);
      });

      if (window.DeviceOrientationEvent) {
         window.addEventListener("deviceorientation", (e) => {
            const { beta, gamma } = e;

            // mobileErr.innerHTML = `beta: ${beta}; gamma: ${gamma}\n`;

            // const g = map(gamma * 10, -winw / 2, winw / 2, 0, winw - this.pad.w / (2 * SCALE));
            // this.x += gamma;
            // );
            // if (0 <= g && winw - this.pad.w >= g) {
            //    if ((beta > 120 && beta < 180) || (beta > 120 && beta < 180)) {
            //       this.pad.x = winw - this.pad.w - g;
            //    } else {
            //       this.pad.x = g;
            //    }
            // }
         });
      }
   }

   draw(ctx) {
      ctx.fillStyle = "#0000ffbb";
      ctx.fill(this.path[0]);

      ctx.fillStyle = "#65f2ff";
      ctx.fill(this.path[1]);

      ctx.fillStyle = "#ffa600";
      ctx.fill(this.path[2]);

      ctx.fillStyle = "#ffa600";
      ctx.fill(this.path[3]);

      ctx.fillStyle = "#a60000";
      ctx.fill(this.path[4]);

      ctx.fillStyle = "#a60000";
      ctx.fill(this.path[5]);

      ctx.fillStyle = "#ffffff66";
      ctx.fill(this.path[6]);
   }

   update() {
      const { x, tx, w, cvs } = this;

      if (tx >= w / 2 && tx <= cvs.width - w / 2) {
         this.x += (tx - x) * 0.3;
      } else if (tx < w / 2) {
         this.x += (w / 2 - this.x) * 0.3;
      } else if (tx > cvs.width - w / 2) {
         this.x += (cvs.width - w / 2 - this.x) * 0.3;
      }

      this.#createPath();
   }
}

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
