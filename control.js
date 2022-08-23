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
}