replaceState();

function loopFun() {
   update();
   draw();
   fpsCounter++;
};

function makerLoopFun() {
   makerDraw();
};
const animation = new Animation(FPS, loopFun);
const lvlMaker = new LevelMaker(rows, cols, SIZE, (SIZE / 4) * 3, CVS);
const pagesElement = document.getElementById("pages");

const PAGES = new Pages(MAX_PAGE_BUTTON, pagesElement, setupOnlineLevels);

setup(CVS_W, CVS_H, SIZE, PAD_X, PAD_Y, PAD_WIDTH, PAD_HEIGHT, BALL_RADIUS, BALL_SPEED, FPS);
makerSetup(rows, cols, CVS_W, CVS_H, SIZE);