rootStyle.setProperty("--window-width", `${WIDTH}px`);
rootStyle.setProperty("--window-height", `${HEIGHT}px`);
rootStyle.setProperty("--s", `${DELTA_SIZE}px`);
rootStyle.setProperty("--rows", rows);
rootStyle.setProperty("--cols", (cols * SCALE_H) / SCALE);
rootStyle.setProperty("--pScale", pScale);
if (!isMobile) rootStyle.setProperty("--cursor", "pointer");

previewCanvas.width = CVS.width = STATIC_CVS.width = CVS_W;
CVS.height = STATIC_CVS.height = CVS_H;
previewCanvas.height = SIZE * (cols - 1);

ctx.imageSmoothingQuality = "high";
STATIC_CVS.imageSmoothingQuality = "high";
PREVIEW_CTX.imageSmoothingQuality = "high";


// const animation = new Animation(FPS);
// const lvlMaker = new LevelMaker(rows, cols, SCALE, SCALE_H, CVS);


let levels = [];
let currentSelectedLevel; // store level map

function createHtmlLevels(levels, levelsMap) {
   levelsMap.innerHTML = "";

   const htmlLevels = [];

   for (let i = 0; i < levels.length; i++) {
      const mainEle = CE("div", ["level", "lock"]);

      const top = CE("div", ["top"], "", mainEle);

      const hashtag = CE("div", ["hashtag"], "", top);
      CE("i", ["sbi-trophy2"], "", hashtag);
      const p = CE("p", [], "00", hashtag);

      const lockComplete = CE("div", ["is-lock-or-complete"], "", top);
      CE("i", ["sbi-lock-outline", "lock"], "", lockComplete);
      CE("i", ["sbi-check-circle-outline", "check"], "", lockComplete);

      const iconAndNo = CE("div", ["icon-and-no"], "", mainEle);
      CE("i", ["sbi-fire"], "", iconAndNo);
      const no = CE("p", ["no"], i + 1, iconAndNo);

      const completeTime = CE("div", ["complete-time"], "", mainEle);
      CE("i", ["sbi-stopwatch1"], "", completeTime);
      const time = CE("p", ["time"], "000", completeTime);
      CE("span", [], "s", completeTime);

      levelsMap.appendChild(mainEle);
      htmlLevels.push([mainEle, p, no, time]);
   }
   htmlLevels[0][0].classList.remove("lock");
   return htmlLevels;
}

// `<div class="level">
// <div class="top">
//    <div class="hashtag">
//       <i class="sbi-trophy2"></i>
//       <p>00</p>
//    </div>
//    <div class="is-lock-or-complete">
//       <i class="sbi-lock-outline lock"></i
//       ><i class="sbi-check-circle-outline check"></i>
//    </div>
// </div>
// <div class="icon-and-no">
//    <i class="sbi-fire"></i>
//    <p class="no">1</p>
// </div>
// <div class="complete-time">
//    <i class="sbi-stopwatch1"></i>
//    <p class="time">000</p>
//    <span>s</span>
// </div>
// </div>`
