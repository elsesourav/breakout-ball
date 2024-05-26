class LevelMaker {
   constructor(rows, cols, width, height, canvas) {
      this.rows = rows;
      this.cols = cols;
      this.w = width;
      this.h = height;
      this.cvs = canvas;

      this.selectedHealth = 1;
      this.eraserSelected = false;
      this.#eventHandler();
   }

   init() {
      this.blocks = [];
      this.states = [];
      this.selectedHealth = 1;
      this.currentState = 0;
      this.eraserSelected = false;

      this.undoStack = [];
      this.redoStack = [];

      for (let i = 0; i < this.cols; i++) {
         this.blocks[i] = [];
         for (let j = 0; j < this.rows; j++) {
            this.blocks[i][j] = { x: j, y: i, health: 0 };
         }
      }
      this.states.push(copyArray(this.blocks));
      this.#resetCppBlocks();
   }

   #eventHandler() {
      this.cvs.addEventListener("click", ({ clientX, clientY }) => {
         if (this.eraserSelected) {
            this.#setupBlock(clientX, clientY, "remove");
         } else {
            this.#setupBlock(clientX, clientY, "add");
         }
      });
      this.cvs.addEventListener("mousemove", ({ clientX, clientY }) => {
         this.#setupBlock(clientX, clientY, "hover");
      });
      this.cvs.addEventListener("touchstart", ({ touches }) => {
         this.#setupBlock(touches[0].clientX, touches[0].clientY, "hover");
      });
      this.cvs.addEventListener("touchmove", ({ touches }) => {
         this.#setupBlock(touches[0].clientX, touches[0].clientY, "hover");
      });

      const lvlOptions = $$("#levelDesigner .option");

      lvlOptions.click((_, ele, i) => {
         lvlOptions.removeClass("active");
         ele.classList.add("active");
         if (i <= 4) lvlMaker.selectHealth(i + 1);
         else if (i === 5) lvlMaker.selectWall(i + 1);
         else if (i === 6) lvlMaker.selectEraser(i + 1);
      });

      let spaceIsDown = false;

      addEventListener("keydown", ({ keyCode }) => {
         if (keyCode === 32) spaceIsDown = true;

         if (spaceIsDown) {
            if (keyCode >= 49 && keyCode <= 53) {
               // get value 1 to 5 (e.g: 49 - 48 = 1, 50 - 48 = 2, ...)
               const i = keyCode - 48;
               lvlOptions.removeClass("active");
               lvlOptions[i - 1].classList.add("active");
               lvlMaker.selectHealth(i);
            } else if (keyCode === 87) {
               // wall
               lvlOptions.removeClass("active");
               lvlOptions[5].classList.add("active");
               lvlMaker.selectWall();
            } else if (keyCode === 69) {
               // eraser
               lvlOptions.removeClass("active");
               lvlOptions[6].classList.add("active");
               lvlMaker.selectEraser();
            } else if (keyCode === 90) {
               // undo
               lvlMaker.undo();
            } else if (keyCode === 89) {
               // redo
               lvlMaker.redo();
            } else if (keyCode === 83) {
               // save
            } else if (keyCode === 67) {
               // close
            }
         }
      });

      addEventListener("keyup", ({ keyCode }) => {
         if (keyCode === 32) spaceIsDown = false;
      });

      addEventListener("keydown", ({ keyCode }) => {
         if (keyCode === 37) moveLeft();
         else if (keyCode === 39) moveRight();
      });

      $("#undoBtn").click(() => {
         lvlMaker.undo();
      });

      $("#redoBtn").click(() => {
         lvlMaker.redo();
      });

      $("#saveBtn").click(() => {});
      $("#closeBtn").click(() => {});
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
         this.addBlock(NX, NY, this.selectedHealth);
      } else if (select == "hover") {
         if (this.eraserSelected) makerHoverBlock(NX, NY, 0);
         else makerHoverBlock(NX, NY, this.selectedHealth);
      } else if (select == "remove") {
         this.removeBlock(NX, NY);
      }
   }

   addBlock(NX, NY, health) {
      if (this.blocks[NY][NX].health === health) return;

      this.states.splice(this.currentState + 1, this.states.length);
      this.currentState++;
      this.blocks[NY][NX].health = health;
      this.states.push(copyArray(this.blocks));
      makerAddBlock(NX, NY, health);
   }

   removeBlock(NX, NY) {
      this.states.splice(this.currentState + 1, this.states.length);
      this.currentState++;
      this.blocks[NY][NX].health = 0;
      this.states.push(copyArray(this.blocks));
      makerRemoveBlock(NX, NY);
   }

   #resetCppBlocks() {
      const { aryPtr, length } = create2dAryPointer([].concat(...this.blocks));
      makerInit(aryPtr, length);
   }

   redo() {
      if (this.currentState < this.states.length - 1) {
         this.blocks = copyArray(this.states[++this.currentState]);
         this.#resetCppBlocks();
      }
   }

   undo() {
      if (this.currentState > 0) {
         this.blocks = copyArray(this.states[--this.currentState]);
         this.#resetCppBlocks();
      }
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

   getLevel() {}
}
