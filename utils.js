"use strict"
const SCALE = 4;
const winw = 350;
const winh = 620;
const cvs = document.createElement("canvas");
document.body.appendChild(cvs); 
cvs.setAttribute("width", winw * SCALE);
cvs.setAttribute("height", winh * SCALE);
cvs.style.width = `${winw}px`;
cvs.style.height = `${winh}px`;
const ctx = cvs.getContext("2d");

ctx.fillStyle = "#000";
ctx.fillRect(0, 0, winw, winh);
ctx.scale(SCALE, SCALE);


//  resize windwo 
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;
const root = document.querySelector(":root");
root.style.setProperty("--winWidth", `${winWidth}px`);
root.style.setProperty("--winHeight", `${winHeight}px`);

window.addEventListener("resize", (e) => {
  winWidth = window.innerWidth;
  winHeight = window.innerHeight;
  root.style.setProperty("--winWidth", `${winWidth}px`);
  root.style.setProperty("--winHeight", `${winHeight}px`);
});

/* ---------- math ---------- */
const PI = Math.PI;
const sin = x => Math.sin(x);
const cos = y => Math.cos(y);
const atan2 = (y, x) => Math.atan2(y, x);
const abs = n => Math.abs(n);

const toRadian = degree => (degree * Math.PI) / 180;// degree convert to radian
const toDegree = radian => (radian * 180) / Math.PI;// radian convert to Degree

const random = (start = 0, end = 1, int_floor = false) => {
  const result = start + (Math.random() * (end - start));
  return int_floor ? Math.floor(result) : result;
}

/* e.x 
(0 start) -------.------ (10 end) input . = 5
(10 min) ----------------.---------------- (30 max) output . = 20
*/
const map = (point, start, end, min, max) => {
  const per = (point - start) / (end - start);
  return ((max - min) * per) + min;
}


/* ------------- canvas ------------ */
const color = (r = false, g = false, b = false, a = false) => {
  if (a || a === 0) {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } else if (b || b === 0) {
    ctx.fillStyle = `rgba(${r}, ${g}, ${0}, ${b})`;
    return `rgba(${r}, ${g}, ${0}, ${b})`;
  } else if (g || g === 0) {
    ctx.fillStyle = `rgba(${r}, ${0}, ${0}, ${g})`;
    return `rgba(${r}, ${0}, ${0}, ${g})`;
  } else if (r || r === 0) {
    ctx.fillStyle = `rgba(${255}, ${255}, ${255}, ${r})`;
    return `rgba(${255}, ${255}, ${255}, ${r})`;
  } else {
    ctx.fillStyle = `rgba(${255}, ${255}, ${255}, ${1})`;
    return `rgba(${255}, ${255}, ${255}, ${1})`;
  }
}

const strokeStyle = (r = false, g = false, b = false, a = false) => {
  if (a || a === 0) {
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } else if (b || b === 0) {
    ctx.strokeStyle = `rgba(${r}, ${g}, ${0}, ${b})`;
    return `rgba(${r}, ${g}, ${0}, ${b})`;
  } else if (g || g === 0) {
    ctx.strokeStyle = `rgba(${r}, ${0}, ${0}, ${g})`;
    return `rgba(${r}, ${0}, ${0}, ${g})`;
  } else if (r || r === 0) {
    ctx.strokeStyle = `rgba(${255}, ${255}, ${255}, ${r})`;
    return `rgba(${255}, ${255}, ${255}, ${r})`;
  } else {
    ctx.strokeStyle = `rgba(${255}, ${255}, ${255}, ${1})`;
    return `rgba(${255}, ${255}, ${255}, ${1})`;
  }
}

const background = (r = false, g = false, b = false, a = false) => {
  if (typeof a === "number") {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  } else if (typeof b === "number") {
    ctx.fillStyle = `rgba(${r}, ${g}, ${0}, ${b})`;
  } else if (typeof g === "number") {
    ctx.fillStyle = `rgba(${r}, ${0}, ${0}, ${g})`;
  } else if (typeof r === "string") {
    ctx.fillStyle = r;
  } else if (typeof r === "number") {
    ctx.fillStyle = `rgba(${r}, ${r}, ${r}, ${1})`;
  } else {
    ctx.fillStyle = `rgba(${0}, ${0}, ${0}, ${1})`;
  }
  ctx.fillRect(0, 0, cvs.width, cvs.height);
}

