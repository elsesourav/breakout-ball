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
const paddleImage = createPaddleImage();
const ballImage = createBallImage();
const blockImages = createBlockImages();
let ctx = CTX;

previewCanvas.width = CVS.width = CVS_W;
CVS.height = CVS_H;
previewCanvas.height = SIZE * (cols - 1);

ctx.imageSmoothingQuality = "high";
PREVIEW_CTX.imageSmoothingQuality = "high";

let isLevelMakerModeOn = false;
let isInOfTheGame = true;
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
   makerSetup,
   makerInit,
   makerDraw,
   makerAddBlock,
   makerRemoveBlock,
   makerHoverBlock;

rootStyle.setProperty("--window-width", `${WIDTH}px`);
rootStyle.setProperty("--window-height", `${HEIGHT}px`);
rootStyle.setProperty("--s", `${DELTA_SIZE}px`);
rootStyle.setProperty("--rows", rows);
rootStyle.setProperty("--cols", (cols * SCALE_H) / SCALE);
rootStyle.setProperty("--pScale", pScale);
if (!isMobile) rootStyle.setProperty("--cursor", "pointer");
