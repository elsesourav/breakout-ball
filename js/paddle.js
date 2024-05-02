class Paddle {
   constructor(x, y, w, h, canvas, gyroSen = 20) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.tx = this.x;
      this.r = 6;
      this.cvs = canvas;
      this.gyroSen = gyroSen;
      this.oldGamma = 0;
      this.lh = canvas.height - y - h - 10;

      this.vx = 1;
      this.paths = [];
      this.pathColors = [];
      this.isPointerLock = false;
      this.percentage = isMobile ? 0.3 : 0.2;
      this.setup();
      this.#eventListener();
   }

   setup(gyroSen = this.gyroSen) {
      this.gyroSen = gyroSen;

      this.paths = [];
      this.#createPath();
      this.pathColors = [
         "#0000ff88",
         "#65f2ff",
         "#ffa600",
         "#ffa600",
         "#a60000",
         "#a60000",
         "#ffffff66",
         "#00000033",
      ];
   }

   #createPath() {
      const { w, h, r } = this;
      const x = 0,
         y = 0;
      const X = x - w / 2;
      const sideW = w / 4;

      this.paths.push(
         create2dRoundedRectPath(
            x - sideW - sideW * 0.3,
            y - h * 0.1,
            sideW * 2.6,
            h * 1.2,
            4
         )
      );

      this.paths.push(
         create2dRoundedRectPath(x - sideW, y + h * 0.1, sideW * 2, h * 0.8, 4)
      );

      this.paths.push(create2dRoundedRectPath(x - sideW * 2, y, sideW, h, r));

      this.paths.push(create2dRoundedRectPath(x + sideW, y, sideW, h, r));

      this.paths.push(
         create2dRoundedRectPath(x - sideW * 2 + 10, y, sideW / 3, h, r / 2)
      );

      this.paths.push(
         create2dRoundedRectPath(X + w - 10 - sideW / 3, y, sideW / 3, h, r / 2)
      );

      this.paths.push(create2dRoundedRectPath(X, y + h * 0.1, w, h / 3, r));

      this.paths.push(create2dRoundedRectPath(X, y + h * 0.8, w, h / 5, r / 2));
   }

   #drawPath(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      for (let i = 0; i < this.paths.length; i++) {
         ctx.fillStyle = this.pathColors[i];
         ctx.fill(this.paths[i]);
      }
      ctx.restore();
   }

   #eventListener() {
      const { cvs } = this;
      const { left, width } = cvs.getBoundingClientRect();
      const scale = cvs.width / width;
      const cw = cvs.width;
      const hw = this.w / 2;

      const moveHandler = (x) => {
         this.tx = (x - left) * scale;
         if (!(this.tx > hw && this.tx < cw - hw)) {
            this.tx = this.tx <= hw ? hw : cw - hw;
         }
      };

      const pcMoveHandler = (dx) => {
         this.tx += dx * 3;
         if (!(this.tx > hw && this.tx < cw - hw)) {
            this.tx = this.tx <= hw ? hw : cw - hw;
         }
      };

      document.body.addEventListener(
         "click",
         (e) => {
            if (!this.isPointerLock) {
               this.isPointerLock = true;
               if (CVS.requestPointerLock) {
                  CVS.requestPointerLock();
               } else if (CVS.webkitRequestPointerLock) {
                  CVS.webkitRequestPointerLock();
               } else if (CVS.mozRequestPointerLock) {
                  CVS.mozRequestPointerLock();
               } else {
                  console.warn("Pointer locking not supported");
                  this.isPointerLock = false;
               }
            } else {
               document.exitPointerLock =
                  document.exitPointerLock || document.mozExitPointerLock;
               document.exitPointerLock();
               this.isPointerLock = false;
            }
         },
         false
      );

      document.addEventListener("pointerlockchange", pointerLockChange, false);
      document.addEventListener(
         "mozpointerlockchange",
         pointerLockChange,
         false
      );

      function pointerLockChange() {
         if (
            document.pointerLockElement === CVS ||
            document.mozPointerLockElement === CVS
         ) {
            CVS.style.curser = "none";
         } else {
            CVS.style.curser = "move";
         }
      }

      this.cvs.addEventListener("mouseenter", (e) => {
         this.isPointerLock && pcMoveHandler(e.movementX);
      });
      this.cvs.addEventListener("mousemove", (e) => {
         this.isPointerLock && pcMoveHandler(e.movementX);
      });

      this.cvs.addEventListener("mouseenter", (e) => {
         !this.isPointerLock && moveHandler(e.clientX);
      });
      this.cvs.addEventListener("mousemove", (e) => {
         !this.isPointerLock && moveHandler(e.clientX);
      });

      this.cvs.addEventListener("touchstart", (e) => {
         moveHandler(e.touches[0].clientX);
      });
      this.cvs.addEventListener("touchmove", (e) => {
         moveHandler(e.touches[0].clientX);
      });

      // if (window.DeviceOrientationEvent) {
      //    window.addEventListener("deviceorientation", (e) => {
      //       const { beta, gamma } = e;

      //       const deltaGamma = (gamma - this.oldGamma) * this.gyroSen;

      //       if ((beta > 120 && beta < 180) || (beta > 120 && beta < 180)) {
      //          this.tx -= deltaGamma;
      //       } else {
      //          this.tx += deltaGamma;
      //       }

      //       this.oldGamma = gamma;
      //    });
      // }
   }

   update() {
      this.x += (this.tx - this.x) * this.percentage;
   }

   draw(ctx) {
      const { cvs } = this;
      this.#drawPath(ctx);

      // draw lava
      ctx.fillStyle = "#f00";
      ctx.fillRect(0, cvs.height - this.lh, cvs.width, this.lh);
      ctx.fillStyle = "#fff3";
      ctx.fillRect(0, cvs.height - this.lh, cvs.width, this.lh / 6);
      ctx.fillStyle = "#00000005";
      ctx.fillRect(0, cvs.height - this.lh / 1.2, cvs.width, this.lh / 2);
   }
}
