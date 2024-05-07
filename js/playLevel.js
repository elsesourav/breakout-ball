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
      paddleImage,
      ballImage,
      blockImages
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
      this.paddleImage = paddleImage;
      this.ballImage = ballImage;
      this.blockImages = blockImages;
      this.timeCount = 0;

      this.blocks = [];
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
         blockW,
         blockH,
      } = this;
      
      this.level = level;
      this.rows = rows;
      this.cols = cols;

      
      this.blocks = [];
      for (const key in this.level) {
         const { x, y, health } = this.level[key];
         this.blocks.push(
            new Block(x, y, blockW, blockH, health, this.blockImages)
         );
      }


      this.paddle = new Paddle(padX, padY, padW, padH, this, this.paddleImage);
      this.ball = new Ball(ballX, ballY, ballR, ballS, this.ballImage, this);


      let timeoutId;

      clearTimeout(timeoutId);

      // for showing fps in display
      timeoutId = setInterval(() => {
         mobileErr.innerHTML = this.fpsCounter;
         this.fpsCounter = 0;
      }, 1000);
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

      this.paddle.update();
      this.ball.update(this.paddle, this.blocks);
   }

   draw(ctx, cWidth, cHeight) {
      // clear canvas
      ctx.fillStyle = "#00000077";
      ctx.fillRect(0, 0, cWidth, cHeight);

      // draw blocks
      this.blocks.forEach((block) => block.draw(ctx));

      // draw ball and paddle
      this.ball.draw(ctx);
      this.paddle.draw(ctx);
   }
}
