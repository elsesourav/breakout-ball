const startButton = $("#startButton");
const showHealths = $("#showHealths"); 
const showCountDowns = $("#showCountDowns");
const showTime = $("#showTime");
const showTimeUsed = $("#showTimeUsed");
// const createNewLevel = $("#createNewLevel");

replaceState();

function lvlEditor() {
   lvlMaker.draw(ctx, CVS.width, CVS.height);
}




// Start Game
function playLevel(_level) {
   ctx = CTX;
   CVS.classList.add("active");
   showGameStatus.classList.add("active");
   showPreview.classList.remove("active");
   showTime.classList.remove("active");
   showHealths.classList = [];
   pushStatus("inGame");
   pushStatus("inGame");
   
   setTimeout(() => {
      showHealths.classList.add(`s${3}`); 
      showTime.classList.add("active");
   }, 600);
   
   const level = createStringLevel(_level);
   init(level); 
    
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
   mobileErr.innerHTML = fpsCounter;
   fpsCounter = 0;
}, 1000);