const _cvs_ = document.createElement("canvas");
document.body.appendChild(_cvs_);
_cvs_.style.display = "none";
const _ctx_ = _cvs_.getContext("2d");
const glowColors = [
   "#00FFFF",
   "#000000",
   "#FF00FF",
   "#FFFF00",
   "#FF4500",
   "#9400D3",
   "#FF073A",
   "#000000",
   "#32CD32",
   "#8A2BE2",
   "#1B03A3",
   "#BF00FF",
   "#FF5F1F",
   "#39FF14",
   "#FF1493",
   "#FFFF33",
   "#00BFFF",
];

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
      [sideW * 0.3, -h * 0.1, sideW * 3.3, h * 1.2, r],
      [sideW * 0.44, h * 0.1, sideW * 3.1, h * 0.8, r],

      [0, 0, sideW / 2, h, r], // yellow side left
      [sideW * 3.5, 0, sideW / 2, h, r], // yellow side right

      [sideW / 6, 0, sideW / 6, h, r / 4], // red ring left
      [w - sideW / 3, 0, sideW / 6, h, r / 4], // red ring right

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
      [["#4facfe", "#00f2fe"], "#4ffffc"],
      [["#f6d365", "#fda085"], "#fcff59"],
      [["#0ba360", "#20e6c1"], "#3bff48"],
      [["#b773ff", "#7028e4"], "#af4eff"],
      [["#ff0844", "#fc8b68"], "#ff4e8f"],
      [["#e8e5cf", "#c3cfe2"], "#ffffff"],
   ];

   const blockW = 64;
   const blockH = 48;
   let blockImages = [];

   blockColors.forEach(([[c1, c2], stroke], i) => {
      const offset = 3 + 0.3 * (blockColors.length - i);
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
               const path2 = create2dRoundedRectPath(
                  inX,
                  inY,
                  inW,
                  inH,
                  r * 1.4
               );

               const grad = ctx.createLinearGradient(0, 0, W, H);
               grad.addColorStop(0, c1);
               grad.addColorStop(1, c2);

               ctx.fillStyle = grad;
               ctx.fill(path1);

               ctx.lineWidth = 3;
               ctx.strokeStyle = stroke;
               ctx.stroke(path1);

               ctx.fillStyle = "#fff4";
               ctx.fill(path2);
            },
            blockW,
            blockH
         ),
         stroke,
      });
   });

   return blockImages;
}
