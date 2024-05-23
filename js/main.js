const startButton = $("#startButton");
const createNewLevel = $("#createNewLevel");

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
function playLevel(_level) {
   ctx = CTX;
   CVS.classList.add("active");
   showPreview.classList.remove("active");
   
   const level = createStringLevel(_level);
   init(level); 
   
   animation.start();
}

startButton.click(() => {
   playLevel(window.levels[currentLevelIndex]);
});

createNewLevel.click(() => {
});



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