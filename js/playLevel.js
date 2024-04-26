class PlayLevel {
   constructor(pad) {
      this.blocks = [];
      this.walls = [];
      this.pad = pad;
   }

   setup(level = this.level) {
      this.level = level;
      this.blocks = [];
      this.walls = [];

      for (const key in this.level) {
         const element = this.level[key];
         const { x, y, w, h, health } = element;
         if (health === 6) {
            this.walls.push(new Block(x, y, w, h, health));
         } else {
            this.blocks.push(new Block(x, y, w, h, health));
         }
      }
      console.log(this.blocks);
   }

   update() {
      // this.blocks = this.blocks.filter(block => !block.isComplete);
      if (this.blocks.length === 0) {
         console.log("Game is Over!");
         animation.stop();
      }
      this.pad.update();
   }

   draw(ctx, cWidth, cHeight) {
      ctx.clearRect(0, 0, cWidth, cHeight);
      this.blocks.forEach((block) => {
         block.draw(ctx);
      });
      this.walls.forEach((wall) => {
         wall.draw(ctx);
      });
      this.pad.draw(ctx);
   }
}
