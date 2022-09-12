let useGyro = true;
class Control {
  constructor() {
    this.left = false;
    this.right = false;
    this.#keyEventListener();
  }

  #keyEventListener() {
    window.addEventListener("keydown", (e) => {
      e.keyCode === 39 && (this.right = true);
      e.keyCode === 37 && (this.left = true);
    })
    window.addEventListener("keyup", (e) => {
      e.keyCode === 39 && (this.right = false);
      e.keyCode === 37 && (this.left = false);
    })
    document.body.addEventListener("touchstart", (e) => {
      const huf = window.innerWidth / 2;
      const x = e.touches[0].clientX;
      huf < x ? (this.right = true) : (this.left = true);
    })
    document.body.addEventListener("touchend", () => {
      this.right = false;
      this.left = false;
    })
  }

  gyroscope(pad, gyro) {
    if (window.DeviceOrientationEvent) {
      console.log("gyro control");
      window.addEventListener("deviceorientation", (e) => {
        const {beta, gamma} = e;
        const s = 10;
        const g = (gyro && gamma * s * winw / 2) - pad.w / 2;
        if (g >= 0 && winw - pad.w >= g) {
          if ((beta > 120 && beta < 180) || (beta > 120 && beta < 180)) {
            pad.x = (winw - pad.w) - g;
          } else {
            pad.x = g;
          }
        }
      }, false);
    }
  }
}
