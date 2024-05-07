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
      fps,
      htmlBall,
      ballImage,
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
      this.htmlBall = htmlBall;
      this.ballImage = ballImage;
      this.timeCount = 0;

      this.blocks = [];
      this.blockImages = [];
      this.#createBlockImages();
      this.fpsCounter = 0;
      this.completeFPSCounter = 0;
   }

   setup(level = this.level, rows = 9, cols = 10) {
      const {
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
         htmlBall
      } = this;

      this.level = level;
      this.rows = rows;
      this.cols = cols;
      this.blocks = [];
      this.pad = new Paddle(padX, padY, padW, padH, cvs);
      this.ball = new Ball(ballX, ballY, ballR, ballS, this.ballImage, this);

      for (const key in this.level) {
         const { x, y, health } = this.level[key];
         this.blocks.push(
            new Block(x, y, blockW, blockH, health, this.blockImages)
         );
      }

      let timeoutId;

      clearTimeout(timeoutId);

      // for showing fps in display
      timeoutId = setInterval(() => {
         mobileErr.innerHTML = this.fpsCounter;
         this.fpsCounter = 0;
      }, 1000);
   }

   #createBlockImages() {
      const blockW = 64;
      const blockH = 48;


      blockColors.forEach(([color, stroke], i) => {
         const offset = 2 + 0.5 * (blockColors.length - i);
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

         this.blockImages.push({
            image: createCanvasImage(
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
            ),
            color,
         });
      });
   }

   #majorUpdate() {
      // if (this.blocks.length === 0) {
      //    console.log("Win!");
      //    animation.stop();
      // }

      for (let i = 0; i < this.blocks.length; i++) {
         if (this.blocks[i].isCompleted) {
            this.blocks.splice(i--, 1); 
         } else {
            this.blocks[i].majorUpdate();
         }
         
      }
   }

   update() {
      this.fpsCounter++;
      if (this.completeFPSCounter++ >= this.fps) {
         this.completeFPSCounter = 0;
         this.timeCount++;
         this.#majorUpdate();
      }

      this.pad.update();
      this.ball.update(this.pad, this.blocks);
   }

   draw(ctx, cWidth, cHeight) {
      // clear canvas
      ctx.fillStyle = "#00000077";
      ctx.fillRect(0, 0, cWidth, cHeight);

      // draw blocks
      this.blocks.forEach((block) => block.draw(ctx));

      // draw ball and paddle
      this.ball.draw(ctx);
      this.pad.draw(ctx);
   }
}
