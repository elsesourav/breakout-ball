function lvlEditor() {
   lvlMaker.draw(ctx, CVS.width, CVS.height);
}

function playGame() {
   playLevel.update();
   playLevel.draw(ctx, CVS.width, CVS.height);
}

const htmlLevels = createHtmlLevels(window.levels, $("#localMode"));

htmlLevels.forEach(([level], i) => {
   level.addEventListener("click", () => {
      sCtx = STATIC_CTX;
      setupStartPreview(i);
      currentSelectedLevel = levels[i];
   });
});

// CVS.classList.add("active");
startPreview.classList.remove("active");
// playLevel.setup(levels[7]);
// animation.start(playGame);

function anim() {
   playGame();
   requestAnimationFrame(anim);
}
// anim();


// })();
