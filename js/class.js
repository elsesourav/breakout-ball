
class Pad {
  constructor(x, y, w, h, speed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = speed;
    this.color = "#fff";
    this.top = 5;
    this.lastPowerUse;

    this.ctl = new Control(this, cvs);
    setTimeout(() => {
      useGyro && this.ctl.gyroscope();
    }, 1000);
  }

  draw() {
    color(255, 255, 1);
    strokeStyle(255, 255, 1);
    curve(this.x, this.y, this.x + this.w, this.y, 3, this.top, true);
    ctx.fillStyle = this.color;
    rect(this.x, this.y, this.w, this.h);
  }

  update() {
    this.ctl.left && this.x - this.vx > 0 && (this.x -= this.vx);
    this.ctl.right && this.x + this.w + this.vx < winw && (this.x += this.vx);
  }
}

class Ball {
  constructor(x, y, r, speed, setupLevel, onlyY = true) {
    this.x = x;
    this.y = y;
    this.fr = r;
    this.r = r;
    this.px = this.x;
    this.py = this.y;
    this.s = speed;
    this.speed = this.s / 5;
    this.vx = this.speed * random(-1, 1);
    this.vy = onlyY ? -this.speed : -this.speed * (random() > 0.5 ? 1 : -1);
    this.setupLevel = setupLevel;
    this.lastPowerUse;
    this.color = "#ffffff";
  }

  draw() {
    ctx.fillStyle = color;
    strokeStyle(255, 255, 0, 1);
    arc(this.x, this.y, this.r + 4, true, 1);
  }

  update() {
    for (let i = 0; i < 30; i++) {
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
    this.invisibel = false;
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
  constructor(x, y, color, vx = random(-2, 2), vy = random(-1, 3), r = random(4), sizeFix = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.r = r;
    this.vx = vx;
    this.vy = vy;
    this.sizeFix = sizeFix;
  }

  draw(x = 0, y = 0) {
    ctx.fillStyle = this.color;
    arc(x + this.x, y + this.y, this.r);
    this.x += this.vx;
    this.y += this.vy;
    this.sizeFix || (this.r /= 1.03);
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
    this.particles = [];
    this.text = text;
  }

  draw() {
    font(`${this.size}px Arial`)
    text(this.text, (this.x + this.w / 2) - this.size / 2, (this.y + this.w / 2) - this.size / 2)
    this.y += this.vy;
    this.particles.forEach(p => {
      p.draw(this.x, this.y);
    })
  }
}