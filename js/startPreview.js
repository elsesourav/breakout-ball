function setupStartPreview(levelInfo, i) {
   pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
   for (const key in levelInfo) {
      const element = levelInfo[key];
      const { x, y, health } = element
      const block = new Block(x, y, SCALE * pScale, SCALE_H * pScale, health);
      block.draw(pCtx);
   }
   startPreview.classList.add("active");
   $("#lvlNo").innerHTML = i + 1;
   $("#lvlRank").innerHTML = "∞";
   $("#lvlTime").innerHTML = "∞";
}