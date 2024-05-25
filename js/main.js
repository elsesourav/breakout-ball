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




// Start Game
function playLevel(level) {
   ctx = CTX;
   CVS.classList.add("active");
   showGameStatus.classList.add("active");
   showPreview.classList.remove("active");
   showTime.classList.remove("active");
   showHealths.classList = [];
   pushStatus("inGame");
   pushStatus("inGame");
   lvlTime.innerText = "∞";
   showTimeUsed.innerText = "0";
   isInOfTheGame = true;
   
   setTimeout(() => {
      showHealths.classList.add(`s${3}`); 
      showTime.classList.add("active");
   }, 600);
   
   const { aryPtr, length } = createStringLevel(level);
   init(aryPtr, length);
    
   animation.start(loopFun);
}

startButton.click(() => {
   playLevel(window.levels[currentLevelIndex]);
});

// createNewLevel.click(() => {
   //   pushStatus("preview");
// });


// showPreview.classList.add("active");

setTimeout(() => {
   // init("");
   // update();
   // drawOutline();
   // playLevel(window.levels[currentLevelIndex]);
}, 1500);

setInterval(() => {
   // mobileErr.innerHTML = fpsCounter;
   fpsCounter = 0;
}, 1000);