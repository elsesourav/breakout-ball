const O_H = innerHeight; //ORIGINAL HEIGHT
const O_W = innerWidth; //ORIGINAL WIDTH
// ratio 9x16 for game window dimensions
const DELTA_SIZE = Math.floor(O_W * (16 / 9) < O_H ? O_W / 9 : O_H / 16);
const WIDTH = DELTA_SIZE * 9;
const HEIGHT = DELTA_SIZE * 16;
const SCALE = 64;
const SCALE_H = 48;
const rows = 9;
const cols = 10;
const FPS = 60;

rootStyle.setProperty("--window-width", `${WIDTH}px`);
rootStyle.setProperty("--window-height", `${HEIGHT}px`);
rootStyle.setProperty("--s", `${DELTA_SIZE}px`);
if (!isMobile) rootStyle.setProperty("--cursor", "pointer");

const CVS = $("#myCanvas");
const ctx = CVS.getContext("2d");
CVS.width = SCALE * 9;
CVS.height = SCALE * 16;
ctx.imageSmoothingQuality = "high";

const level = new LevelMaker(rows, cols, SCALE, SCALE_H, CVS);

function lvlEditor() {
   level.draw(ctx);
}

let fun = lvlEditor;

function loop() {
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   fun();
}
loop();
const animation = new Animation(FPS, loop);
animation.start();

const lvlOptions = $$("#levelDesigner .option");
lvlOptions.click((_, ele, i) => {
   lvlOptions.each((e) => e.classList.remove("active"));
   ele.classList.add("active");

   if (i <= 4) level.selectHealth(i + 1);
   else if (i === 5) level.selectWall(i + 1);
   else if (i === 6) level.selectEraser(i + 1);
});

let spaceIsDown = false;

addEventListener("keydown", ({ keyCode }) => {
   if (keyCode === 32) spaceIsDown = true;

   if (spaceIsDown) {
      // get value 1 to 5 (e.g: 49 - 48 = 1, 50 - 48 = 2, ...)
      if (keyCode >= 49 && keyCode <= 53) {
         const i = keyCode - 48;
         lvlOptions.each((e) => e.classList.remove("active"));
         lvlOptions[i-1].classList.add("active");
         level.selectHealth(i);

      } else if (keyCode === 87) { // wall
         lvlOptions.each((e) => e.classList.remove("active"));
         lvlOptions[5].classList.add("active");
         level.selectWall();

      } else if (keyCode === 69) { // eraser
         lvlOptions.each((e) => e.classList.remove("active"));
         lvlOptions[6].classList.add("active");
         level.selectEraser();
      } else if (keyCode === 90) { // undo
         level.undo();
      } else if (keyCode === 89) { // redo
         level.redo();
      } else if (keyCode === 83) { // save

      } else if (keyCode === 67) { // close
         
      }

   }
});

addEventListener("keyup", ({ keyCode }) => {
   if (keyCode === 32) spaceIsDown = false;
});

$("#undoBtn").click(() => {
   level.undo();
});

$("#redoBtn").click(() => {
   level.redo();
});

$("#saveBtn").click(() => {});
$("#closeBtn").click(() => {});

// const rsWindow = $("#rs-window");
// const rsButton = $("#rs-r");
// const touchField = $("#touch-field");
// const levelWindow = $("#level-window");
// const scrollList = $("#scroll-list");
// const gyroOpt = $$(".gyro-opt");
// const audioOpt = $$(".audio-opt");
// const play = $(".play");

// hover(play);

// let winLevels = [];

// try {
//    let temp = getDataToLocalStorage("teamSourav-bb");
//    if (temp.length === gameMaps.length) {
//       winLevels = temp;
//    } else {
//       gameMaps.forEach(() => {
//          winLevels.push({ win: false, score: 0 });
//       });
//       setDataToLocalStorage("teamSourav-bb", winLevels);
//    }
// } catch (error) {
//    gameMaps.forEach(() => {
//       console.log(winLevels);
//       winLevels.push({ win: false, score: 0 });
//       setDataToLocalStorage("teamSourav-bb", winLevels);
//    });
//    console.log("no-data first time open");
// }

