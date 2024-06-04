const audioUseStack = [null, null, null, null, null];
const audioElements = [null, null, null, null, null];
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
   const i = Math.floor(Math.random() * 5);
   const selectedAudio = `./src/audio/bg${i}.wav`;

   stopBackgroundAudio();

   if (audioUseStack[i] !== selectedAudio) {
      if (audioElements[i]) {
         document.body.removeChild(audioElements[i]);
      }

      const audio = document.createElement("audio");
      audio.src = selectedAudio;
      document.body.appendChild(audio);
      audioElements[i] = audio;
      audioUseStack[i] = selectedAudio;

      audio.addEventListener("canplaythrough", () => {
         audio.currentTime = 0;
         audio.volume = tempUser.volume * bgDTvolume;
         audio.loop = true;
         audio.play();
      });
   } else {
      const audio = audioElements[i];
      audio.currentTime = 0;
      audio.volume = tempUser.volume * bgDTvolume;
      audio.loop = true;
      audio.play();
   }
}
