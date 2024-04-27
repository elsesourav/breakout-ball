"use strict";
"use strict";

//use cssRoot.style.setProperty("key", "value");
const rootStyle = document.querySelector(":root").style;

// when run this app in mobile is return true
const isMobile = localStorage.mobile || navigator.maxTouchPoints > 1;

// minimum window size
const minSize = innerWidth > innerHeight ? innerHeight : innerWidth;

const toRadians = (degree) => (degree * Math.PI) / 180; // degree to radian
const toDegrees = (radian) => (radian * 180) / Math.PI; // radian to Degree

const rnd = (start = 0, end = 1, int_floor = false) => {
   const result = start + Math.random() * (end - start);
   return int_floor ? Math.floor(result) : result;
};

/* e.x 
(0 start) -------.------ (10 end) input . = 5
(10 min) ----------------.---------------- (30 max) output . = 20
*/
const map = (point, start, end, min, max) => {
   return ((max - min) * (point - start)) / (end - start) + min;
};

/* ----  local storage set and get ---- */
function setDataFromLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataFromLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function seedRandom(seed) {
   const a = 1664525;
   const c = 1013904223;
   const m = Math.pow(2, 32);

   let currentSeed = seed;

   return function () {
      currentSeed = (a * currentSeed + c) % m;
      return currentSeed / m;
   };
}

class Animation {
   constructor(fps, fun) {
      this.fps = fps;
      this.run = false;
      this.fun = fun;
   }

   updateFPS(fps) {
      this.fps = fps;
   }

   updateFunction(fun) {
      this.fun = fun;
   }

   #animate() {
      setTimeout(() => {
         if (this.run) {
            this.fun();
            this.#animate(this.fun);
         }
      }, 1000 / this.fps);
   }

   start(fun = this.fun) {
      this.fun = fun;
      if (!this.run) {
         this.run = true;
         this.#animate(this.fun);
      }
   }

   stop() {
      this.run = false;
   }
}

const $ = (selector) => {
   const self = document.querySelector(selector);
   self.on = (event, fun) => {
      self.addEventListener(event, fun);
   };
   self.click = (fun) => {
      self.addEventListener("click", fun);
   };
   self.text = (text) => (self.innerText = text);
   self.html = (html) => (self.innerText = html);
   return self;
};

const $$ = (selector) => {
   const self = document.querySelectorAll(selector);
   self.on = (event, fun) => {
      self.forEach((element) => {
         element.addEventListener(event, fun);
      });
   };
   self.click = (fun) => {
      self.forEach((element, i) => {
         element.addEventListener("click", (e) => fun(e, element, i));
      });
   };
   self.each = (fun) => self.forEach(fun);
   self.map = (fun) => self.map(fun);
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

// classes remove in html
function removeClass(array, className = "active") {
   if (array.length == undefined) {
      array.classList.forEach(() => array.classList.remove(className));
   } else {
      array.forEach((element) => element.classList.remove(className));
   }
}

// create element
const CE = (tagName, className = [], inrHtml = "", parent = null) => {
   const e = document.createElement(tagName);
   if (className) e.classList.add(...className);
   if (inrHtml) e.innerHTML = inrHtml;
   if (parent) parent.appendChild(e);
   return e;
};

function hover(element) {
   element.classList.add("hover-n");
   element.classList.remove("hover");

   const addHover = () => {
      element.classList.add("hover");
      element.classList.remove("hover-n");
   };
   const removeHover = () => {
      element.classList.remove("hover");
      element.classList.add("hover-n");
   };
   element.addEventListener("touchstart", () => {
      isMobile && addHover();
   });
   element.addEventListener("mouseenter", () => {
      !isMobile && addHover();
   });

   element.addEventListener("touchend", () => {
      isMobile && removeHover();
   });
   element.addEventListener("mouseleave", () => {
      !isMobile && removeHover();
   });
}

function setDataToLocalStorage(key, object) {
   var data = JSON.stringify(object);
   localStorage.setItem(key, data);
}
function getDataToLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function create2dRoundedRectPath(x, y, w, h, r) {
   const path = new Path2D();
   path.moveTo(x + r, y);
   path.lineTo(x + w - r, y);
   path.arcTo(x + w, y, x + w, y + r, r);
   path.lineTo(x + w, y + h - r);
   path.arcTo(x + w, y + h, x + w - r, y + h, r);
   path.lineTo(x + r, y + h);
   path.arcTo(x, y + h, x, y + h - r, r);
   path.lineTo(x, y + r);
   path.arcTo(x, y, x + r, y, r);
   path.closePath();
   return path;
}
