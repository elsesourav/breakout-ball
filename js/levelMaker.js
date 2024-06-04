class LevelMaker {
   constructor(rows, cols, width, height, canvas) {
      this.rows = rows;
      this.cols = cols;
      this.width = width;
      this.height = height;
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
            this.blocks[i][j] = { x: j, y: i, h: 0 };
         }
      }
      this.states.push(copyArray(this.blocks));
      this.#resetCppBlocks();
   }

   confirmExit() {
      if (this.blocks.some((c) => c.some((e) => e.h > 0))) {
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

   #showEmptyAlert() {
      const alert = new AlertHTML({
         title: "Level Con't Empty",
         message: "You must add at least one destroyable block, (HP 1-5). The level cannot be empty.",
         btnNm1: "Okay",
         oneBtn: true,
      });
      alert.show();
      alert.clickBtn1(() => {
         alert.hide();
      });
   }

   #runLevel() {
      if (this.blocks.some((c) => c.some((e) => e.h > 0 && e.h < 6))) {
         currentPlayingLevel = this.getLevel();
         currentGameMode = "testing";
         playLevel("testing");
         levelDesigner.classList.remove("active");
      } else {
         this.#showEmptyAlert();
      }
   }

   #confirmSave() {
      if (this.blocks.some((c) => c.some((e) => e.h > 0 && e.h < 6))) {
         const alert = new AlertHTML({
            title: "Confirm Save and Exit",
            btnNm1Color: "#00ffff",
            btnNm2Color: "#1eff00",
            titleColor: "#1eff00",
            message:
               "Are you sure you want to save this level? After saving, you will not be able to modify this level.",
         });
         alert.show();
         alert.clickBtn1(() => {
            alert.hide();
         });
         alert.clickBtn2(async () => {
            alert.hide();
            const isPublic = privacy.checked;
            const newLevel = this.getLevel();
            animation.stop();
            const isUpload = isPublic ? await saveLevel(newLevel) : await saveLevelPrivate(newLevel);
            if (isUpload) {
               goHome();
            } else {
               const alert = new AlertHTML({
                  title: "Save Error",
                  message: "There was an error saving your level. Please try again.",
                  btnNm1: "Okay",
                  oneBtn: true,
               });
               alert.show();
               alert.clickBtn1(() => {
                  alert.hide();
               });
            }
         });
         return;
      } else {
         this.#showEmptyAlert();
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

      undoBtn.click(() => lvlMaker.undo());
      redoBtn.click(() => lvlMaker.redo());

      saveBtn.click(() => this.#confirmSave());
      makeTesting.click(() => this.#runLevel());

      closeBtn.click(() => this.confirmExit());

      createLevel.click(() => {
         if (MAX_LEVEL_CAN_CREATE > totalCreatedLevel) {
            this.show();
            lvlMaker.init();
         } else {
            const alert = new AlertHTML({
               title: `Level Limit Reached`,
               message: `You have reached the maximum number of levels you can create. Please delete some levels to create more. (Max Limit ${MAX_LEVEL_CAN_CREATE})`,
               btnNm1: "Okay",
               oneBtn: true,
            });
            alert.show();
            alert.clickBtn1(() => {
               alert.hide();
            });
         }
      });
   }

   show() {
      inGame = true;
      stopBackgroundAudio();
      showGameStatus.classList.remove("active");
      showPreview.classList.remove("active");
      levelDesigner.classList.add("active");
      CVS.classList.add("active");
      pushStatus("createMode");
      pushStatus("createMode");
      privacy.checked = true;
      isLevelMakerModeOn = true;
      makerInit();
      ctx = CTX;
      ctx.clearRect(0, 0, CVS.width, CVS.height);
      setTimeout(() => {
         this.#resetCppBlocks();
         animation.start(makerLoopFun);
      }, 300);
   }

   #setupBlock(e) {
      wav.click.currentTime = 0;
      wav.click.play();
      let select;
      const { clientX, clientY } = e.type === "touchmove" ? e.touches[0] : e;

      if (this.eraserSelected) {
         select = this.isDragging || e.type === "click" ? "remove" : "hover";
      } else {
         select = this.isDragging || e.type === "click" ? "add" : "hover";
      }

      const { left, top, width } = this.cvs.getBoundingClientRect();
      const ratio = this.cvs.width / width;
      const NX = Math.floor(((clientX - left) * ratio) / this.width);
      const NY = Math.floor(((clientY - top) * ratio) / this.height);

      if (NX > this.rows - 1 || NY > this.cols - 1 || NX < 0 || NY < 0) {
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

   addBlock(NX, NY, h) {
      if (this.blocks[NY][NX].h === h) return;

      this.states.splice(this.currentState + 1, this.states.length);
      this.currentState++;
      this.blocks[NY][NX].h = h;
      this.states.push(copyArray(this.blocks));
      makerAddBlock(NX, NY, h);
   }

   removeBlock(NX, NY) {
      this.states.splice(this.currentState + 1, this.states.length);
      this.currentState++;
      this.blocks[NY][NX].h = 0;
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

   selectHealth(h) {
      this.selectedHealth = h;
      this.eraserSelected = false;
   }

   selectWall() {
      this.selectedHealth = 6;
      this.eraserSelected = false;
   }

   selectEraser() {
      this.eraserSelected = true;
   }

   getLevel() {
      const lvl = [];
      this.blocks.forEach((cols) => {
         cols.forEach(({ x, y, h }) => {
            if (h > 0) lvl.push({ x: x, y: y, h: h });
         });
      });
      return {
         id: generateUniqueId(),
         creator: tempUser.username,
         playCount: 0,
         blocks: lvl,
      };
   }
}
