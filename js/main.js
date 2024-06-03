

replaceState();

// Start Game
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

startButton.click(() => {
   playLevel();
});

// setInterval(() => {
//    // mobileErr.innerHTML = fpsCounter;
//    fpsCounter = 0;
// }, 1000);
