class PlayLevel {
   constructor({
      padX,
      padY,
      padW,
      padH,
      ballX,
      ballY,
      ballR,
      ballS,
      cvs,
      blockW,
      blockH,
      fps
   }) {
      this.padX = padX;
      this.padY = padY;
      this.padW = padW;
      this.padH = padH;
      this.ballX = ballX;
      this.ballY = ballY;
      this.ballR = ballR;
      this.ballS = ballS;
      this.cvs = cvs;
      this.blockW = blockW;
      this.blockH = blockH;
      this.fps = fps;
      this.timeCount = 0;

      this.blocks = [];
      this.walls = [];
      this.blockImages = [];
      this.blockColors = [
         ["#00bcb9", "#4ffffc"],
         ["#bfc200", "#fcff59"],
         ["#00d00e", "#3bff48"],
         ["#8c00ff", "#af4eff"],
         ["#ff005d", "#ff4e8f"],
         ["#ffffff", "#ffffff"],
      ];
      this.fpsCounter = 0;
      this.completeFPSCounter = 0;
   }

   setup(level = this.level) {
      const { padX, padY, padW, padH, ballX, ballY, ballR, ballS, cvs, blockW, blockH } = this;

      this.level = level;
      this.blocks = [];
      this.walls = [];
      this.pad = new Paddle(padX, padY, padW, padH, cvs);
      this.ball = new Ball(ballX, ballY, ballR, ballS, cvs);

      this.#createBlockImages();

      for (const key in this.level) {
         const element = this.level[key];
         const { x, y, health } = element;
         if (health === 6) {
            this.walls.push(
               new Block(x, y, blockW, blockH, health, this.blockImages, this.blockColors)
            );
         } else {
            this.blocks.push(
               new Block(x, y, blockW, blockH, health, this.blockImages, this.blockColors)
            );
         }
      }

      // for showing fps in display
      setInterval(() => {
         mobileErr.innerHTML = this.fpsCounter;
         this.fpsCounter = 0;
      }, 1000);
   }

   #createBlockImages() {
      const { blockW, blockH } = this;

      this.blockColors.forEach(([color, stroke], i) => {
         const offset = 2 + 0.5 * (this.blockColors.length - i);
         const x = offset;
         const y = offset;
         const r = 6;
         const W = blockW - 2 * offset;
         const H = blockH - 2 * offset;
         const inOffset = 3;
         const inX = x + inOffset;
         const inY = y + inOffset;
         const inW = W - inOffset * 2;
         const inH = H / 1.5 - inOffset * 2;

         this.blockImages.push(
            createCanvasImage(
               (ctx) => {
                  const path1 = create2dRoundedRectPath(x, y, W, H, r);
                  const path2 = create2dRoundedRectPath(inX, inY, inW, inH, r);

                  ctx.lineWidth = 2;
                  ctx.strokeStyle = stroke;
                  ctx.stroke(path1);

                  ctx.fillStyle = color;
                  ctx.fill(path1);

                  ctx.fillStyle = "#fff4";
                  ctx.fill(path2);
               },
               blockW,
               blockH
            )
         );
      });
   }

   #majorUpdate() {
      if (this.blocks.length === 0) {
         console.log("Win!");
         animation.stop();
      }

      this.blocks.forEach((block) => {
         block.majorUpdate(ctx);
      });

      this.blocks = this.blocks.filter((block) => !block.isComplete);
   }

   update() {
      this.fpsCounter++;
      if (this.completeFPSCounter++ >= this.fps) {
         this.completeFPSCounter = 0;
         this.timeCount++;
         this.#majorUpdate();
      }

      this.pad.update();
      this.ball.update(this.pad, this.blocks, this.walls);
   }

   draw(ctx, cWidth, cHeight) {
      ctx.fillStyle = "#00000077";
      ctx.fillRect(0, 0, cWidth, cHeight);

      this.blocks.forEach((block) => {
         block.draw(ctx);
      });
      this.walls.forEach((wall) => {
         wall.draw(ctx);
      });
      this.ball.draw(ctx);
      this.pad.draw(ctx);
   }
}
