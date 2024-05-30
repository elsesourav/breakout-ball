"use strict";
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
   self.removeClass = (className) => {
      self.forEach((element) => {
         element.classList.remove(className);
      });
   };
   self.each = (fun) => self.forEach(fun);
   self.map = (fun) => self.map(fun);
   return self;
};

const validEmail = (exp) =>
   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(exp);
const validName = (exp) =>
   /^([a-zA-Zà-úÀ-Ú]{2,})+\s+([a-zA-Zà-úÀ-Ú\s]{2,})+$/.test(exp);
const validUName = (exp) => /^[a-zA-Z0-9\_\-\@]{6,16}$/.test(exp);
const validPass = (exp) => /^([A-Za-z0-9à-úÀ-Ú\@\_\.\-]{8,16})+$/.test(exp);
const validText = (exp) =>
   /^([A-Za-z0-9à-úÀ-Ú\.\-\,\_\|\?\:\*\&\%\#\!\+\~\₹\'\"\`\@\s]{2,})+$/.test(
      exp
   );

function generateUniqueId() {
   const timestamp = Date.now();
   const random = Math.floor(Math.random() * Math.pow(36, 2));
   const combined = timestamp.toString(36) + random.toString(36);
   return combined.slice(-5).toUpperCase();
}

function vibrateDevice(time = 200) {
   if (isVibrateActive && navigator.vibrate) {
      navigator.vibrate(time);
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

function create2dAryPointer(level) {
   let ary = [];
   for (let i = 0; i < level.length; i++)
      for (const key in level[i]) ary.push(level[i][key]);

   let nBytes = ary.length * 4;
   let aryPtr = Module._malloc(nBytes);

   Module.HEAP32.set(ary, aryPtr / 4);
   return { aryPtr, length: ary.length };
}

function copyArray(ary) {
   return JSON.parse(JSON.stringify(ary));
}

class ApiError extends Error {
   constructor(
      statusCode,
      message = "Something went wrong",
      errors = [],
      stack = ""
   ) {
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
            message:
               "You are offline. Please check your internet connection and try again",
            btnNm1: "Okay",
            oneBtn: true,
         });
         alert.show();
         alert.clickBtn1(() => {
            alert.hide();
            resolve(false);
         });
      } else {
         floatingInputShow.classList.add("active");
         const response = await fun(resolve);
         floatingInputShow.classList.remove("active");

         const { data, title, message } = response;
         if (data != null) {
            resolve(data);
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
            });
         }
      }
   });
};

function pushStatus(name) {
   history.pushState({ name }, `${name}`, `./`);
}
function replaceState(name = "home") {
   history.replaceState({ name }, `${name}`, `./`);
}
function createHtmlLevels(levels, levelsMap) {
   levelsMap.innerHTML = "";

   const htmlLevels = [];

   for (let i = 0; i < levels.length; i++) {
      const mainEle = CE("div", ["level", "lock"]);

      const top = CE("div", ["top"], "", mainEle);

      const hashtag = CE("div", ["hashtag"], "", top);
      CE("i", ["sbi-trophy2"], "", hashtag);
      const p = CE("p", [], "00", hashtag);

      const lockComplete = CE("div", ["is-lock-or-complete"], "", top);
      CE("i", ["sbi-lock-outline", "lock"], "", lockComplete);
      CE("i", ["sbi-check-circle-outline", "check"], "", lockComplete);

      const iconAndNo = CE("div", ["icon-and-no"], "", mainEle);
      CE("i", ["sbi-fire"], "", iconAndNo);
      const no = CE("p", ["no"], i + 1, iconAndNo);

      const completeTime = CE("div", ["complete-time"], "", mainEle);
      CE("i", ["sbi-stopwatch1"], "", completeTime);
      const time = CE("p", ["time"], "000", completeTime);
      CE("span", [], "s", completeTime);

      levelsMap.appendChild(mainEle);
      htmlLevels.push([mainEle, p, no, time]);
   }
   htmlLevels[0][0].classList.remove("lock");
   return htmlLevels;
}

function createOnlineLevels(levels, levelsMap, flag = false) {
   levelsMap.innerHTML = "";
   const htmlLevels = [];

   for (let i = 0; i < levels.length; i++) {
      const mainEle = CE("div", ["level"]);
      const cvs = CE("canvas", ["levelCvs"]);
      const details = CE("div", ["details"]);
      const playCount = CE("div", ["playCount"], "", details);
      CE("i", ["sbi-play-circle"], "", playCount);
      const count = CE("p", ["count"], "10", playCount);
      const id = CE("p", ["id"], "ZAS", details);
      const _delete = flag
         ? CE("p", ["sbi-settings", "setting"], "", details)
         : "";

      mainEle.appendChild(cvs);
      mainEle.appendChild(details);
      levelsMap.appendChild(mainEle);

      htmlLevels.push([mainEle, cvs, count, id, _delete]);
   }
   return htmlLevels;
}

{
   /* <div class="level">
   <div class="top">
      <div class="hashtag">
         <i class="sbi-trophy2"></i>
         <p>00</p>
      </div>
      <div class="is-lock-or-complete">
         <i class="sbi-lock-outline lock"></i
         ><i class="sbi-check-circle-outline check"></i>
      </div>
   </div>
   <div class="icon-and-no">
      <i class="sbi-fire"></i>
      <p class="no">1</p>
   </div>
   <div class="complete-time">
      <i class="sbi-stopwatch1"></i>
      <p class="time">000</p>
      <span>s</span>
   </div>
</div> */
}

{
   /* <div class="level">
   <canvas class="levelCvs"></canvas>
   <div class="details">
      <div class="playCount">
         <i class="sbi-play-circle"></i>
         <p class="count">10</p>
      </div>
      <p class="id">ZAS</p>
      <p class="delete"></p>
   </div>
</div> */
}


const CVS = $("#mainCanvas");
const previewCanvas = $("#preview");
const CTX = CVS.getContext("2d");
const PREVIEW_CTX = previewCanvas.getContext("2d");
const paddleImage = createPaddleImage();
const ballImage = createBallImage();
const blockImages = createBlockImages();
let ctx = CTX;

previewCanvas.width = CVS.width = CVS_W;
CVS.height = CVS_H;
previewCanvas.height = SIZE * (cols - 1);

ctx.imageSmoothingQuality = "high";
PREVIEW_CTX.imageSmoothingQuality = "high";

const waitingWindow = $("#waitingWindow");
waitingWindow.classList.add("active");