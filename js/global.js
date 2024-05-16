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
const pScale = 0.7;
const PAD_X = CVS_W / 2;
const FOOTER_HEIGHT = SIZE * 1.6;
const PAD_WIDTH = SIZE * 2.5;
const PAD_Y = CVS_H - FOOTER_HEIGHT;
const PAD_HEIGHT = SIZE * 0.4;
const BALL_RADIUS = SIZE * 0.25;
const BALL_SPEED = 5;

const CVS = $("#myCanvas");
const previewCanvas = $("#preview");
const pCtx = previewCanvas.getContext("2d");
const ctx = CVS.getContext("2d");
const paddleImage = createPaddleImage();
const ballImage = createBallImage();
const blockImages = createBlockImages();

Module.onRuntimeInitialized = () => {
   const init = Module.cwrap("init", null, ["number", "number", "number", "string", "number", "number", "number", "number", "number", "number"]);

   
   let levelStr = "";
   const level = window.levels[0];
   
   for (let i = 0; i < level.length; i++) {
      for (const key in level[i]) levelStr += `${level[i][key]}-`;
   }
   
   init(rows, cols, SIZE, levelStr, PAD_X, PAD_Y, PAD_WIDTH, PAD_HEIGHT, BALL_RADIUS, BALL_SPEED); 

};
