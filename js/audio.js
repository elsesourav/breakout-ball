const audioElements = [$("#bg0"), $("#bg1")];
const bgDTvolume = 0.3;


class Effect {
   constructor(name) {
      this.audio = $(`#${name}`);
   }

   setVolume(volume) {
      this.audio.volume = volume;
   }

   play() {
      this.audio.currentTime = 0;
      this.audio.play();
   }
}

class Effects {
   constructor() {
      this.blockHit = new Effect("block-hit");
      this.click = new Effect("click");
      this.damage = new Effect("damage");
      this.sideHit = new Effect("side-hit");
      this.win = new Effect("win");
   }

   setVolume(volume) {
      this.blockHit.setVolume(volume);
      this.click.setVolume(volume);
      this.damage.setVolume(volume);
      this.sideHit.setVolume(volume);
      this.win.setVolume(volume);
   }
}

let effects = new Effects();

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

   stopBackgroundAudio();

   audio.currentTime = 0;
   audio.volume = tempUser.volume * bgDTvolume;
   audio.loop = true;
   audio.play();
}
