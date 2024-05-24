const O_H = innerHeight; //ORIGINAL HEIGHT
const O_W = innerWidth; //ORIGINAL WIDTH
// ratio 9x16 for game window dimensions
const DELTA_SIZE = Math.floor(O_W * (16 / 9) < O_H ? O_W / 9 : O_H / 16);
const WIDTH = DELTA_SIZE * 9;
const HEIGHT = DELTA_SIZE * 16;

const SIZE = 128;
const SCALE = DELTA_SIZE;
const SCALE_H = DELTA_SIZE / (4 / 3);
const CVS_W = SIZE * 9;
const CVS_H = SIZE * 16;
const rows = 9;
const cols = 10;
const FPS = 60;
const FRAME_RATE = 1000 / FPS;
const pScale = 0.8;
const PAD_X = CVS_W / 2;
const FOOTER_HEIGHT = SIZE * 1.6;
const PAD_WIDTH = SIZE * 2;
const PAD_Y = CVS_H - FOOTER_HEIGHT;
const PAD_HEIGHT = SIZE * 0.4;
const BALL_RADIUS = SIZE * 0.22;
const BALL_SPEED = 15;

const CVS = $("#mainCanvas");
const previewCanvas = $("#preview");
const CTX = CVS.getContext("2d");
const PREVIEW_CTX = previewCanvas.getContext("2d");
let ctx = CTX;
const paddleImage = createPaddleImage();
const ballImage = createBallImage();
const blockImages = createBlockImages();

const alert = new AlertHTML({
   title: "Exit",
   message: "Are you sure you want to Exit this game?",
   btnNm1: "No",
   btnNm2: "Yes",
   titleHeight: 40,
   buttonHeight: 45,
   width: 290,
});

let fpsCounter = 0;
let currentLevelIndex = 0;
let init,
   setup,
   draw,
   update,
   moveLeft,
   moveRight,
   moveTarget,
   moveDirect,
   drawBlockOnly,
   drawOutline,
   getTotalFPS; 

const loopFun = () => {
   update();
   draw();
   fpsCounter++;
};
const animation = new Animation(FPS, loopFun);

Module.onRuntimeInitialized = () => {
   setup = Module.cwrap("setup", null, [
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
      "number",
   ]);
   init = Module.cwrap("init", null, ["string"]);
   draw = Module.cwrap("draw", null, []);
   update = Module.cwrap("update", null, []);
   moveLeft = Module.cwrap("moveLeft", null, []);
   moveRight = Module.cwrap("moveRight", null, []);
   moveTarget = Module.cwrap("moveTarget", "number", []);
   moveDirect = Module.cwrap("moveDirect", "number", []);
   drawBlockOnly = Module.cwrap("drawBlockOnly", null, []);
   drawOutline = Module.cwrap("drawOutline", null, []);
   getTotalTime = Module.cwrap("getTotalTime", "number", []);

   setup(
      rows,
      cols,
      SIZE,
      PAD_X,
      PAD_Y,
      PAD_WIDTH,
      PAD_HEIGHT,
      BALL_RADIUS,
      BALL_SPEED,
      FPS
   );

   const htmlLocalLevels = createHtmlLevels(window.levels, $("#localMode"));
   const htmlOnlineLevels = createOnlineLevels(window.levels, $("#onlineMode"));
   const htmlCreateLevels = createOnlineLevels(
      window.levels,
      $("#createMode"),
      true
   );

   htmlLocalLevels.forEach(([level], i) => {
      level.addEventListener("click", () => {
         setupStartPreview(i);
         currentLevelIndex = i;
      });
   });

   htmlOnlineLevels.forEach(([level, cvs], i) => {
      cvs.width = CVS_W;
      cvs.height = SIZE * (cols - 2.3);
      ctx = cvs.getContext("2d");
      init(createStringLevel(window.levels[i]));
      draw();

      level.addEventListener("click", () => {
         setupStartPreview(i);
         currentLevelIndex = i;
      });
   });

   htmlCreateLevels.forEach(([level, cvs], i) => {
      cvs.width = CVS_W;
      cvs.height = SIZE * (cols - 2.3);
      ctx = cvs.getContext("2d");
      init(createStringLevel(window.levels[i]));
      draw();

      level.addEventListener("click", () => {
         setupStartPreview(i);
         currentLevelIndex = i;
      });
   });

   // playLevel(window.levels[currentLevelIndex]);
};

() => {
   const level = createStringLevel(window.levels[1]);
   init(level);

   setInterval(() => {
      mobileErr.innerHTML = fpsCounter;
      fpsCounter = 0;
   }, 1000);
};
