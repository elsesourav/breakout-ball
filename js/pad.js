class Pad {
   constructor(x, y, w, h, canvas, gyroSen = 10) {
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
      this.path = [];
      this.setup();
      this.#eventListener();
   }

   setup(gyroSen = this.gyroSen) {
      this.path = [];
      this.gyroSen = gyroSen;
   }

   #drawPath(ctx) {
      const { x, y, w, h, r } = this;
      const X = x - w / 2;
      const sideW = w / 4;

      ctx.fillStyle = "#ffa600";
      ctx.fill(create2dRoundedRectPath(x - sideW * 2, y, sideW, h, r));

      ctx.fillStyle = "#ffa600";
      ctx.fill(create2dRoundedRectPath(x + sideW, y, sideW, h, r));

      ctx.fillStyle = "#a60000";
      ctx.fill(
         create2dRoundedRectPath(x - sideW * 2 + 10, y, sideW / 3, h, r / 2)
      );

      ctx.fillStyle = "#a60000";
      ctx.fill(
         create2dRoundedRectPath(X + w - 10 - sideW / 3, y, sideW / 3, h, r / 2)
      );

      ctx.fillStyle = "#0000ff77";
      ctx.fill(
         create2dRoundedRectPath(
            x - sideW - sideW * 0.3,
            y - h * 0.1,
            sideW * 2.6,
            h * 1.2,
            4
         )
      );

      ctx.fillStyle = "#65f2ff";
      ctx.fill(
         create2dRoundedRectPath(x - sideW, y + h * 0.1, sideW * 2, h * 0.8, 4)
      );

      ctx.fillStyle = "#ffffff66";
      ctx.fill(create2dRoundedRectPath(X, y + h * 0.25, w, h / 2, r));
   }

   #eventListener() {
      const { cvs } = this;
      const { left, width } = cvs.getBoundingClientRect();
      const scale = cvs.width / width;

      const moveHandler = (x) => {
         let t = (x - left) * scale;
         t = t < 0 ? 0 : t;
         this.tx = t > cvs.width ? cvs.width : t;
      };

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

            const deltaGamma = (gamma - this.oldGamma) * this.gyroSen;

            if ((beta > 120 && beta < 180) || (beta > 120 && beta < 180)) {
               this.tx -= deltaGamma;
            } else {
               this.tx += deltaGamma;
            }

            this.oldGamma = gamma;

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

   update() {
      const { x, tx, w, cvs } = this;

      if (tx >= w / 2 && tx <= cvs.width - w / 2) {
         this.x += (tx - x) * 0.3;
      } else if (tx < w / 2) {
         this.x += (w / 2 - this.x) * 0.3;
      } else if (tx > cvs.width - w / 2) {
         this.x += (cvs.width - w / 2 - this.x) * 0.3;
      }
   }
}
