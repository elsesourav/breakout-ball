function setupStartPreview(i, optionalClass = [], lvlTime = "∞") {
   ctx = PREVIEW_CTX;
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   const level = createStringLevel(window.levels[i]);
   init(level);
   draw();

   showPreview.classList = [];
   showPreview.classList.add("active", ...optionalClass);
   pushStatus("game");
   pushStatus("game");
   animation.stop();
   $("#lvlNo").innerHTML = i + 1;
   // $("#lvlRank").innerHTML = "∞";
   $("#lvlTime").innerHTML = lvlTime;
}