const clrScr = () => {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
}
const clearRect = () => {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
}
const fill = (c = 0) => {
  color(c, 0, 0, 1);
  ctx.fillRect(0, 0, cvs.width, cvs.height);
}
const translate = (x, y) => {
  ctx.translate(x, y);
}
const transform = (ox, nx, oy, ny) => {
  ctx.transform(ox, nx, oy, ny);
}
const font = (font) => {
  ctx.font = font;
  ctx.textAlign = "center";
}
const text = (text, x, y, w) => {
  ctx.fillText(text, x, y, w);
}
const save = () => {
  ctx.save();
}
const restore = () => {
  ctx.restore();
}
const rotate = (angle) => {
  ctx.rotate(angle);
}
const scale = (x, y) => ctx.scale(x, y);
const line = (sx, sy, ex, ey, width = 1, round = false, lineDash = []) => {
  ctx.beginPath();
  ctx.lineWidth = width;
  if (round) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }
  lineDash && ctx.setLineDash(lineDash);
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.closePath();
}

const moveTo = (x, y) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
};
const lineTo = (x, y) => ctx.lineTo(x, y);

const stroke = (strokeWidth) => {
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
}

const curve = (sx, sy, ex, ey, lineWidth = 1, radius = 20, fill = false) => {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.moveTo(sx, sy);
  const midx = sx + (ex - sx) / 2;
  const midy = sy + (ey - sy) / 2;
  ctx.quadraticCurveTo(midx, midy - radius, ex, ey);
  ctx.stroke();
  fill && ctx.fill();
  ctx.closePath();
}

const rect = (x, y, w, h, fill = true, lineWidth = 0) => {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  fill && ctx.fill();
  ctx.lineWidth = lineWidth;
  lineWidth && ctx.stroke();
  ctx.closePath();
}

const fillRect = (x, y, w, h) => {
  ctx.beginPath();
  ctx.fillRect(x, y, w, h);
  ctx.closePath();
}
const arc = (x, y, r, fill = true, lineWidth = 0) => {
  ctx.beginPath();
  const nr = lineWidth ? r - lineWidth : r;
  ctx.arc(x, y, nr, 0, PI * 2, false);
  fill && ctx.fill();
  ctx.lineWidth = lineWidth;
  lineWidth && ctx.stroke();
  ctx.closePath();
}


const _$ = (givMe) => {
  const self = document.querySelectorAll(givMe);
  self.T = (text) => {
    self.forEach((all) => {
      all.innerText = text;
    });
  };
  self.O = (event, fun) => {
    self.forEach((all) => {
      all.addEventListener(event, fun);
    });
  };
  self.S = (object) => {
    const css = Object.entries(object);
    self.forEach((all) => {
      css.forEach(([prorerty, value]) => {
        all.style[prorerty] = value;
      });
    });
  };
  return self;
};

// return Id
const ID = (id) => {
  const self = document.getElementById(id);
  self.on = (event, fun) => {
    self.addEventListener(event, fun);
  };
  return self;
};

// class add in html
function addClass(array, className = "active") {
  if (array.length == undefined) {
    array.classList.forEach(() => array.classList.add(className));
  } else {
    array.forEach((element) => element.classList.add(className));
  }
}

// claass remove in html
function removeClass(array, className = "active") {
  if (array.length == undefined) {
    array.classList.forEach(() => array.classList.remove(className));
  } else {
    array.forEach((element) => element.classList.remove(className));
  }
}

const createEle = (elementName, className = null, appendParentName = null, inrHtml = null) => {
  const e = document.createElement(elementName);
  if (className) e.classList.add(className);
  if (inrHtml) e.innerHTML = inrHtml;
  if (appendParentName) appendParentName.appendChild(e);
  e.on = (event, callBackFun) => {
    if (typeof event != "string") {
      e.addEventListener("click", event);
    } else {
      e.addEventListener(event, callBackFun);
    }
  }
  return e;
}


function hover(element, name = "hover") {
  const namerun = `${name}-n`
  element.classList.add(namerun);
  element.classList.remove(name);
  const addHover = () => {
    element.classList.add(name);
    element.classList.remove(namerun);
  }
  const removeHover = () => {
    element.classList.remove(name);
    element.classList.add(namerun);
  }
  element.addEventListener("touchstart", addHover);
  element.addEventListener("mouseenter", addHover);

  element.addEventListener("touchend", removeHover);
  element.addEventListener("mouseleave", removeHover);
}

window.onload = () => {
  document.querySelectorAll(".hover").forEach((h) => {
    hover(h);
  })
}

const animation = (fps, fun) => {
  setTimeout(() => {
    fun();
    animation(fps, fun);
  }, 1000 / fps)
}