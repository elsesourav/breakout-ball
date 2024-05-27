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
      this.blocks = [];
   }

   init() {
      this.blocks = [];
      this.states = [];
      this.selectedHealth = 1;
      this.currentState = 0;
      this.eraserSelected = false;
      this.spaceIsDown = false;
      this.isDragging = false;

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

   #confirmExit() {
      if (this.blocks.some((c) => c.some((e) => e.health > 0))) {
         const alert = new AlertHTML({
            title: "Exit Level Creation",
            message: "Are you sure you want to exit level creation?",
         });
         alert.show();
         alert.clickBtn1(() => {
            alert.hide();
         });
         alert.clickBtn2(() => {
            alert.hide();
            goHome();
         });
         return;
      }
      goHome();
   }

   #confirmSave() {
      if (this.blocks.some((c) => c.some((e) => e.health > 0 && e.health < 6))) {
         const alert = new AlertHTML({
            title: "Confirm Save and Exit",
            message: "Are you sure you want to save this level? After saving, you will not be able to modify this level.",
         });
         alert.show();
         alert.clickBtn1(() => {
            alert.hide();
         });
         alert.clickBtn2(() => {
            alert.hide();
            goHome();
         });
         return;
      } else {
         const alert = new AlertHTML({
            title: "Level Con't Empty",
            message: "You must add at least one destroyable block, (HP 1-5). The level cannot be empty.",
            btnNm1: "Okay",
            oneBtn: true
         });
         alert.show();
         alert.clickBtn1(() => {
            alert.hide();
         });
         return;
      }
   }

   #eventHandler() {
      this.cvs.addEventListener("click", (e) => this.#setupBlock(e));
      this.cvs.addEventListener("mousedown", () => (this.isDragging = true));
      this.cvs.addEventListener("mousemove", (e) => this.#setupBlock(e));
      this.cvs.addEventListener("mouseup", () => (this.isDragging = false));
      this.cvs.addEventListener("touchstart", (e) => (this.isDragging = true));
      this.cvs.addEventListener("touchmove", (e) => this.#setupBlock(e));
      this.cvs.addEventListener("touchend", () => (this.isDragging = false));

      const lvlOptions = $$("#levelDesigner .option");

      lvlOptions.click((_, ele, i) => {
         lvlOptions.removeClass("active");
         ele.classList.add("active");
         if (i <= 4) lvlMaker.selectHealth(i + 1);
         else if (i === 5) lvlMaker.selectWall(i + 1);
         else if (i === 6) lvlMaker.selectEraser(i + 1);
      });

      addEventListener("keydown", ({ keyCode }) => {
         if (keyCode === 32) this.spaceIsDown = true;

         if (this.spaceIsDown) {
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
         if (keyCode === 32) this.spaceIsDown = false;
      });

      addEventListener("keydown", ({ keyCode }) => {
         if (keyCode === 37) moveLeft();
         else if (keyCode === 39) moveRight();
      });

      $("#undoBtn").click(() => lvlMaker.undo());
      $("#redoBtn").click(() => lvlMaker.redo());

      $("#saveBtn").click(() => this.#confirmSave());
      $("#makeTesting").click(() => {
         playLevel(this.blocks);
      });

      $("#closeBtn").click(() => this.#confirmExit());

      $("#createLevel").click(() => {
         levelDesigner.classList.add("active");
         CVS.classList.add("active");
         pushStatus("testing");
         pushStatus("testing");
         isLevelMakerModeOn = true;
         makerInit();
         lvlMaker.init();
         ctx = CTX;
         animation.start(makerLoopFun);
      });
   }

   #setupBlock(e) {
      let select;
      const { clientX, clientY } = e.type === "touchmove" ? e.touches[0] : e;

      if (this.eraserSelected) {
         select = this.isDragging || e.type === "click" ? "remove" : "hover";
      } else {
         select = this.isDragging || e.type === "click" ? "add" : "hover";
      }

      const { left, top, width } = this.cvs.getBoundingClientRect();
      const ratio = this.cvs.width / width;
      const NX = Math.floor(((clientX - left) * ratio) / this.w);
      const NY = Math.floor(((clientY - top) * ratio) / this.h);

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
