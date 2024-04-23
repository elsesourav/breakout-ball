function setupStartPreview(levelInfo) {
   pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
   for (const key in levelInfo) {
      const element = levelInfo[key];
      const { x, y, w, h, health } = element
      const block = new Block(x, y, w * pScale, h * pScale, health);
      block.draw(pCtx);
   }
   startPreview.classList.add("active");
   
}