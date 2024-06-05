const audioElements = [$("#bg0"), $("#bg1")];
const bgDTvolume = 0.3;

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

