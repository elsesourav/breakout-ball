const O_H = innerHeight; //ORIGINAL HEIGHT
const O_W = innerWidth; //ORIGINAL WIDTH
// ratio 9x16 for game window dimensions
const DELTA_SIZE = Math.floor(O_W * (16 / 9) < O_H ? O_W / 9 : O_H / 16);
const WIDTH = DELTA_SIZE * 9;
const HEIGHT = DELTA_SIZE * 16;
const SCALE = 64;
const SCALE_H = 48;
const row = 9;
const col = 10;
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

let levelMap = array2d(col, row);
let saveMap = [];
let currentHover = [null, null];

function setup() {
   levelMap = levelMap.map((col, j) =>
      col.map((_, i) => new Block(i, j, SCALE, SCALE_H, 5))
   );
   levelMap[9][4].isDestroyed = false;
}
setup();

function drawGideLine(ctx) {
   const [x, y] = currentHover;
   levelMap.forEach((col) => {
      col.forEach((block) => {
         if (block.x === x && block.y === y) {
            block.draw(ctx, "#0f07");
         } else {
            block.draw(ctx, "#fff0");
         }
      });
   });
   saveMap.forEach((block) => {
      block.draw(ctx);
   });
}

function putHoverEffect(offX, offY, isPut = false) {
   const { left, top, width } = CVS.getBoundingClientRect();
   const ratio = CVS.width / width;
   const NX = Math.floor(((offX - left) * ratio) / SCALE);
   const NY = Math.floor(((offY - top) * ratio) / SCALE_H);

   levelMap.some((c) =>
      c.some((block) => {
         const { x, y } = block;
         if (NX === x && NY === y) {
            currentHover = [x, y];
            if (isPut) {
               if (!saveMap.some((b) => b.x === x && b.y === y)) {
                  saveMap.push(new Block(x, y, SCALE, SCALE_H, 1));
               }
            }
            return true;
         }
      })
   );
}

CVS.click(({ clientX, clientY }) => {
   putHoverEffect(clientX, clientY, true);
});

CVS.on("mousemove", ({ clientX, clientY }) => {
   putHoverEffect(clientX, clientY);
});
CVS.on("touchstart", ({ touches }) => {
   putHoverEffect(touches[0].clientX, touches[0].clientY);
});
CVS.on("touchmove", ({ touches }) => {
   putHoverEffect(touches[0].clientX, touches[0].clientY);
});

function loop() {
   ctx.clearRect(0, 0, CVS.width, CVS.height);
   drawGideLine(ctx);
}
loop();
const animation = new Animation(FPS, loop);
// animation.start();


const lvlOptions = $$("#gameDesigner .option");
lvlOptions.click((ele) => {
   lvlOptions.each(e => e.classList.remove("active"));
   ele.classList.add("active");
})

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
