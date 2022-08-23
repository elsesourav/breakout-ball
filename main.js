const rsWindow = ID("rs-window");
const rsButton = ID("rs-r");
const touchFild = ID("touch-fild");


const levelWindow = ID("level-window");
const scrollList = ID("scroll-list");

const play = _$(".play")[0];
hover(play)


const audioOpt = _$(".audio-opt");
audioOpt.forEach(ao => {
  hover(ao);
})


// set levels 
let levels = [];
function setLevels() {
  scrollList.innerHTML = "";
  for (let i = 0; i < gameMaps.length; i++) {
    const lvl = createEle("div", "level", scrollList, `<span>🌟</span><p>${i + 1}</p>`);
    hover(lvl);
    levels.push(lvl);
  }
}
setLevels();

const FPS = 60;

audioOpt.forEach(ao => {
  ao.addEventListener("click", () => {
    audioMuted = audioMuted ? false : true;
    backgroundAudio.muted = audioMuted;
    ao.classList.toggle("active");
  })
})


let currentLevel;
let currentLevelIndex;
let lvl;

levels.forEach((lvl, i) => {
  lvl.addEventListener("click", () => {
    currentLevel = gameMaps[i];
    currentLevelIndex = i;
    setup();
    gameStart();
  })
});

const pous = ID("pous-icon");
hover(pous);
pous.on("click", () => {
  touchFild.classList.add("active");
  lvl.run = false;
  play.classList.add("active");
})

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


function gameStart() {  animation(FPS, () => {
    if (lvl.run) {
      clrScr();
      fill();
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