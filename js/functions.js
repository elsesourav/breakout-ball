function playLevel(mode = "inGame") {
   ctx = CTX;
   CVS.classList.add("active");
   showGameStatus.classList.add("active");
   showPreview.classList = [];
   showTime.classList.remove("active");
   showHealths.classList = [];
   pushStatus(mode);
   pushStatus(mode);
   showTimeUsed.innerText = "0";
   isInOfTheGame = true;

   setTimeout(() => {
      showHealths.classList.add(`s${3}`);
      showTime.classList.add("active");
   }, 600);

   const { aryPtr, length } = create2dAryPointer(currentPlayingLevel.blocks);
   init(aryPtr, length);

   animation.start(loopFun);
}

function goHome() {
   showGameStatus.classList.remove("active");
   showPreview.classList = [];
   CVS.classList.remove("active");
   showTime.classList.remove("active");
   levelDesigner.classList.remove("active");
   ctx = CTX;
   animation.stop();
   showHealths.classList = [];
   pushStatus("home");
   pushStatus("home");
   isInOfTheGame = false;
   isLevelMakerModeOn = false;
}

function createHtmlLevels(nLevel, userLevels, levelsMap) {
   levelsMap.innerHTML = "";

   const htmlLevels = [];
   let userLevelLength = userLevels.length;

   for (let i = 0; i < nLevel; i++) {
      const mainEle = CE("div", ["level", "lock"]);

      const top = CE("div", ["top"], "", mainEle);

      const hashtag = CE("div", ["hashtag"], "", top);
      CE("i", ["sbi-trophy2"], "", hashtag);
      const p = CE("p", ["local-user-rank"], "∞", hashtag);

      const lockComplete = CE("div", ["is-lock-or-complete"], "", top);
      CE("i", ["sbi-lock-outline", "lock"], "", lockComplete);
      CE("i", ["sbi-check-square-o", "check"], "", lockComplete);

      const iconAndNo = CE("div", ["icon-and-no"], "", mainEle);
      CE("i", ["sbi-fire"], "", iconAndNo);
      const no = CE("p", ["no"], i + 1, iconAndNo);

      const completeTime = CE("div", ["complete-time"], "", mainEle);
      CE("i", ["sbi-stopwatch1"], "", completeTime);
      const time = CE("p", ["time"], "∞", completeTime);
      CE("span", [], "s", completeTime);

      if (userLevels[i + 1]) {
         mainEle.classList.remove("lock");
         p.innerText = userLevels[i + 1].rank || "∞";
         time.innerText = userLevels[i + 1].time || "∞";
         if (userLevels[i + 1].completed) {
            mainEle.classList.add("complete");
         }
      }

      levelsMap.appendChild(mainEle);
      htmlLevels.push([mainEle, p, no, time]);
      
   }
   return htmlLevels;
}

function createOnlineLevels(numOfLevel, levelsMap) {
   levelsMap.innerHTML = "";
   const htmlLevels = [];

   for (let i = 0; i < numOfLevel; i++) {
      const mainEle = CE("div", ["level"]);
      const cvs = CE("canvas", ["levelCvs"]);
      const details = CE("div", ["details"]);
      const playCount = CE("div", ["playCount"], "", details);
      CE("i", ["sbi-play-circle"], "", playCount);
      const count = CE("p", ["count"], "10", playCount);
      const id = CE("p", ["id"], "ZAS", details);
      mainEle.appendChild(cvs);
      mainEle.appendChild(details);
      levelsMap.appendChild(mainEle);

      cvs.width = CVS_W;
      cvs.height = SIZE * (cols - 2.7);
      const ctx = cvs.getContext("2d");

      htmlLevels.push([mainEle, ctx, count, id]);
   }
   return htmlLevels;
}

function createUserLevels(max, levelsMap) {
   levelsMap.innerHTML = "";
   const htmlLevels = [];

   for (let i = 0; i < max; i++) {
      const mainEle = CE("div", ["level"]);

      const privacy = CE("div", ["privacy"], "", mainEle);
      CE("i", ["sbi-groups"], "", privacy);
      CE("i", ["sbi-person"], "", privacy);
      const cvs = CE("canvas", ["levelCvs"]);
      const details = CE("div", ["details"]);
      const playCount = CE("div", ["playCount"], "", details);
      CE("i", ["sbi-play-circle"], "", playCount);
      const count = CE("p", ["count"], "10", playCount);
      const id = CE("p", ["id"], "SB", details);
      const setting = CE("p", ["sbi-settings", "setting"], "", details);

      mainEle.appendChild(cvs);
      mainEle.appendChild(details);
      levelsMap.appendChild(mainEle);

      cvs.width = CVS_W;
      cvs.height = SIZE * (cols - 2.7);
      const ctx = cvs.getContext("2d");

      htmlLevels.push([mainEle, cvs, ctx, count, id, setting, privacy]);
   }
   return htmlLevels;
}

function safeEventListener(element, fun, ary = [], action = "click") {
   element.removeEventListener(action, element._fn);
   element._fn = () => {
      return fun(ary);
   };
   element.addEventListener(action, element._fn);
}

function loadingWindow(is = false) {
   waitingWindow.classList.toggle("active", is);
}