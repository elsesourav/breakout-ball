class LevelMaker {
   constructor(rows, cols, width, height, canvas) {
      this.rows = rows;
      this.cols = cols;
      this.w = width;
      this.h = height;
      this.cvs = canvas;

      this.blocks = [];
      this.state = [];
      this.defaults = [];
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
      this.hoverLocation = [null, null];
      this.selectedHealth = 1;

      const { rows, cols } = this;

      for (let i = 0; i < cols; i++) {
         this.blocks[i] = [];
         this.defaults[i] = [];
         for (let j = 0; j < rows; j++) {
            this.blocks[i][j] = { x: j, y: i, health: 0 };
            this.defaults[i][j] = { x: j, y: i, health: 0 };
         }
      }
   }

   #setupBlock(offX, offY, select = "hover") {
      const { left, top, width } = this.cvs.getBoundingClientRect();
      const ratio = this.cvs.width / width;
      const NX = Math.floor(((offX - left) * ratio) / this.w);
      const NY = Math.floor(((offY - top) * ratio) / this.h);

      if (NX > this.rows - 1 || NY > this.cols - 1) {
         makerHoverBlock(-1, -1, 0);
         return;
      }

      if (select == "add") {
         makerAddBlock(NX, NY, this.selectedHealth);
         this.blocks[NY][NX].health = this.selectedHealth;
         this.#updateState();
      } else if (select == "hover") {
         makerHoverBlock(NX, NY, this.selectedHealth);
      } else if (select == "remove") {
         makerRemoveBlock(NX, NY);
         this.blocks[NY][NX].health = 0;
         this.#updateState();
      }
   }

   #eventHandler() {
      this.cvs.click(({ clientX, clientY }) => {
         if (this.eraserSelected) {
            this.#setupBlock(clientX, clientY, "remove");
         } else {
            this.#setupBlock(clientX, clientY, "add");
         }
      });
      this.cvs.on("mousemove", ({ clientX, clientY }) => {
         this.#setupBlock(clientX, clientY, "hover");
      });
      this.cvs.on("touchstart", ({ touches }) => {
         this.#setupBlock(touches[0].clientX, touches[0].clientY, "hover");
      });
      this.cvs.on("touchmove", ({ touches }) => {
         this.#setupBlock(touches[0].clientX, touches[0].clientY, "hover");
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

   #updateState() {
      this.currentState++;
      this.state = this.state.slice(0, this.currentState);
      this.state.push(structuredClone(this.blocks));
   }

   #resetCppBlocks() {
      makerInit();
      this.blocks.forEach((cols) =>
         cols.forEach(({ x, y, health }) => {
            makerAddBlock(x, y, health);
         })
      );
   }

   undo() {
      if (this.currentState > 0) {
         this.blocks = this.state[--this.currentState];
      } else {
         this.blocks = structuredClone(this.defaults);
      }
      this.#resetCppBlocks();
   }

   redo() {
      if (this.currentState < this.state.length - 1) {
         this.blocks = this.state[this.currentState++];
      } else {
         this.blocks = this.state[this.currentState];
      }
      this.#resetCppBlocks();
   }

   getLevel() {
      const { x, y, health } = this.blocks;
      alert(`"${JSON.stringify({ x, y, health })}"`);
      return { x, y, health };
   }
}
