class PlayLevel {
   constructor() {
      this.blocks = [];
      this.walls = [];
      this.pad = new Paddle(CVS_W / 2, CVS_H - FOOTER_HEIGHT, PAD_WIDTH, PAD_HEIGHT, CVS);
      this.ball = new Ball(CVS_W / 2, CVS_H - FOOTER_HEIGHT - BALL_RADIUS, BALL_RADIUS, 10, CVS);
   }

   setup(level = this.level) {
      this.level = level;
      this.blocks = [];
      this.walls = [];

      for (const key in this.level) {
         const element = this.level[key];
         const { x, y, health } = element;
         if (health === 6) {
            this.walls.push(new Block(x, y, SCALE, SCALE_H, health));
         } else {
            this.blocks.push(new Block(x, y, SCALE, SCALE_H, health));
         }
      }
   }

   update() {
      this.blocks = this.blocks.filter(block => !block.isComplete);
      if (this.blocks.length === 0) {
         console.log("Win!");
         animation.stop();
      }
      this.pad.update();
      this.ball.update(this.pad, [...this.blocks,...this.walls]);
   }

   draw(ctx, cWidth, cHeight) {
      ctx.clearRect(0, 0, cWidth, cHeight);
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
