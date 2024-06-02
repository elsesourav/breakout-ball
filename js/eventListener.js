const previewClose = $("#previewClose");
const showPreview = $("#showPreview");
const modeType = $("#modeType");
const homeButton = $("#homeButton");
const seekBar = $("#seekBar");
const modeOptions = $$(".mode");
const maps = $$(".map");
const pg = {
   x: 0,
   y: 0,
   dx: 0,
   dy: 0,
   scrollX: 0,
   totalMove: 0,
   index: 0,
   preScrollX: 0,
   width: modeType.scrollWidth / 4,
   isLock: false,
   ones: false,
};
const { left, width } = CVS.getBoundingClientRect();
const scale = CVS.width / width;
let tx = WIDTH / 2;
let isPointerLock = false;

function goHome() {
   showGameStatus.classList.remove("active");
   showPreview.classList.remove("active");
   CVS.classList.remove("active");
   showTime.classList.remove("active");
   levelDesigner.classList.remove("active");
   ctx = CTX;
   animation.stop();
   showHealths.classList = [];
   pushStatus("home");
   pushStatus("home");
   isInOfTheGame = false;
   isLevelMakerModeOn = false;
}

previewClose.click(() => {
   if (currentGameMode == "testing") {
      lvlMaker.show();
   } else {
      goHome();
   }
});

homeButton.click(goHome);

addEventListener("popstate", function (event) {
   if (event.state != null && event.state.name == "testing") {
      lvlMaker.show();
   } else if (event.state != null && event.state.name == "createMode") {
      lvlMaker.confirmExit();
   } else if (event.state != null && showPreview.classList.contains("active")) {
      goHome();
   } else if (event.state != null && event.state.name == "inGame") {
      const alert = new AlertHTML({
         title: "Exit",
         message: "Are you sure you want to Exit this game?",
      });
      alert.show();
      alert.clickBtn1(() => {
         alert.hide();
         pushStatus("inGame");
         pushStatus("inGame");
      });
      alert.clickBtn2(() => {
         alert.hide();
         goHome();
      });
   }
});

const moveHandler = (x) => {
   tx = (x - left) * scale;
   tx = moveTarget(tx);
};

const pcMoveHandler = (dx) => {
   tx += dx * 3;
   tx = moveTarget(tx);
};

/* -------- paddle move eventListener -------- */
CVS.click(() => {
   if (isLevelMakerModeOn || !isInOfTheGame) return;

   if (!isPointerLock) {
      isPointerLock = true;
      if (CVS.requestPointerLock) {
         CVS.requestPointerLock();
      } else if (CVS.webkitRequestPointerLock) {
         CVS.webkitRequestPointerLock();
      } else if (CVS.mozRequestPointerLock) {
         CVS.mozRequestPointerLock();
      } else {
         console.warn("Pointer locking not supported");
         isPointerLock = false;
      }
   } else {
      document.exitPointerLock =
         document.exitPointerLock || document.mozExitPointerLock;
      document.exitPointerLock();
      isPointerLock = false;
   }
}, false);

document.addEventListener("pointerlockchange", pointerLockChange, false);
document.addEventListener("mozpointerlockchange", pointerLockChange, false);

function pointerLockChange() {
   if (isLevelMakerModeOn || !isInOfTheGame) return;

   if (
      document.pointerLockElement === CVS ||
      document.mozPointerLockElement === CVS
   ) {
      CVS.style.curser = "none";
   } else {
      CVS.style.curser = "move";
   }
}

CVS.addEventListener("mouseenter", (e) => {
   isPointerLock && pcMoveHandler(e.movementX);
});
CVS.addEventListener("mousemove", (e) => {
   isPointerLock && pcMoveHandler(e.movementX);
});

CVS.addEventListener("mouseenter", (e) => {
   !isPointerLock && moveHandler(e.clientX);
});
CVS.addEventListener("mousemove", (e) => {
   !isPointerLock && moveHandler(e.clientX);
});

