function setupStartPreview(optionalClass = [], lvlTime = "∞") {
   ctx = PREVIEW_CTX;
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   const { aryPtr, length } = create2dAryPointer(currentPlayingLevel.blocks);
   init(aryPtr, length);
   draw();

   isInOfTheGame = false;

   showPreview.classList = [];
   showPreview.classList.add("active", ...optionalClass);
   pushStatus("game");
   pushStatus("game");
   animation.stop();
   $("#lvlNo").innerHTML = currentPlayingLevel.id;
   $("#levelCreatorName").innerHTML = `@${currentPlayingLevel.creator}`;
   // $("#lvlRank").innerHTML = "∞";
   $("#lvlTime").innerHTML = lvlTime;
}