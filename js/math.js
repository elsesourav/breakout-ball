const lerp = (a, b, i) => {
   return a + (b - a) * i;
};

function intersection(A, B, C, D) {
   const top = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
   const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
   const t = top / bottom;
   return new Point(lerp(A.x, B.x, t), lerp(A.y, B.y, t));
}

function getIntersection(A, B, C, D, side) {
   const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
   const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
   const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

   if (bottom != 0) {
      const t = tTop / bottom;
      const u = uTop / bottom;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
         return {
            x: lerp(A.x, B.x, t),
            y: lerp(A.y, B.y, t),
            offset: t,
            side: side,
         };
      }
   }

   return null;
}

class Point {
   constructor(x, y, offset) {
      this.x = x;
      this.y = y;
      this.offset = offset;
   }
}
class PointDraw {
   constructor(x, y, offset) {
      this.x = x;
      this.y = y;
      this.offset = offset;
   }

   draw(ctx, text, is, radius = 10, strokeWidth = 1) {
      ctx.beginPath();
      ctx.fillStyle = is ? "#f00" : "#0f0";
      ctx.lineWidth = strokeWidth;
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.stroke();

      if (text != undefined) {
         ctx.font = "bold 14px Arial";
         ctx.fillStyle = "#ffffff";
         ctx.textAlign = "center";
         ctx.textBaseline = "middle";
         ctx.fillText(text, this.x, this.y);
      }
   }
}
