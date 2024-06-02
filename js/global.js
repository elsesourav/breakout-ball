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
const cols = 11;
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


const MAX_PAGE_RENDER = 20;
const MAX_PAGE_BUTTON = 5;
let currentPageIndex = 0;
let maxPagePossible = 5;

let isLevelMakerModeOn = false;
let isInOfTheGame = true;
let fpsCounter = 0;
let init, setup, draw, update;
let moveLeft, moveRight, moveTarget, moveDirect, drawBlockOnly, drawOutline;
let makerSetup, makerInit, makerDraw;
let makerAddBlock, makerRemoveBlock, makerHoverBlock;
let currentPlayingLevel;
let currentGameMode = "local";

let tempUser = {}

//use cssRoot.style.setProperty("key", "value");
const rootStyle = document.querySelector(":root").style;

// when run this app in mobile is return true
const isMobile =
   localStorage.mobile ||
   "ontouchstart" in window ||
   navigator.maxTouchPoints > 0 ||
   navigator.msMaxTouchPoints > 0;

// minimum window size
const minSize = innerWidth > innerHeight ? innerHeight : innerWidth;

rootStyle.setProperty("--window-width", `${WIDTH}px`);
rootStyle.setProperty("--window-height", `${HEIGHT}px`);
rootStyle.setProperty("--s", `${DELTA_SIZE}px`);
rootStyle.setProperty("--rows", rows);
rootStyle.setProperty("--cols", (cols * SCALE_H) / SCALE);
rootStyle.setProperty("--pScale", pScale);
if (!isMobile) rootStyle.setProperty("--cursor", "pointer");
