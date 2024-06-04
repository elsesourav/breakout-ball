"use strict";

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
   self.click = (fun, once = false) => {
      self.addEventListener("click", fun, { once });
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
   self.click = (fun, once = false) => {
      self.forEach((element, i) => {
         element.addEventListener("click", (e) => fun(e, element, i), { once });
      });
   };
   self.removeClass = (className) => {
      self.forEach((element) => {
         element.classList.remove(className);
      });
   };
   self.each = (fun) => self.forEach(fun);
   self.map = (fun) => self.map(fun);
   return self;
};

const debounce = (func, delay = 1000) => {
   let debounceTimer;
   return function (...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
   };
};

const validEmail = (exp) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(exp);
const validName = (exp) => /^[a-zA-Z\s]{3,16}$/.test(exp);
const validUName = (exp) => /^[a-zA-Z0-9\_\-]{4,16}$/.test(exp);
const validPass = (exp) => /^([A-Za-z0-9à-úÀ-Ú\@\_\.\-]{6,16})+$/.test(exp);
const validText = (exp) => /^([A-Za-z0-9à-úÀ-Ú\.\-\,\_\|\?\:\*\&\%\#\!\+\~\₹\'\"\`\@\s]{2,})+$/.test(exp);

const base36ToBase10 = (base36String) => {
   return parseInt(base36String, 36);
};

// create element
const CE = (tagName, className = [], inrHtml = "", parent = null) => {
   const e = document.createElement(tagName);
   if (className) e.classList.add(...className);
   if (inrHtml) e.innerHTML = inrHtml;
   if (parent) parent.appendChild(e);
   return e;
};

function OBJECTtoJSON(data) {
   return JSON.stringify(data);
}

function JSONtoOBJECT(data) {
   return JSON.parse(data);
}

function safeEventListener(element, fun, ary = [], action = "click") {
   element.removeEventListener(action, element._fn);
   element._fn = () => {
      return fun(ary);
   };
   element.addEventListener(action, element._fn);
}

function copyArray(ary) {
   return JSON.parse(JSON.stringify(ary));
}

function pushStatus(name) {
   history.pushState({ name }, `${name}`, `./`);
}

function replaceState(name = "home") {
   history.replaceState({ name }, `${name}`, `./`);
}

class ApiError extends Error {
   constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
      super(message);
      this.statusCode = statusCode;
      this.message = message;
      this.errors = errors;
      this.success = false;

      if (stack) {
         this.stack = stack;
      } else {
         Error.captureStackTrace(this, this.constructor);
      }
   }
}

const asyncHandler = (fun) => {
   return new Promise(async (resolve) => {
      if (!navigator.onLine) {
         const alert = new AlertHTML({
            title: "Connection error",
            message: "You are offline. Please check your internet connection and try again",
            btnNm1: "Okay",
            oneBtn: true,
         });
         alert.show();
         alert.clickBtn1(() => {
            alert.hide();
            resolve(false);
            reloadLocation();
         });
      } else {
         loadingWindow(true);
         const response = await fun(resolve);
         loadingWindow();

         const { data, title, message } = response;
         if (data != null) {
            resolve(data);
            reloadLocation();
         } else {
            const alert = new AlertHTML({
               title: title,
               message: message,
               btnNm1: "Okay",
               oneBtn: true,
            });
            resolve(null);
            alert.show();
            alert.clickBtn1(() => {
               alert.hide();
               reloadLocation();
            });
         }
      }
   });
};

function reloadLocation() {
   window.location.reload();
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

function create2dAryPointer(level) {
   let ary = [];
   for (let i = 0; i < level.length; i++) {
      ary.push(level[i].x);
      ary.push(level[i].y);
      ary.push(level[i].h);
   }

   let nBytes = ary.length * 4;
   let aryPtr = Module._malloc(nBytes);

   Module.HEAP32.set(ary, aryPtr / 4);
   return { aryPtr, length: ary.length };
}

function generateUniqueId() {
   const timestamp = Date.now();
   const random = Math.floor(Math.random() * Math.pow(36, 2));
   const combined = timestamp.toString(36) + random.toString(36);
   return combined.slice(-5).toUpperCase();
}

function vibrateAndAudio(time, audioStatus) {
   if (tempUser.isVibrateActive && navigator.vibrate) {
      navigator.vibrate(time);
   }
   switch (audioStatus) {
      case 1: // block-hit
         wav.blockHit.currentTime = 0;
         wav.blockHit.play();
         break;
      case 2: // side-hit
         wav.sideHit.currentTime = 0;
         wav.sideHit.play();
         break;
      case 3: // damage
         wav.damage.currentTime = 0;
         wav.damage.play();
         break;
      case 4: // win
         wav.win.currentTime = 0;
         wav.win.play();
         break;
      case 5: //game-over
         wav.gameOver.currentTime = 0;
         wav.gameOver.play();
         break;
   }
}
