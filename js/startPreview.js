function setupStartPreview(i) {
   ctx = PREVIEW_CTX;
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   const level = createStringLevel(window.levels[i]);
   init(rows, cols, SIZE, level, PAD_X, PAD_Y, PAD_WIDTH, PAD_HEIGHT, BALL_RADIUS, BALL_SPEED);
   draw();

   startPreview.classList.add("active");
   $("#lvlNo").innerHTML = i + 1;
   $("#lvlRank").innerHTML = "∞";
   $("#lvlTime").innerHTML = "∞";
}