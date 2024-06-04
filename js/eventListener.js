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

startButton.click(() => {
   effects.click.play();
   playLevel();
});

function closeTestingPreview() {
   lvlMaker.show();
   showPreview.classList = [];
}

previewClose.click(() => {
   if (currentGameMode == "testing") {
      closeTestingPreview();
   } else {
      goHome();
   }
});

nextLevelButton.click(async () => {
   const info = getUserInfo();
   const id = Number(currentPlayingLevel.id);
   if (info.levelsRecord[id + 1]) {
      currentPlayingLevel = await getLevel(id + 1);
      setupPreview();
   }
});

closeModifier.click(() => {
   levelModifier.classList.remove("active");
});
homeButton.click(goHome);
signOut.click(() => {
   auth.signOut();
});

let _once_ = false;

searchInput.on("input", () => {
   const val = searchInput.value?.trim().toUpperCase();
   if (val.length === 5) {
      setupOnlineLevels(val);
      _once_ = true;
   }
   if (val.length !== 5 && _once_) {
      _once_ = false;
      setupOnlineLevels();
   }
});

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
      });
      alert.clickBtn2(() => {
         alert.hide();
         goHome();
      });
   }
});

const moveHandler = (x) => {
   if (touchForcedCount > FPS) touchForcedUse = true;
   else touchForcedCount++;

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
      document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
      document.exitPointerLock();
      isPointerLock = false;
   }
}, false);

document.addEventListener("pointerlockchange", pointerLockChange, false);
document.addEventListener("mozpointerlockchange", pointerLockChange, false);

function pointerLockChange() {
   if (isLevelMakerModeOn || !isInOfTheGame) return;

   if (document.pointerLockElement === CVS || document.mozPointerLockElement === CVS) {
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

async function selectMode(i) {
   modeOptions.removeClass("active");
   modeOptions[i].classList.add("active");
   pg.index = i;
   pg.preScrollX = pg.scrollX;
   pg.scrollX = -pg.width * i;
   modeType.style.transitionDuration = "100ms";
   modeType.style.left = `${pg.scrollX}px`;
}

modeOptions.click((e, _, i) => selectMode(i));

modeType.on("touchstart", (e) => {
   pg.x = e.touches[0].clientX;
   pg.y = e.touches[0].clientY;
   modeType.style.transitionDuration = `0ms`;
});

modeType.on("touchmove", (e) => {
   const { clientX, clientY } = e.touches[0];

   if (!pg.ones && Math.abs(clientX - pg.x) < Math.abs(clientY - pg.y)) pg.isLock = true;

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

   modeType.style.transitionDuration = `${Math.round(Math.abs((dx / pg.width) * 100))}ms`;
   modeType.style.left = `${Math.round(pg.scrollX)}px`;
   pg.preScrollX = pg.scrollX;

   selectMode(pg.index);

   pg.isLock = pg.ones = false;
   pg.totalMove = pg.dx = pg.dy = 0;
});

const pgLock = (is = true) => (pg.isLock = is);

volumeInput.on("touchstart", () => pgLock());
volumeInput.on("touchend", () => pgLock(false));
gyroSenInput.on("touchstart", () => pgLock());
gyroSenInput.on("touchend", () => pgLock(false));

volumeInput.on("input", () => {
   updateProfileVolume(volumeInput.value);
   effects.setVolume(volumeInput.value);
   audioChangeVolume(volumeInput.value);
});

gyroSenInput.on("input", () => {
   updateProfileGyroSensitivity(gyroSenInput.value);
});

vibrateOnOff.on("click", () => {
   const is = vibrateOnOff.classList.contains("active");
   vibrateOnOff.classList.toggle("active", !is);
   updateProfileVibrateOnOff(!is);
});

gyroOnOff.on("click", () => {
   const is = gyroOnOff.classList.contains("active");
   gyroOnOff.classList.toggle("active", !is);
   updateProfileGyroOnOff(!is);
});
