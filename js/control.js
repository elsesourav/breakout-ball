let useGyro = false;
class Control {
  constructor(pad, canvas) {
    this.pad = pad;
    this.cvs = canvas;
    this.bound = this.cvs.getBoundingClientRect();
    this.left = false;
    this.right = false;
    this.#keyEventListener();
  }

  #keyEventListener() {
    const { bound, pad } = this;
    this.cvs.addEventListener("mouseenter", (e) => {
      pad.x = e.clientX - bound.left - pad.w / 2;
    })
    this.cvs.addEventListener("mousemove", (e) => {
      pad.x = e.clientX - bound.left - pad.w / 2;
    })
    this.cvs.addEventListener("touchstart", (e) => {
      pad.x = e.touches[0].clientX - bound.left - pad.w / 2;
    })
    this.cvs.addEventListener("touchmove", (e) => {
      pad.x = e.touches[0].clientX - bound.left - pad.w / 2;
    })

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        touchField.classList.add("active");
        lvl.run = false;
        play.classList.add("active");
      }
    })
  }

  gyroscope() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        const { beta, gamma } = e;

        const g = map(gamma * 10, -winw / 2, winw / 2, 0, winw - this.pad.w / (2 * SCALE));
        if (0 <= g && winw - this.pad.w >= g) {
          if ((beta > 120 && beta < 180) || (beta > 120 && beta < 180)) {
            this.pad.x = (winw - this.pad.w) - g;
          } else {
            this.pad.x = g;
          }
        }
      });
    }
  }
}
