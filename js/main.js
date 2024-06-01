const startButton = $("#startButton");
const showHealths = $("#showHealths");
const showCountDowns = $("#showCountDowns");
const showGameStatus = $("#showGameStatus");
const showTime = $("#showTime");
const showTimeUsed = $("#showTimeUsed");
const lvlTime = $("#lvlTime");
// const createNewLevel = $("#createNewLevel");

replaceState();

function lvlEditor() {
   lvlMaker.draw(ctx, CVS.width, CVS.height);
}

const pagesElement = document.getElementById("pages");

const PAGES = new Pages(MAX_PAGE_BUTTON, pagesElement, pageClickAction);
const htmlOnlineLevels = createOnlineLevels(MAX_PAGE_RENDER, $("#onlineMode"));

htmlOnlineLevels.forEach(([level], i) => {
   level.addEventListener("click", () => {
      currentGameMode = "online";
      currentPlayingLevel = window.onlineLevels[currentPageIndex * MAX_PAGE_RENDER + i];
      setupStartPreview();
   });
});

function setupOnlineLevel(eleAry, level) {
   const [mainEle, _ctx, count, id, clear] = eleAry;
   mainEle.classList.add("show");
   count.innerText = level.playCount;
   id.innerText = level.id;

   ctx = _ctx;
   clear();
   const { aryPtr, length } = create2dAryPointer(level.blocks);
   init(aryPtr, length);
   draw();
}

function pageClickAction(current = currentPageIndex) {
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



// Start Game
function playLevel(mode = "inGame") {
   ctx = CTX;
   CVS.classList.add("active");
   showGameStatus.classList.add("active");
   showPreview.classList.remove("active");
   showTime.classList.remove("active");
   showHealths.classList = [];
   pushStatus(mode);
   pushStatus(mode);
   lvlTime.innerText = "∞";
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

startButton.click(() => {
   playLevel();
});

setInterval(() => {
   // mobileErr.innerHTML = fpsCounter;
   fpsCounter = 0;
}, 1000);
