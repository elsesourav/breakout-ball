
class Pad {
  constructor(x, y, w, h, speed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = speed;
    this.top = 5;

    this.ctl = new Control();
  }

  draw() {
    color(255, 255, 1);
    strokeStyle(255, 255, 1);
    curve(this.x, this.y, this.x + this.w, this.y, 3, this.top, true);
    color();
    rect(this.x, this.y, this.w, this.h);
  }

  update() {
    this.ctl.left && this.x - this.vx > 0 && (this.x -= this.vx);
    this.ctl.right && this.x + this.w + this.vx < winw && (this.x += this.vx);
  }
}

class Ball {
  constructor(x, y, r, speed, setupLevel) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.px = this.x;
    this.py = this.y;
    this.speed = speed / 20;
    this.vx = this.speed * random(-1, 1);
    this.vy = -this.speed;
    this.setupLevel = setupLevel;
  }

  draw() {
    color();
    strokeStyle(255, 255, 0, 1);
    arc(this.x, this.y, this.r, true, 1);
  }

  update() {
    for (let i = 0; i < 120; i++) {
      this.px = this.x;
      this.py = this.y;
      this.x += this.vx;
      this.y += this.vy;
      this.setupLevel && this.setupLevel.collision();
    }
  }
}

class Obstacle {
  constructor(x, y, w, h, obj) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.ht = obj.helth;
    this.cr = obj.color;
    this.sk = obj.stroke;
    this.boder = 2;
  }

  draw() {
    ctx.fillStyle = this.cr[this.ht - 1];
    ctx.strokeStyle = this.sk[this.ht - 1];
    rect(this.x, this.y, this.w, this.h, true, this.boder);
  }
}

class Block {
  constructor(x, y, w, h, obj, scale) {
    this.scale = scale;
    this.x = x + this.scale;
    this.y = y + this.scale;
    this.w = w - this.scale * 2;
    this.h = h - this.scale * 2;
    this.ht = obj.helth;
    this.cr = obj.color;
    this.sk = obj.stroke;
    this.boder = 2;
  }

  draw() {
    ctx.fillStyle = this.cr[this.ht - 1];
    ctx.strokeStyle = this.sk[this.ht - 1];
    rect(
      this.x - this.scale,
      this.y - this.scale,
      this.w + this.scale * 2,
      this.h + this.scale * 2,
      true,
      this.boder
    );
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.r = random(4);
    this.vx = random(-2, 2);
    this.vy = random(-1, 3);
  }

  draw() {
    ctx.fillStyle = this.color;
    arc(this.x, this.y, this.r);
    this.x += this.vx;
    this.y += this.vy;
    this.r /= 1.03;
  }
}

class Power {
  constructor(x, y, w, text, type) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.type = type;
    this.size = 15;
    this.vy = 4;
    this.text = text;
  }

  draw() {
    font(`${this.size}px Arial`)
    text(this.text, (this.x + this.w / 2) - this.size / 2, (this.y + this.w / 2) - this.size / 2)
    this.y += this.vy;
  }
}