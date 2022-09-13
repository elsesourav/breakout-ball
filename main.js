const rsWindow = ID("rs-window");
const rsButton = ID("rs-r");
const touchFild = ID("touch-fild");


const levelWindow = ID("level-window");
const scrollList = ID("scroll-list");

const play = _$(".play")[0];
hover(play)

const gyroOpt = _$(".gyro-opt");
const audioOpt = _$(".audio-opt");
audioOpt.forEach(ao => {
  hover(ao);
})
hover(gyroOpt[0]);

let winLevels = [];

try {
  let temp = getDataToLocalStorage("teamSourav-bb");
  if (temp.length === gameMaps.length) {
    winLevels = temp;
    console.log(winLevels);
  } else {
    gameMaps.forEach(() => {
      winLevels.push({ win: false, score: 0 });
    });
    setDataToLocalStorage("teamSourav-bb", winLevels);
  }
} catch (error) {
  gameMaps.forEach(() => {
    console.log(winLevels);
    winLevels.push({ win: false, score: 0 });
    setDataToLocalStorage("teamSourav-bb", winLevels);
  });
  console.log("no-data first time open");
}


// set levels 
let levels = [];
function setLevels() {
  scrollList.innerHTML = "";
  for (let i = 0; i < gameMaps.length; i++) {
    const lvl = createEle("div", "level", scrollList, `<span>🌟</span><p>${i + 1}</p> ${winLevels[i].score && `<h4>🎖${winLevels[i].score}</h4>`}`);
    if (winLevels[i].win) {
      lvl.classList.add("win");
    }
    hover(lvl);
    levels.push(lvl);
  }
}
setLevels();

const FPS = 60;

let mutedClick = false;
audioOpt.forEach(ao => {
  ao.addEventListener("click", () => {
    audioMuted = audioMuted ? false : true;
    mutedClick = audioMuted;
    backgroundAudio.muted = audioMuted;
    audioOpt.forEach((a) => {
      a.classList.toggle("active", !audioMuted);
    })
  })
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    audioMuted = true;
    backgroundAudio.muted = audioMuted;
    audioOpt.forEach((a) => {
      a.classList.toggle("active", !audioMuted);
    })
  } else {
    if (mutedClick) return;
    audioMuted = false;
    backgroundAudio.muted = audioMuted;
    audioOpt.forEach((a) => {
      a.classList.toggle("active", !audioMuted);
    })
  }
})

const settingClose = ID("setting-close");
const setting = ID("setting");
const settingOpen = ID("setting-open");


gyroOpt[0].addEventListener("click", () => {
  useGyro = useGyro ? false : true;
  gyroOpt[0].classList.toggle("active", !useGyro);
})

settingOpen.addEventListener("click", () => {
  setting.classList.add("active");
})
hover(settingOpen);

hover(settingClose);
settingClose.addEventListener("click", () => {
  setTimeout(() => {
    setting.classList.remove("active");
  }, 200);
})

let currentLevel;
let currentLevelIndex;
let lvl = null;

levels.forEach((l, i) => {
  l.addEventListener("click", () => {
    currentLevel = gameMaps[i];
    currentLevelIndex = i;
    setup();
  })
});

const pous = ID("pous-icon");
hover(pous);
pous.on("click", () => {
  touchFild.classList.add("active");
  lvl.run = false;
  play.classList.add("active");
});

function setup() {
  levelWindow.classList.toggle("active", false);
  lvl = new SetupLevel(currentLevel, currentLevelIndex);
  lvl.createObstacles();
}

rsButton.on("click", () => {
  rsWindow.classList.toggle("active", false);
  setup();
});

const restartBtn = ID("restart-btn");
hover(restartBtn);

restartBtn.on("click", () => {
  touchFild.classList.remove("active");
  play.classList.remove("active");
  setup();
});
gameStart();
function gameStart() {
  animation(FPS, () => {
    if (lvl && lvl.run) {
      background(0, 0, 0, 0.6);
      lvl.draw();
      lvl.update();
    }
  });
}

const winWindow = ID("win-window");
hover(ID("menu"));
ID("menu").on("click", () => {
  lvl.run = false;
  winWindow.classList.remove("active");
  levelWindow.classList.toggle("active", true);
})
hover(ID("rs-w"));
ID("rs-w").on("click", () => {
  winWindow.classList.remove("active");
  setup();
})

play.addEventListener("click", () => {
  play.classList.remove("active");
  setTimeout(() => {
    touchFild.classList.remove("active");
    lvl.run = true;
  }, 500);
})

const loby = ID("loby-btn");
hover(loby);

loby.on("click", () => {
  touchFild.classList.remove("active");
  play.classList.remove("active");
  levelWindow.classList.toggle("active", true);
})

/* ----------- windwo lode ------------- */
window.onload = () => {
  ID("loading-window").classList.remove("active");
}