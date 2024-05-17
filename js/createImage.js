const _cvs_ = document.createElement("canvas");
document.body.appendChild(_cvs_);
_cvs_.style.display = "none";
const _ctx_ = _cvs_.getContext("2d");

function createCanvasImage(drawFunction, width, height) {
   _cvs_.width = width;
   _cvs_.height = height;
   drawFunction(_ctx_);

   const image = new Image();
   image.src = _cvs_.toDataURL("image/png");

   return image;
}

function createBallImage() {
   return createCanvasImage(
      (ctx) => {
         const gradient = ctx.createRadialGradient(96, 24, 2, 70, 70, 110);

         gradient.addColorStop(0, "white");
         gradient.addColorStop(0.03, "aqua");
         gradient.addColorStop(0.6, "darkblue");
         gradient.addColorStop(1, "aqua");

         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.strokeStyle = "#0ff";
         ctx.lineWidth = 3;
         ctx.arc(73, 73, 70, 0, Math.PI * 2, false);
         ctx.fill();
         ctx.stroke();
         ctx.closePath();
      },
      146,
      146
   );
}

function createPaddleImage() {
   const r = 8,
      w = 160,
      h = 30,
      sideW = w / 4;

   const pathColors = [
      "#0000ffaa",
      "#65f2ff",
      "#ffa600",
      "#ffa600",
      "#a60000",
      "#a60000",
      "#ffffff66",
      "#00000033",
   ];

   const locations = [
      [sideW * 0.7, -h * 0.1, sideW * 2.6, h * 1.2, r],
      [sideW, h * 0.1, sideW * 2, h * 0.8, r],
      [0, 0, sideW, h, r], // yellow side left
      [sideW * 3, 0, sideW, h, r], // yellow side right
      [sideW / 3, 0, sideW / 3, h, r / 2], // red ring left
      [w - sideW / 1.5, 0, sideW / 3, h, r / 2], // red ring right
      [0, h * 0.1, w, h / 3, r],
      [0, h * 0.8, w, h / 5, r / 2],
   ];

   return (image = createCanvasImage(
      (ctx) => {
         locations.forEach(([x, y, w, h, r], i) => {
            ctx.fillStyle = pathColors[i];
            ctx.fill(create2dRoundedRectPath(x, y, w, h, r));
         });
      },
      w,
      h
   ));
}

function createBlockImages() {
   const blockColors = [
      ["#00bcb9", "#4ffffc"],
      ["#bfc200", "#fcff59"],
      ["#00d00e", "#3bff48"],
      ["#8c00ff", "#af4eff"],
      ["#ff005d", "#ff4e8f"],
      ["#ffffff", "#ffffff"],
   ];

   const blockW = 64;
   const blockH = 48;
   let blockImages = [];

   blockColors.forEach(([color, stroke], i) => {
      const offset = 2 + 0.5 * (blockColors.length - i);
      const x = offset;
      const y = offset;
      const r = 5;
      const W = blockW - 2 * offset;
      const H = blockH - 2 * offset;
      const inOffset = 3;
      const inX = x + inOffset;
      const inY = y + inOffset;
      const inW = W - inOffset * 2;
      const inH = H / 1.5 - inOffset * 2;

      return blockImages.push({
         image: createCanvasImage(
            (ctx) => {
               const path1 = create2dRoundedRectPath(x, y, W, H, r);
               const path2 = create2dRoundedRectPath(inX, inY, inW, inH, r * 1.4);

               ctx.lineWidth = 2;
               ctx.strokeStyle = stroke;
               ctx.stroke(path1);

               ctx.fillStyle = color;
               ctx.fill(path1);

               ctx.fillStyle = "#fff4";
               ctx.fill(path2);
            },
            blockW,
            blockH
         ),
         color,
      });
   });

   return blockImages;
}