// // set levels
// let levels = [];
// function setLevels() {
//    scrollList.innerHTML = "";
//    for (let i = 0; i < gameMaps.length; i++) {
//       const lvl = createEle(
//          "div",
//          "level",
//          scrollList,
//          `<span>🌟</span><p>${i + 1}</p> ${
//             winLevels[i].score && `<h4>🎖${winLevels[i].score}</h4>`
//          }`
//       );
//       if (winLevels[i].win) {
//          lvl.classList.add("win");
//       }
//       hover(lvl);
//       levels.push(lvl);
//    }
// }
// setLevels();

// const FPS = 60;

// let mutedClick = false;
// audioOpt.forEach((ao) => {
//    ao.addEventListener("click", () => {
//       audioMuted = audioMuted ? false : true;
//       mutedClick = audioMuted;
//       backgroundAudio.muted = audioMuted;
//       audioOpt.forEach((a) => {
//          a.classList.toggle("active", !audioMuted);
//       });
//    });
// });

// document.addEventListener("visibilitychange", () => {
//    if (document.visibilityState === "hidden") {
//       audioMuted = true;
//       backgroundAudio.muted = audioMuted;
//       audioOpt.forEach((a) => {
//          a.classList.toggle("active", !audioMuted);
//       });
//    } else {
//       if (mutedClick) return;
//       audioMuted = false;
//       backgroundAudio.muted = audioMuted;
//       audioOpt.forEach((a) => {
//          a.classList.toggle("active", !audioMuted);
//       });
//    }
// });

// const settingClose = $("#setting-close");
// const setting = $("#setting");
// const settingOpen = $("#setting-open");

// gyroOpt[0].addEventListener("click", () => {
//    useGyro = useGyro ? false : true;
//    gyroOpt[0].classList.toggle("active", !useGyro);
// });

// settingOpen.addEventListener("click", () => {
//    setting.classList.add("active");
// });
// hover(settingOpen);

// hover(settingClose);
// settingClose.addEventListener("click", () => {
//    setTimeout(() => {
//       setting.classList.remove("active");
//    }, SCALE);
// });

// let currentLevel;
// let currentLevelIndex;
// let lvl = null;

// levels.forEach((l, i) => {
//    l.addEventListener("click", () => {
//       currentLevel = gameMaps[i];
//       currentLevelIndex = i;
//       setup();
//    });
// });

// const pauseButton = $("#pause-button");
// hover(pauseButton);
// pauseButton.click(() => {
//    touchField.classList.add("active");
//    lvl.run = false;
//    play.classList.add("active");
// });

// function setup() {
//    levelWindow.classList.toggle("active", false);
//    lvl = new SetupLevel(currentLevel, currentLevelIndex);
//    lvl.createObstacles();
// }

// rsButton.click(() => {
//    rsWindow.classList.toggle("active", false);
//    setup();
// });

// const restartBtn = $("#restart-btn");
// hover(restartBtn);

// restartBtn.click(() => {
//    touchField.classList.remove("active");
//    play.classList.remove("active");
//    setup();
// });
// gameStart();
// function gameStart() {
//    animation(FPS, () => {
//       if (lvl && lvl.run) {
//          background(0, 0, 0, 0.6);
//          lvl.draw();
//          lvl.update();
//       }
//    });
// }

// const winWindow = $("#win-window");
// hover($("#menu"));
// $("#menu").click(() => {
//    lvl.run = false;
//    winWindow.classList.remove("active");
//    levelWindow.classList.toggle("active", true);
// });
// hover($("#rs-w"));
// $("#rs-w").click(() => {
//    winWindow.classList.remove("active");
//    setup();
// });

// play.addEventListener("click", () => {
//    play.classList.remove("active");
//    setTimeout(() => {
//       touchField.classList.remove("active");
//       lvl.run = true;
//    }, 500);
// });

// const lobby = $("#lobby-btn");
// hover(lobby);

// lobby.click(() => {
//    touchField.classList.remove("active");
//    play.classList.remove("active");
//    levelWindow.classList.toggle("active", true);
// });

// /* ----------- window lode ------------- */
// onload = () => {
//    $("#loading-window").classList.remove("active");
// };
