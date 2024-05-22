const startButton = $("#startButton");

function lvlEditor() {
   lvlMaker.draw(ctx, CVS.width, CVS.height);
}

const htmlLevels = createHtmlLevels(window.levels, $("#localMode"));

htmlLevels.forEach(([level], i) => {
   level.addEventListener("click", () => {
      setupStartPreview(i);
      currentLevelIndex = i;
   });
});

// Start Game
startButton.click(() => {
   sCtx = STATIC_CTX;
   CVS.classList.add("active");
   STATIC_CVS.classList.add("active");
   startPreview.classList.remove("active");

   const level = createStringLevel(window.levels[currentLevelIndex]);
   init(rows, cols, SIZE, level, PAD_X, PAD_Y, PAD_WIDTH, PAD_HEIGHT, BALL_RADIUS, BALL_SPEED); 

   animation.start();

   setInterval(() => {
      mobileErr.innerHTML = fpsCounter;
      fpsCounter = 0;
   }, 1000);
});
