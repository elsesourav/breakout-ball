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

   const imgData = _ctx_.getImageData(0, 0, _cvs_.width, _cvs_.height);
   _ctx_.putImageData(imgData, 0, 0);

   return image;
}

const blockColors = [
   ["#00bcb9", "#4ffffc"],
   ["#bfc200", "#fcff59"],
   ["#00d00e", "#3bff48"],
   ["#8c00ff", "#af4eff"],
   ["#ff005d", "#ff4e8f"],
   ["#ffffff", "#ffffff"],
];

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
         ctx.arc(70, 70, 70, 0, Math.PI * 2, false);
         ctx.fill();
         ctx.closePath();
      },
      140,
      140
   );
}
