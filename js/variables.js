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
const FPS = 6;
const FRAME_RATE = 1000 / FPS;
const pScale = 0.7;
const FOOTER_HEIGHT = SCALE_H * 2.4;
const PAD_WIDTH = SCALE * 2.4;
const PAD_HEIGHT = SCALE_H * 0.6;
const BALL_RADIUS = SCALE_H * 0.35;
const BALL_SPEED = 5;

const CVS = $("#myCanvas");
const previewCanvas = $("#preview");
const pCtx = previewCanvas.getContext("2d");
const ctx = CVS.getContext("2d");





/* [{"x":2,"y":9,"health":6},{"x":6,"y":9,"health":6},{"x":1,"y":9,"health":6},{"x":7,"y":9,"health":6},{"x":4,"y":4,"health":5},{"x":4,"y":3,"health":4},{"x":5,"y":3,"health":4},{"x":5,"y":4,"health":4},{"x":5,"y":5,"health":4},{"x":4,"y":5,"health":4},{"x":3,"y":5,"health":4},{"x":3,"y":4,"health":4},{"x":3,"y":3,"health":4},{"x":5,"y":6,"health":3},{"x":3,"y":6,"health":3},{"x":2,"y":5,"health":3},{"x":2,"y":6,"health":3},{"x":6,"y":6,"health":3},{"x":6,"y":5,"health":3},{"x":6,"y":2,"health":3},{"x":6,"y":3,"health":3},{"x":5,"y":2,"health":3},{"x":3,"y":2,"health":3},{"x":2,"y":2,"health":3},{"x":2,"y":3,"health":3},{"x":4,"y":6,"health":2},{"x":4,"y":7,"health":2},{"x":5,"y":7,"health":2},{"x":3,"y":7,"health":2},{"x":6,"y":4,"health":2},{"x":7,"y":4,"health":2},{"x":7,"y":3,"health":2},{"x":7,"y":5,"health":2},{"x":2,"y":4,"health":2},{"x":1,"y":4,"health":2},{"x":1,"y":5,"health":2},{"x":1,"y":3,"health":2},{"x":4,"y":2,"health":2},{"x":4,"y":1,"health":2},{"x":5,"y":1,"health":2},{"x":3,"y":1,"health":2},{"x":0,"y":0,"health":1},{"x":0,"y":1,"health":1},{"x":1,"y":0,"health":1},{"x":7,"y":0,"health":1},{"x":8,"y":0,"health":1},{"x":8,"y":1,"health":1},{"x":0,"y":7,"health":1},{"x":0,"y":8,"health":1},{"x":1,"y":8,"health":1},{"x":7,"y":8,"health":1},{"x":8,"y":8,"health":1},{"x":8,"y":7,"health":1},{"x":4,"y":8,"health":5},{"x":8,"y":4,"health":5},{"x":4,"y":0,"health":5},{"x":0,"y":4,"health":5}],*/