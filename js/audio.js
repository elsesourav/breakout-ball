const audioElements = [$("#bg0"), $("#bg1")];
const bgDTvolume = 0.3;

// class Effect {
//    constructor(name) {
//       this.audio = new Audio();
//       this.audio.src = `./../src/audio/${name}.wav`;
//    }

//    setVolume(volume) {
//       this.audio.volume = volume;
//    }

//    play() {
//       this.audio.currentTime = 0;
//       this.audio.play();
//    }
// }

// class Effects {
//    constructor() {
//       this.click = new Effect("click");
//       this.blockHit = new Effect("block-hit");
//       this.sideHit = new Effect("side-hit");
//       this.damage = new Effect("damage");
//       this.win = new Effect("win");
//       this.gameOver = new Effect("game-over");
//    }

//    setVolume(volume) {
//       this.click.setVolume(volume);
//       this.blockHit.setVolume(volume);
//       this.sideHit.setVolume(volume);
//       this.damage.setVolume(volume);
//       this.win.setVolume(volume);
//       this.gameOver.setVolume(volume);
//    }
// }

// let effects = new Effects();

function stopBackgroundAudio() {
   audioElements.forEach((audio) => {
      if (audio) audio.pause();
   });
}

function audioChangeVolume(volume) {
   audioElements.forEach((audio) => {
      if (audio) audio.volume = volume * bgDTvolume;
   });
}

function playBackgroundAudio() {
   const i = Math.floor(Math.random() * 2);
   const audio = audioElements[i];

   audio.currentTime = 0;
   audio.volume = tempUser.volume * bgDTvolume;
   audio.loop = true;
   audio.play();
}

const wav = {
   click: $("#click"),
   blockHit: $("#block-hit"),
   sideHit: $("#side-hit"),
   damage: $("#damage"),
   gameOver: $("#game-over"),
   win: $("#win"),
};

function setVolume(volume) {
   wav.click.volume = volume;
   wav.blockHit.volume = volume;
   wav.sideHit.volume = volume * 0.5;
   wav.damage.volume = volume;
   wav.win.volume = volume;
   wav.gameOver.volume = volume;
}

