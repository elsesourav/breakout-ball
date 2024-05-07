class Paddle {
   constructor(x, y, w, h, game, image, gyroSen = 20) {
      this.x = x;
      this.y = y;
      this.fixY = y;
      this.w = w;
      this.h = h;
      this.tx = this.x;
      this.ty = this.y;
      this.game = game;
      this.image = image;
      this.gyroSen = gyroSen;
      this.image;
      this.oldGamma = 0;
      this.lh = game.cvs.height - y - h - 10;

      this.isPointerLock = false;
      this.percentage = isMobile ? 0.3 : 0.2;
      this.setup();
      this.#eventListener();
   }

   setup(gyroSen = this.gyroSen) {
      this.gyroSen = gyroSen;
   }

   #eventListener() {
      const { cvs } = this.game;
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

      this.game.cvs.addEventListener("mouseenter", (e) => {
         this.isPointerLock && pcMoveHandler(e.movementX);
      });
      this.game.cvs.addEventListener("mousemove", (e) => {
         this.isPointerLock && pcMoveHandler(e.movementX);
      });

      this.game.cvs.addEventListener("mouseenter", (e) => {
         !this.isPointerLock && moveHandler(e.clientX);
      });
      this.game.cvs.addEventListener("mousemove", (e) => {
         !this.isPointerLock && moveHandler(e.clientX);
      });

      this.game.cvs.addEventListener("touchstart", (e) => {
         moveHandler(e.touches[0].clientX);
      });
      this.game.cvs.addEventListener("touchmove", (e) => {
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

   hit() {
      this.y = this.fixY + this.h * 0.4;
      this.ty = this.fixY;
   }

   update() {
      this.x += (this.tx - this.x) * this.percentage;
      this.y += (this.ty - this.y) * 0.2;
   }

   draw(ctx) {
      const { cvs } = this.game;
      ctx.drawImage(this.image, this.x - this.w / 2, this.y, this.w, this.h);

      // draw lava
      ctx.fillStyle = "#f00";
      ctx.fillRect(0, cvs.height - this.lh, cvs.width, this.lh);
      ctx.fillStyle = "#fff3";
      ctx.fillRect(0, cvs.height - this.lh, cvs.width, this.lh / 6);
      ctx.fillStyle = "#00000005";
      ctx.fillRect(0, cvs.height - this.lh / 1.2, cvs.width, this.lh / 2);
   }
}
