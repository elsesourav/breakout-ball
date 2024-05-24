function setupStartPreview(i, optionalClass = "") {
   ctx = PREVIEW_CTX;
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   const level = createStringLevel(window.levels[i]);
   init(level);
   draw();

   showPreview.classList = [];
   showPreview.classList.add("active", optionalClass);
   $("#lvlNo").innerHTML = i + 1;
   $("#lvlRank").innerHTML = "∞";
   $("#lvlTime").innerHTML = "∞";
}