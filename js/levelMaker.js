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
      this.selectedHealth = 1;
      this.eraserSelected = false;
      this.hoverLocation = [null, null];
      this.#eventHandler();
      this.setup();
   }

   setup() {
      this.blocks = [];
      this.state = [];
      this.map = [];
      this.hoverLocation = [null, null];
      const { w, h, rows, cols, selectedHealth } = this;

      for (let i = 0; i < cols; i++) {
         this.map[i] = [];
         for (let j = 0; j < rows; j++) {
            this.map[i][j] = new Block(j, i, w, h, selectedHealth, true);
         }
      }
   }

   #createBlock(offX, offY, isPut = false) {
      const { left, top, width } = this.cvs.getBoundingClientRect();
      const ratio = this.cvs.width / width;
      const NX = Math.floor(((offX - left) * ratio) / SCALE);
      const NY = Math.floor(((offY - top) * ratio) / SCALE_H);
      let isFind = true;

      this.map.some((cols) =>
         cols.some((block) => {
            const { x, y } = block;

            if (NX === x && NY === y) {
               isFind = false;
               if (!this.eraserSelected && !isMobile) {
                  this.hoverLocation = [x, y];

                  if (isPut) {
                     if (!this.blocks.some((b) => b.x === x && b.y === y)) {
                        this.blocks.push({
                           x,
                           y,
                           w: this.w,
                           h: this.h,
                           health: this.selectedHealth,
                        });
                        this.#updateState(this.blocks);
                        block.setHealth(this.selectedHealth);
                        block.setOnlyOutline(false);
                     }
                  }
               } else if (isPut) {
                  block.setOnlyOutline(true);
                  this.blocks = this.blocks.filter(
                     (b) => !(b.x === x && b.y === y)
                  );
                  this.#updateState(this.blocks);
               }

               return true;
            }
         })
      );

      if (isFind) this.hoverLocation = [null, null];
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
               block.setHealth(this.selectedHealth);
               ctx.globalAlpha = 0.5;
               block.draw(ctx);
               ctx.globalAlpha = 1;
            } else {
               block.drawOutline(ctx);
            }
         });
      });
   }

   selectHealth(health) {
      this.selectedHealth = health;
      this.eraserSelected = false;
   }

   selectWall() {
      this.selectedHealth = 6;
      this.eraserSelected = false;
   }

   selectEraser() {
      this.eraserSelected = true;
   }

   #updateState(newState) {
      this.currentState++;
      this.state = this.state.slice(0, this.currentState);
      this.state.push([...newState]);
   }

   #updateMap() {
      this.map.map((cl) => cl.map((blk) => blk.setOnlyOutline(true)));

      this.blocks.forEach((block) => {
         const { x, y } = block;
         this.map[y][x].setOnlyOutline(false);
         this.map[y][x].setHealth(block.health - 1);
      });
   }

   undo() {
      if (this.currentState > 0) {
         this.blocks = this.state[--this.currentState];
      } else {
         this.blocks = [];
      }
      this.#updateMap();
   }

   redo() {
      if (this.currentState < this.state.length - 1) {
         this.blocks = this.state[this.currentState++];
      } else {
         this.blocks = this.state[this.currentState];
      }
      this.#updateMap();
   }

   getLevel() {
      console.log(`"${JSON.stringify(this.blocks)}"`);
      return this.blocks;
   }
}
