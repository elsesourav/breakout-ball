function lvlEditor() {
   lvlMaker.draw(ctx, CVS.width, CVS.height);
}

function playGame() {
   playLevel.update();
   playLevel.draw(ctx, CVS.width, CVS.height);
}


(async () => {
   const response = await fetch("./levels.json");
   levels = await response.json();
   const htmlLevels = createHtmlLevels(levels, $("#levelsMap")); 
   
   htmlLevels.forEach(([level], i) => {
      level.addEventListener("click", () => {
         setupStartPreview(levels[i], i);
         currentSelectedLevel = levels[i];
      });
   });

   CVS.classList.add("active");
   startPreview.classList.remove("active");
   playLevel.setup(levels[7]);
   animation.start(playGame);



   // function anim() {
   //    playGame();
   //    requestAnimationFrame(anim);
   // }
   // anim();
   // let count = 0;
   // setInterval(() => {
   //    mobileErr.innerHTML = count; 
   //    count = 0;
   // }, 1000);

   // function check() {
   //    console.log("loop");
   //    count++;
   //    requestAnimationFrame(check);
   // }
   // check();
   
   
   // animation.start(fun);
   
   
   
})();





// const rsWindow = $("#rs-window");
// const rsButton = $("#rs-r");
// const touchField = $("#touch-field");
// const levelWindow = $("#lvlMaker-window");
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
//          "lvlMaker",
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
