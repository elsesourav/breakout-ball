const previewClose = $("#previewClose");
const startPreview = $("#startPreview");
const startButton = $("#startButton");
previewClose.click(() => startPreview.classList.remove("active"));

// Start Game
startButton.click(() => {
   CVS.classList.add("active");
   startPreview.classList.remove("active");
   playLevel.setup(currentSelectedLevel);
   animation.start(playGame);
});

const lvlOptions = $$("#levelDesigner .option");
lvlOptions.click((_, ele, i) => {
   lvlOptions.each((e) => e.classList.remove("active"));
   ele.classList.add("active");

   if (i <= 4) lvlMaker.selectHealth(i + 1);
   else if (i === 5) lvlMaker.selectWall(i + 1);
   else if (i === 6) lvlMaker.selectEraser(i + 1);
});

let spaceIsDown = false;

addEventListener("keydown", ({ keyCode }) => {
   if (keyCode === 32) spaceIsDown = true;

   if (spaceIsDown) {
      // get value 1 to 5 (e.g: 49 - 48 = 1, 50 - 48 = 2, ...)
      if (keyCode >= 49 && keyCode <= 53) {
         const i = keyCode - 48;
         lvlOptions.each((e) => e.classList.remove("active"));
         lvlOptions[i - 1].classList.add("active");
         lvlMaker.selectHealth(i);
      } else if (keyCode === 87) {
         // wall
         lvlOptions.each((e) => e.classList.remove("active"));
         lvlOptions[5].classList.add("active");
         lvlMaker.selectWall();
      } else if (keyCode === 69) {
         // eraser
         lvlOptions.each((e) => e.classList.remove("active"));
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

$("#undoBtn").click(() => {
   lvlMaker.undo();
});

$("#redoBtn").click(() => {
   lvlMaker.redo();
});

$("#saveBtn").click(() => {});
$("#closeBtn").click(() => {});

/* -------- paddle move eventListener -------- */
(() => {
   const { left, width } = STATIC_CVS.getBoundingClientRect();
   const scale = STATIC_CVS.width / width;
   let tx = WIDTH / 2;
   let isPointerLock = false;

   const moveHandler = (x) => {
      tx = (x - left) * scale;
      tx = moveTarget(tx);
   };

   const pcMoveHandler = (dx) => {
      tx += dx * 3;
      tx = moveTarget(tx);
   };

   document.body.addEventListener(
      "click",
      (e) => {
         if (!isPointerLock) {
            isPointerLock = true;
            if (STATIC_CVS.requestPointerLock) {
               STATIC_CVS.requestPointerLock();
            } else if (STATIC_CVS.webkitRequestPointerLock) {
               STATIC_CVS.webkitRequestPointerLock();
            } else if (STATIC_CVS.mozRequestPointerLock) {
               STATIC_CVS.mozRequestPointerLock();
            } else {
               console.warn("Pointer locking not supported");
               isPointerLock = false;
            }
         } else {
            document.exitPointerLock =
               document.exitPointerLock || document.mozExitPointerLock;
            document.exitPointerLock();
            isPointerLock = false;
         }
      },
      false
   );

   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);

   function pointerLockChange() {
      if (
         document.pointerLockElement === STATIC_CVS ||
         document.mozPointerLockElement === STATIC_CVS
      ) {
         STATIC_CVS.style.curser = "none";
      } else {
         STATIC_CVS.style.curser = "move";
      }
   }

   STATIC_CVS.addEventListener("mouseenter", (e) => {
      isPointerLock && pcMoveHandler(e.movementX);
   });
   STATIC_CVS.addEventListener("mousemove", (e) => {
      isPointerLock && pcMoveHandler(e.movementX);
   });

   STATIC_CVS.addEventListener("mouseenter", (e) => {
      !isPointerLock && moveHandler(e.clientX);
   });
   STATIC_CVS.addEventListener("mousemove", (e) => {
      !isPointerLock && moveHandler(e.clientX);
   });

   STATIC_CVS.addEventListener("touchstart", (e) => {
      moveHandler(e.touches[0].clientX);
   });
   STATIC_CVS.addEventListener("touchmove", (e) => {
      moveHandler(e.touches[0].clientX);
   });

   let oldGamma = 0;

   if ("Gyroscope" in window) {
      const gyro = new Gyroscope();
      gyro.start();
      gyro.addEventListener("reading", (e) => {
         const ntx = e.gamma * 5 - oldGamma;
         tx = moveTarget(ntx);
         oldGamma = e.gamma;
      });
      gyro.addEventListener("error", (e) => {
         console.error(e);
      });
   }


   // if (window.DeviceOrientationEvent) {
   //    window.addEventListener("deviceorientation", (e) => {
   //       const ntx = e.gamma * 5 - oldGamma;
   //       tx = moveTarget(ntx);
   //       oldGamma = e.gamma;
   //    });
   // }
})();
