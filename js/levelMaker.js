class LevelMaker {
   constructor(rows, cols, width, height, canvas) {
      this.rows = rows;
      this.cols = cols;
      this.w = width;
      this.h = height;
      this.cvs = canvas;

      this.blocks = [];
      this.state = [];
      this.map = [];
      this.currentState = -1;
      this.healthSelected = 1;
      this.hoverLocation = [null, null];
      this.#eventHandler();
      this.setup();
   }
   
   setup() {
      this.blocks = [];
      this.state = [];
      this.map = [];
      this.hoverLocation = [null, null];
      const { w, h, rows, cols, healthSelected } = this;

      for (let i = 0; i < cols; i++) {
         this.map[i] = [];
         for (let j = 0; j < rows; j++) {
            this.map[i][j] = new Block(j, i, w, h, healthSelected, true);
         }
      }
   }

   #createBlock(offX, offY, isPut = false) {
      const { left, top, width } = this.cvs.getBoundingClientRect();
      const ratio = this.cvs.width / width;
      const NX = Math.floor(((offX - left) * ratio) / SCALE);
      const NY = Math.floor(((offY - top) * ratio) / SCALE_H);
   
      this.map.some((cols) =>
         cols.some((block) => {
            const { x, y } = block;

            if (NX === x && NY === y) {
               this.hoverLocation = [x, y];
               // console.log(block);

               if (isPut) {
                  if (!this.blocks.some((b) => b.x === x && b.y === y)) {
                     this.blocks.push({
                        x, y,
                        w: this.w,
                        h: this.h,
                        health: this.healthSelected
                     });
                     block.setHealth(this.healthSelected, false);
                  }
               }
               return true;
            }
         })
      );
   }
 
   #eventHandler() {
      this.cvs.click(({ clientX, clientY }) => {
         this.#createBlock(clientX, clientY, true);
      });
      this.cvs.on("mousemove", ({ clientX, clientY }) => {
         this.#createBlock(clientX, clientY);
      });
      this.cvs.on("touchstart", ({ touches }) => {
         this.#createBlock(touches[0].clientX, touches[0].clientY);
      });
      this.cvs.on("touchmove", ({ touches }) => {
         this.#createBlock(touches[0].clientX, touches[0].clientY);
      });
   }

   draw(ctx) {
      const [x, y] = this.hoverLocation;

      this.map.forEach((cols, Y) => {
         cols.forEach((block, X) => {
            if (!block.onlyOutline) {
               block.draw(ctx);
            } else if (X === x && Y === y) { 
               ctx.globalAlpha = 0.5;
               block.draw(ctx);
               ctx.globalAlpha = 1;
            } else {
               block.drawOutline(ctx);
            }
         });
      });
   }

   setHealth(health) {
      this.healthSelected = health;
   }

   selectWall() {
      this.healthSelected = 6;
   }

   selectEraser() {
      
   }

   getLevel() {
      return this.blocks;
   }
}





const lvlOptions = $$("#levelDesigner .option");
lvlOptions.click((ele) => {
   lvlOptions.each(e => e.classList.remove("active"));
   ele.classList.add("active");
});




