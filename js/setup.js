rootStyle.setProperty("--window-width", `${WIDTH}px`);
rootStyle.setProperty("--window-height", `${HEIGHT}px`);
rootStyle.setProperty("--s", `${DELTA_SIZE}px`);
rootStyle.setProperty("--rows", rows);
rootStyle.setProperty("--cols", cols * SCALE_H / SCALE);
rootStyle.setProperty("--pScale", pScale);
if (!isMobile) rootStyle.setProperty("--cursor", "pointer");

const CVS = $("#myCanvas");
const previewCanvas = $("#preview");
const pCtx = previewCanvas.getContext("2d");
const ctx = CVS.getContext("2d");

CVS.width = SCALE * 9;
CVS.height = SCALE * 16;
previewCanvas.width = SCALE * rows * pScale;
previewCanvas.height = SCALE_H * cols * pScale;

ctx.imageSmoothingQuality = "high";
pCtx.imageSmoothingQuality = "high";

const animation = new Animation(FPS);
const lvlMaker = new LevelMaker(rows, cols, SCALE, SCALE_H, CVS);
const playLevel = new PlayLevel();
const pad = new Pad(400, 800, 80, 40, CVS);


if (window.DeviceOrientationEvent) {
   mobileErr.innerHTML = "true"
   window.addEventListener("deviceorientation", (e) => {
      const { beta, gamma } = e;

      mobileErr.innerHTML += `beta: ${beta}; gamma: ${gamma}\n`;

      // const g = map(gamma * 10, -winw / 2, winw / 2, 0, winw - this.pad.w / (2 * SCALE));
      // this.x += gamma;
      // );
      // if (0 <= g && winw - this.pad.w >= g) {
      //    if ((beta > 120 && beta < 180) || (beta > 120 && beta < 180)) {
      //       this.pad.x = winw - this.pad.w - g;
      //    } else {
      //       this.pad.x = g;
      //    }
      // }
   });
}

let levels = [];
let currentSelectedLevel; // store level map

function createHtmlLevels(levels, levelsMap) {
   levelsMap.innerHTML = "";

   const htmlLevels = [];

   for (let i = 0; i < levels.length; i++) {
      const mainEle = document.createElement("div");
      mainEle.classList.add("level", "lock");

      const top = document.createElement("div");
      top.classList.add("top");

      const hashtag = document.createElement("div");
      hashtag.classList.add("hashtag");

      const hashtagIcon = document.createElement("i");
      hashtagIcon.classList.add("sbi-trophy2");
      const p = document.createElement("p");
      p.innerHTML = "00";

      const isLockOrComplete = document.createElement("div");
      isLockOrComplete.classList.add("is-lock-or-complete");
      const lock = document.createElement("i");
      lock.classList.add("sbi-lock-outline", "lock");
      const check = document.createElement("i");
      check.classList.add("sbi-check-circle-outline", "check");

      const iconAndNo = document.createElement("div");
      iconAndNo.classList.add("icon-and-no");
      const icon = document.createElement("i");
      icon.classList.add("sbi-fire");
      const no = document.createElement("p");
      no.classList.add("no");
      no.innerHTML = i + 1;

      const completeTime = document.createElement("div");
      completeTime.classList.add("complete-time");
      const timeIcon = document.createElement("i");
      timeIcon.classList.add("sbi-stopwatch1");
      const time = document.createElement("p");
      time.classList.add("time");
      time.innerHTML = "000";
      const s = document.createElement("span");
      s.innerHTML = "s";

      mainEle.appendChild(top);
      top.appendChild(hashtag);
      hashtag.appendChild(hashtagIcon);
      hashtag.appendChild(p);
      top.appendChild(isLockOrComplete);
      isLockOrComplete.appendChild(lock);
      isLockOrComplete.appendChild(check);

      mainEle.appendChild(iconAndNo);
      iconAndNo.appendChild(icon);
      iconAndNo.appendChild(no);

      mainEle.appendChild(completeTime);
      completeTime.appendChild(timeIcon);
      completeTime.appendChild(time);
      completeTime.appendChild(s);

      htmlLevels.push([mainEle, no, time]);
      levelsMap.appendChild(mainEle);
   }
   htmlLevels[0][0].classList.remove("lock");
   return htmlLevels;
}