CVS.addEventListener("touchstart", (e) => {
   moveHandler(e.touches[0].clientX);
});
CVS.addEventListener("touchmove", (e) => {
   moveHandler(e.touches[0].clientX);
});

let oldGamma = 0;

// if ("Gyroscope" in window) {
//    const gyro = new Gyroscope();
//    gyro.start();
//    gyro.addEventListener("reading", (e) => {
//       const ntx = e.gamma * 5 - oldGamma;
//       tx = moveDirect(ntx);
//       oldGamma = e.gamma;
//    });
//    gyro.addEventListener("error", (e) => {
//       console.error(e);
//    });
// }

// if (window.DeviceOrientationEvent) {
//    window.addEventListener("deviceorientation", (e) => {
//       const ntx = e.gamma * 5 - oldGamma;
//       tx = moveDirect(ntx);
//       oldGamma = e.gamma;
//    });
// }

async function selectMode(i, is = false) {
   if (!is) {
      modeOptions.removeClass("active");
      modeOptions[i].classList.add("active");
      pg.index = i;
      pg.preScrollX = pg.scrollX;
      pg.scrollX = -pg.width * i;
      modeType.style.transitionDuration = "100ms";
      modeType.style.left = `${pg.scrollX}px`;
   }

   if (i === 2) {
      setupCreateLevel();
   }
}

modeOptions.click((e, _, i) => selectMode(i));

modeType.on("touchstart", (e) => {
   pg.x = e.touches[0].clientX;
   pg.y = e.touches[0].clientY;
   modeType.style.transitionDuration = `0ms`;
});

modeType.on("touchmove", (e) => {
   const { clientX, clientY } = e.touches[0];

   if (!pg.ones && Math.abs(clientX - pg.x) < Math.abs(clientY - pg.y))
      pg.isLock = true;

   if (!pg.ones) pg.ones = true;

   if (pg.isLock) return;

   pg.dx = clientX - pg.x;
   pg.dy = clientY - pg.y;
   pg.x = clientX;
   pg.y = clientY;
   pg.totalMove += pg.dx * 2;

   pg.scrollX += pg.dx * 2;
   modeType.style.left = `${Math.round(pg.scrollX)}px`;
});

modeType.on("touchend", () => {
   let dx = Math.abs(pg.totalMove);

   if (Math.abs(pg.totalMove) < pg.width / 5) {
      pg.scrollX = -pg.width * pg.index;
   } else {
      if (pg.totalMove < 0 && pg.index < 3) pg.index++;
      if (pg.totalMove > 0 && pg.index > 0) pg.index--;

      dx = Math.abs(Math.abs(pg.scrollX) - Math.abs(pg.width * pg.index));

      pg.scrollX = -pg.width * pg.index;
      modeOptions.removeClass("active");
      modeOptions[pg.index].classList.add("active");
   }

   modeType.style.transitionDuration = `${Math.round(
      Math.abs((dx / pg.width) * 100)
   )}ms`;
   modeType.style.left = `${Math.round(pg.scrollX)}px`;
   pg.preScrollX = pg.scrollX;

   selectMode(pg.index, false);

   pg.isLock = pg.ones = false;
   pg.totalMove = pg.dx = pg.dy = 0;
});

$("#seekBar").on("touchstart", () => {
   pg.isLock = true;
});
$("#seekBar").on("touchend", () => {
   pg.isLock = false;
});

$("#seekBar").on("input", function () {
   user.volume = seekBar.value;
});

$("#vibrateBtn").click(function () {
   this.classList.toggle("active");
   if (this.classList.contains("active")) {
      user.isVibrateActive = true;
   } else {
      user.isVibrateActive = false;
   }
});
$("#gyroBtn").click(function () {
   this.classList.toggle("active");
   if (this.classList.contains("active")) {
      user.isGyroActive = true;
   } else {
      user.isGyroActive = false;
   }
});
