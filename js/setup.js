rootStyle.setProperty("--window-width", `${WIDTH}px`);
rootStyle.setProperty("--window-height", `${HEIGHT}px`);
rootStyle.setProperty("--s", `${DELTA_SIZE}px`);
rootStyle.setProperty("--rows", rows);
rootStyle.setProperty("--cols", (cols * SCALE_H) / SCALE);
rootStyle.setProperty("--pScale", pScale);
if (!isMobile) rootStyle.setProperty("--cursor", "pointer");

previewCanvas.width = CVS.width = CVS_W;
CVS.height = CVS_H;
previewCanvas.height = SIZE * (cols - 1);

ctx.imageSmoothingQuality = "high";
PREVIEW_CTX.imageSmoothingQuality = "high";

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

function createOnlineLevels(levels, levelsMap, flag = false) {
   levelsMap.innerHTML = "";
   const htmlLevels = [];

   for (let i = 0; i < levels.length; i++) {
      const mainEle = CE("div", ["level"]);
      const cvs = CE("canvas", ["levelCvs"]);
      const details = CE("div", ["details"]);
      const playCount = CE("div", ["playCount"], "", details);
      CE("i", ["sbi-play-circle"], "", playCount);
      const count = CE("p", ["count"], "10", playCount);
      const id = CE("p", ["id"], "ZAS", details);
      const _delete = flag
         ? CE("p", ["sbi-trash-o", "delete"], "", details)
         : "";

      mainEle.appendChild(cvs);
      mainEle.appendChild(details);
      levelsMap.appendChild(mainEle);

      htmlLevels.push([mainEle, cvs, count, id, _delete]);
   }
   return htmlLevels;
}

{
   /* <div class="level">
   <div class="top">
      <div class="hashtag">
         <i class="sbi-trophy2"></i>
         <p>00</p>
      </div>
      <div class="is-lock-or-complete">
         <i class="sbi-lock-outline lock"></i
         ><i class="sbi-check-circle-outline check"></i>
      </div>
   </div>
   <div class="icon-and-no">
      <i class="sbi-fire"></i>
      <p class="no">1</p>
   </div>
   <div class="complete-time">
      <i class="sbi-stopwatch1"></i>
      <p class="time">000</p>
      <span>s</span>
   </div>
</div> */
}

{
   /* <div class="level">
   <canvas class="levelCvs"></canvas>
   <div class="details">
      <div class="playCount">
         <i class="sbi-play-circle"></i>
         <p class="count">10</p>
      </div>
      <p class="id">ZAS</p>
      <p class="delete"></p>
   </div>
</div> */
}
