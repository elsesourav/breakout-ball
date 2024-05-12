const O_H = innerHeight; //ORIGINAL HEIGHT
const O_W = innerWidth; //ORIGINAL WIDTH
// ratio 9x16 for game window dimensions
const DELTA_SIZE = Math.floor(O_W * (16 / 9) < O_H ? O_W / 9 : O_H / 16);
const WIDTH = DELTA_SIZE * 9;
const HEIGHT = DELTA_SIZE * 16;

const SCALE = DELTA_SIZE;
const SCALE_H = DELTA_SIZE / (4 / 3);
const CVS_W = SCALE * 9;
const CVS_H = SCALE * 16;
const rows = 9;
const cols = 10;
const FPS = 60;
const FRAME_RATE = 1000 / FPS;
const pScale = 0.7;
const FOOTER_HEIGHT = SCALE_H * 2.4;
const PAD_WIDTH = SCALE * 2.4;
const PAD_HEIGHT = SCALE_H * 0.6;
const BALL_RADIUS = SCALE_H * 0.35;
const BALL_SPEED = 5;
const SIZE = 128;

const CVS = $("#myCanvas");
const previewCanvas = $("#preview");
const pCtx = previewCanvas.getContext("2d");
const ctx = CVS.getContext("2d");

Module.onRuntimeInitialized = () => {
   const initialize = Module.cwrap("initialize", null, [
      "number",
      "number",
      "number",
   ]);
   const setLevel = Module.cwrap("setLevel", null, ["string"]);

   // initialize(rows, cols, SIZE);

   let levelStr = "";
   const level = window.levels[0];
   
   for (let i = 0; i < level.length; i++) {
      for (const key in level[i]) levelStr += `${level[i][key]}-`;
   }
   setLevel(levelStr);
};
