const loopFun = () => {
   update();
   draw();
   fpsCounter++;
};
const makerLoopFun = () => {
   makerDraw();
};
const animation = new Animation(FPS, loopFun);
const lvlMaker = new LevelMaker(rows, cols, SIZE, (SIZE / 4) * 3, CVS);
let currentPlayingLevel = window.levels[0];
let currentGameMode = "local";
let user = {
   name: "elsesourav"
}


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
   init = Module.cwrap("init", null, ["number", "number"]);
   draw = Module.cwrap("draw", null, []);
   update = Module.cwrap("update", null, []);
   moveLeft = Module.cwrap("moveLeft", null, []);
   moveRight = Module.cwrap("moveRight", null, []);
   moveTarget = Module.cwrap("moveTarget", "number", []);
   moveDirect = Module.cwrap("moveDirect", "number", []);
   drawBlockOnly = Module.cwrap("drawBlockOnly", null, []);
   drawOutline = Module.cwrap("drawOutline", null, []);

   makerSetup = Module.cwrap("makerSetup", null, [
      "number",
      "number",
      "number",
      "number",
      "number",
   ]);
   makerInit = Module.cwrap("makerInit", null, ["number", "number"]);
   makerDraw = Module.cwrap("makerDraw", null, []);
   makerAddBlock = Module.cwrap("makerAddBlock", null, [
      "number",
      "number",
      "number",
   ]);
   makerRemoveBlock = Module.cwrap("makerRemoveBlock", null, [
      "number",
      "number",
   ]);
   makerHoverBlock = Module.cwrap("makerHoverBlock", null, [
      "number",
      "number",
      "number",
   ]);

   setup(
      CVS_W,
      CVS_H,
      SIZE,
      PAD_X,
      PAD_Y,
      PAD_WIDTH,
      PAD_HEIGHT,
      BALL_RADIUS,
      BALL_SPEED,
      FPS
   );

   makerSetup(rows, cols, CVS_W, CVS_H, SIZE);

   const htmlLocalLevels = createHtmlLevels(window.levels, $("#localMode"));
   // const htmlOnlineLevels = createOnlineLevels(window.levels, $("#onlineMode"));
   // const htmlCreateLevels = createOnlineLevels(
   //    window.levels,
   //    $("#createMode"),
   //    true
   // );

   htmlLocalLevels.forEach(([level], i) => {
      level.addEventListener("click", () => {
         currentGameMode = "local";
         currentPlayingLevel = window.levels[i];
         setupStartPreview();
      });
   });

   // htmlOnlineLevels.forEach(([level, cvs], i) => {
   //    cvs.width = CVS_W;
   //    cvs.height = SIZE * (cols - 2.3);
   //    ctx = cvs.getContext("2d");
   //    const { aryPtr, length } = create2dAryPointer(window.levels[i]);
   //    init(aryPtr, length);
   //    draw();

   //    level.addEventListener("click", () => {
   //       currentGameMode = "online";
   //       currentPlayingLevel = window.levels[i];
   //       setupStartPreview();
   //    });
   // });

   // htmlCreateLevels.forEach(([level, cvs], i) => {
   //    cvs.width = CVS_W;
   //    cvs.height = SIZE * (cols - 2.3);
   //    ctx = cvs.getContext("2d");
   //    const { aryPtr, length } = create2dAryPointer(window.levels[i]);
   //    init(aryPtr, length);
   //    draw();

   //    level.addEventListener("click", () => {
   //       currentGameMode = "online";
   //       currentPlayingLevel = window.levels[i];
   //       setupStartPreview();
   //    });
   // });

   // levelDesigner.classList.add("active");
   // CVS.classList.add("active");
   // isLevelMakerModeOn = true;
   // makerInit();
   // lvlMaker.init();
   // ctx = CTX;
   // animation.start(makerLoopFun);
   // playLevel();
};
