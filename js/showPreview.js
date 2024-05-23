function setupStartPreview(i) {
   ctx = PREVIEW_CTX;
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   const level = createStringLevel(window.levels[i]);
   init(level);
   draw();

   showPreview.classList.add("active");
   $("#lvlNo").innerHTML = i + 1;
   $("#lvlRank").innerHTML = "∞";
   $("#lvlTime").innerHTML = "∞";
}