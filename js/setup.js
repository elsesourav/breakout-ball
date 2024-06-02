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
const pagesElement = document.getElementById("pages");

const PAGES = new Pages(MAX_PAGE_BUTTON, pagesElement, setupOnlineLevels);
const htmlOnlineLevels = createOnlineLevels(MAX_PAGE_RENDER, $("#onlineMode"));

htmlOnlineLevels.forEach(([level], i) => {
   level.addEventListener("click", () => {
      currentGameMode = "online";
      currentPlayingLevel = window.onlineLevels[currentPageIndex * MAX_PAGE_RENDER + i];
      setupPreview();
   });
});

function setupOnlineLevel(eleAry, level) {
   const [mainEle, _ctx, count, id] = eleAry;
   mainEle.classList.add("show");
   count.innerText = level.playCount;
   id.innerText = level.id;

   ctx = _ctx;
   const { aryPtr, length } = create2dAryPointer(level.blocks);
   init(aryPtr, length);
   draw();
}

function setupOnlineLevels(current = currentPageIndex) {
   currentPageIndex = current;
   let j;
   let i = current * MAX_PAGE_RENDER;
   let n = Math.min(window.onlineLevels.length, (current + 1) * MAX_PAGE_RENDER);

   for (j = 0; i < n; i++, j++) {
      setupOnlineLevel(htmlOnlineLevels[j], window.onlineLevels[i]);
   }
   for (; j < MAX_PAGE_RENDER; j++) {
      const [mainEle] = htmlOnlineLevels[j];
      mainEle.classList.remove("show");
   }
}

function setupLocalLevel(levels) {
   const htmlLocalLevels = createHtmlLevels(
      tempUser.numLocalLevels,
      levels,
      $("#localMode")
   );

   htmlLocalLevels.every(([lvl], i) => {
      if (!levels[i + 1]) return false;

      lvl.addEventListener("click", async () => {
         currentGameMode = "local";
         currentPlayingLevel = await getLevel(i + 1);
         setupPreview();
      });
      return true;
   });
}

let htmlCreateLevels = [];

async function setupCreateLevel() {
   let levels = window.onlineLevels.filter((e) => e.creator == tempUser.username);
   levels.push(...window.privateLevels);

   if (htmlCreateLevels.length !=  levels.length) {
      htmlCreateLevels = createUserLevels(levels, $("#createMode"));

      htmlCreateLevels.forEach(([mainEle, cvs, _ctx, count, id, setting, _privacy], i) => {
         mainEle.classList.add("show");
         count.innerText = levels[i].playCount;
         id.innerText = levels[i].id;
         
         ctx = _ctx;
         const { aryPtr, length } = create2dAryPointer(levels[i].blocks);
         init(aryPtr, length);
         draw();

         const isPublic = window.onlineLevels.find(e => e.id === levels[i].id) !== undefined;
         _privacy.classList.toggle("active", !isPublic);

         setting.addEventListener("click", async () => {
            waitingWindow.classList.add("active"); 
            const data = await getUserRank(levels[i].id);
            M_lvlNo.innerText = levels[i].id;
            M_lvlRank.innerText = data.userRank !== null ? data.userRank + 1 : "∞";
            M_playCount.innerText = levels[i].playCount;

            const isPublic = window.onlineLevels.find(e => e.id === levels[i].id) !== undefined;
            privacyModifier.checked = isPublic;

            ctx = MODIFIER_CTX;
            const { aryPtr, length } = create2dAryPointer(levels[i].blocks);
            init(aryPtr, length);
            draw();

            levelModifier.classList.add("active");
            waitingWindow.classList.remove("active");

            $("#saveModifier").click(async () => {
               if (isPublic ===  privacyModifier.checked) { // same position. don't need to change anything
                  levelModifier.classList.remove("active");
               } else {
                  const un = `${tempUser.username}/`;
                  const oldPath = `levels/${isPublic ? "online" : "private"}/${isPublic ? "" : un}${levels[i].id}`;
                  const newPath = `levels/${isPublic ? "private" : "online"}/${isPublic ? un : ""}${levels[i].id}`;
                  
                  await moveData(oldPath, newPath);
                  if (!isPublic) {
                     const index = window.privateLevels.findIndex((e) => e.id === levels[i].id);
                     if (index !== -1) {
                        window.privateLevels.splice(index, 1);
                     }
                  }
                  _privacy.classList.toggle("active", isPublic);
                  levelModifier.classList.remove("active");
               } 
            }, true);

            $("#deleteLevel").click(async () => {
               const alert = new AlertHTML({
                  title: "Delete Level",
                  message: "Are you sure you want to delete this level?",
               });
               alert.show();
               alert.clickBtn1(() => {
                  alert.hide();
                  levelModifier.classList.remove("active");
               });
               alert.clickBtn2(async () => {
                  alert.hide();
                  const un = `${tempUser.username}/`;
                  const path = `levels/${isPublic ? "online" : "private"}/${isPublic ? "" : un}${levels[i].id}`;
                  await deleteData(path);
                  levelModifier.classList.remove("active");
               });
            }, true);
            
         });
         
         cvs.addEventListener("click", () => {
            currentGameMode = "online";
            currentPlayingLevel = levels[i];
            setupPreview();
         });
      });
   }
}

function loadWasm() {
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

   // const htmlLocalLevels = createHtmlLevels(window.levels, $("#localMode"));
   // const htmlOnlineLevels = createOnlineLevels(window.levels, $("#onlineMode"));
   // const htmlCreateLevels = createOnlineLevels(
   //    window.levels,
   //    $("#createMode"),
   //    true
   // );

   // htmlLocalLevels.forEach(([level], i) => {
   //    level.addEventListener("click", () => {
   //       currentGameMode = "local";
   //       currentPlayingLevel = window.levels[i];
   //       setupPreview();
   //    });
   // });

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
   //       setupPreview();
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
   //       setupPreview();
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
}
