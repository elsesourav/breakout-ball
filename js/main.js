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
   mobileErr.innerHTML = fpsCounter;
   fpsCounter = 0;
}, 1000);