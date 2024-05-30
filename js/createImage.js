const _cvs_ = document.createElement("canvas");

_cvs_.style.display = "none";
const _ctx_ = _cvs_.getContext("2d");
const glowColors = [
   "#FF4500",
   "#FF073A",
   "#FF5F1F",
   "#FFFF33",
   "#FFFF00",
   "#00FFFF",
   "#FF1493",
   "#FF00FF",
   "#000000",
   "#9400D3",
   "#000000",
   "#32CD32",
   "#8A2BE2",
   "#1B03A3",
   "#BF00FF",
   "#39FF14",
   "#00BFFF",
];

onload = () => {
   document.body.appendChild(_cvs_);
}

function createCanvasImage(drawFunction, width, height) {
   _cvs_.width = width;
   _cvs_.height = height;
   drawFunction(_ctx_);

   const image = new Image();
   image.src = _cvs_.toDataURL("image/png");

   return image;
}

function createBallImage() {
   const _scale = 4;
   return createCanvasImage(
      (ctx) => {
         const gradient = ctx.createRadialGradient(96 * _scale, 24 * _scale, 2 * _scale, 70 * _scale, 70 * _scale, 110 * _scale);

         gradient.addColorStop(0, "white");
         gradient.addColorStop(0.03, "aqua");
         gradient.addColorStop(0.6, "darkblue");
         gradient.addColorStop(1, "aqua");

         ctx.fillStyle = gradient;
         ctx.beginPath();
         ctx.strokeStyle = "#0ff";
         ctx.lineWidth = 2 * _scale;
         ctx.arc(73 * _scale, 73 * _scale, 70 * _scale, 0, Math.PI * 2, false);
         ctx.fill();
         ctx.stroke();
         ctx.closePath();
      },
      146 * _scale,
      146 * _scale
   );
}

function createPaddleImage() {
   const _scale = 4;
   const r = 8 * _scale,
      w = 160 * _scale,
      h = 30 * _scale,
      sideW = w / 4;

   const pathColors = [
      "#0000ffaa",
      "#65f2ff",
      "#6600ff",
      "#6600ff",
      "#fff8",
      "#fff8",
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
      [["#00f7ff", "#006caf"], "#4ffffc"],
      [["#eeff01", "#986300"], "#fcff59"],
      [["#04ef00", "#03a900"], "#04ef00"],
      [["#b773ff", "#7028e4"], "#af4eff"],
      [["#ff0844", "#ff7e9e"], "#ff20c4"],
      [["#c3cfe2", "#eaeaea"], "#ffffff"],
   ];

   const blockW = 256;
   const blockH = blockW / 4 * 3;
   let blockImages = [];

   blockColors.forEach(([[c1, c2], stroke], i) => {
      const offset = 18 + 0.3 * (blockColors.length - i);
      const x = offset;
      const y = offset;
      const r = 20;
      const W = blockW - 2 * offset;
      const H = blockH - 2 * offset;
      const inOffset = 18;
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
                  r * 1.2
               );

               const grad = ctx.createLinearGradient(0, 0, 0, H);
               grad.addColorStop(0, c1);
               grad.addColorStop(1, c2);

               ctx.fillStyle = grad;
               ctx.fill(path1);

               ctx.lineWidth = 8;
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
