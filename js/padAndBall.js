class Pad {
   constructor(x, y, w, h, canvas, gyroSen) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.cvs = canvas;
      this.gyroSen = gyroSen;

      this.vx = 1;
      this.#eventListener();
   }

   setup(gyroSen = this.gyroSen) {
      this.gyroSen = gyroSen;

      this.#createPath();
   }

   #createPath() {

   }

   #eventListener() {
      const { left } = this.cvs.getBoundingClientRect();
      const { w } = this;

      this.cvs.addEventListener("mouseenter", (e) => {
         pad.x = e.clientX - left - w / 2;
      });
      this.cvs.addEventListener("mousemove", (e) => {
         this.x = e.clientX - left - w / 2;
      });
      this.cvs.addEventListener("touchstart", (e) => {
         this.x = e.touches[0].clientX - left - w / 2;
      });
      this.cvs.addEventListener("touchmove", (e) => {
         this.x = e.touches[0].clientX - left - w / 2;
      });

      // console.dir(DeviceOrientationEvent);

      // mobileErr.innerHTML = window.DeviceOrientationEvent;

      if (window.DeviceOrientationEvent) {
      //    mobileErr.innerHTML += `beta: ${0}; gamma: ${0}\n`;

         window.addEventListener("deviceorientation", (e) => {
            const { beta, gamma } = e;

            mobileErr.innerHTML += `beta: ${beta}; gamma: ${gamma}\n`;

            // const g = map(gamma * 10, -winw / 2, winw / 2, 0, winw - this.pad.w / (2 * SCALE));
            this.x += gamma;
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
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(this.x, this.y, this.w, this.h);
      // color(255, 255, 1);
      // strokeStyle(255, 255, 1);
      // curve(this.x, this.y, this.x + this.w, this.y, 3, this.top, true);
      // ctx.fillStyle = "#fff";
      // rect(this.x, this.y, this.w, this.h);
   }

   update() {
      this.ctl.left && this.x - this.vx > 0 && (this.x -= this.vx);
      this.ctl.right && this.x + this.w + this.vx < winw && (this.x += this.vx);
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
