function setupStartPreview(i) {
   sCtx = PREVIEW_CTX;

   const level = createStringLevel(window.levels[i]);
   init(rows, cols, SIZE, level, PAD_X, PAD_Y, PAD_WIDTH, PAD_HEIGHT, BALL_RADIUS, BALL_SPEED);
   draw();

   startPreview.classList.add("active");
   $("#lvlNo").innerHTML = i + 1;
   $("#lvlRank").innerHTML = "∞";
   $("#lvlTime").innerHTML = "∞";
}