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



