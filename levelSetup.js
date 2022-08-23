class GameText {
  constructor(text, textSize, duration) {
    this.text = text;
    this.tSize = textSize;
    this.duration = duration;
    this.date = Date.now();
    this.complete = false;
  }

  draw() {
    color();
    font(`${this.text}px bold Arial, sans-serif`);
    text(this.text, winw / 2, winh / 2, winw);
  }

  update() {
    if (this.date + this.duration <= Date.now()) {
      this.complete = true;
    }
  }
}

class SetupLevel {
  constructor(gameMaps, level) {
    const { row, col, height, width, padSpeed, ballSize, ballSpeed, powerRet, life, map } = gameMaps;

    this.score = 0;
    this.padW = 60;
    this.padH = 8;
    this.level = level;
    this.life = life;
    this.row = row;
    this.col = col;
    this.h = height;
    this.w = width;
    this.pSpeed = padSpeed;
    this.bSpeed = ballSpeed;
    this.bSize = ballSize;
    this.pRet = powerRet;
    this.run = true;
    this.map = map;

    this.balls = [];
    this.obstacles = [];
    this.blocks = [];
    this.particles = [];
    this.powers = [];
    this.text = [];

    this.pad = new Pad(
      winw / 2 - this.padW / 2,
      winh / 1.03,
      this.padW,
      this.padH,
      this.pSpeed
    );

    this.text.push(new GameText(`Level ${this.level + 1}`, 30, 1000));
    setTimeout(() => {
      this.balls.push(new Ball(
        this.pad.x + this.padW / 2,
        this.pad.y - this.padH * 2,
        this.bSize,
        this.bSpeed,
        this
      ));
    }, 1000)
  }

  createObstacles() {
    const sclX = winw / this.row;
    const sclY = winh / this.col;
    const w = sclX / 100 * this.w;
    const h = sclY / 100 * this.h;

    for (let row = 0; row < this.map.length; row++) {
      for (let col = 0; col < this.map[row].length; col++) {
        const gm = this.map[row][col];

        if (gm.type == "_") {
          this.obstacles.push(new Obstacle(
            col * sclX + (sclX - w) / 2,
            row * sclY + (sclY - h) / 2,
            w, h, gm));
        } else if (gm.type == "$") {
          this.blocks.push(new Block(col * sclX, row * sclY, sclX, sclY, gm, SCALE / 2))
        }
      }
    }
  }

  collisionXorY = (cx, cy, cr, rx, ry, rw, rh) => {
    const extra = rw > rh ? rw - rh : rh - rw;
    const right = Math.max(rx + rw, cx + cr);
    const left = Math.min(rx, cx - cr);
    const bottom = Math.max(ry + rh, cy + cr);
    const top = Math.min(ry, cy - cr);

    const vartical = rw > rh ? (right - left) - extra : right - left;
    const horizontal = rw < rh ? (bottom - top) - extra : bottom - top;

    return vartical > horizontal ? "x" : "y";
  }

  crcAndRectCollision = (cx, cy, cr, rx, ry, rw, rh) => {
    return (rx <= cx + cr &&
      rx + rw >= cx - cr &&
      ry <= cy + cr &&
      ry + rh >= cy - cr);
  }

  collision() {
    for (let _i = 0; _i < this.balls.length; _i++) {
      const ball = this.balls[_i];

      // obstacle collision
      for (let i = 0; i < this.obstacles.length; i++) {
        const obt = this.obstacles[i];

        if (this.crcAndRectCollision(ball.x, ball.y, ball.r, obt.x, obt.y, obt.w, obt.h)) {
          const xy = this.collisionXorY(ball.x, ball.y, ball.r, obt.x, obt.y, obt.w, obt.h);
          ball.x += (ball.px - ball.x) * 10;
          ball.y += (ball.py - ball.y) * 10;
          xy == "x" && (ball.vx = -ball.vx);
          xy == "y" && (ball.vy = -ball.vy);
          obt.ht--;
          this.score += 5;

          if (!obt.ht) {
            // set distroy particle
            const len = random(20, 35);
            for (let j = 0; j < len; j++) {
              this.particles.push(new Particle(
                random(obt.x, obt.x + obt.w),
                random(obt.y, obt.y + obt.h),
                obt.cr[obt.ht]
              ));
            }

            // set powers points
            if (random() < this.pRet) {
              const _l = ["💖", "life"];
              const _b = ["💊", "ball"];
              const _s = ["🧭", "slow"];
              const prs = [_l, _b, _s, _b, _s];

              const one = prs[random(0, prs.length, true)];
              this.powers.push(new Power(obt.x, obt.y, obt.w, one[0], one[1]));
            }

            // delete obstacle 
            this.obstacles.splice(i, 1);
            Sounds.destroy();

            // check level is conplete 
            if (this.obstacles.length <= 0) {
              Sounds.win();
              setTimeout(() => {
                this.run = false;
                ID("win-window").classList.add("active");
                ID("score-w").innerText = ` ${this.score}`;
              }, 500);
            }
          }
          break;
        }
      }

      // block collution
      for (let i = 0; i < this.blocks.length; i++) {
        const block = this.blocks[i];
        if (this.crcAndRectCollision(ball.x, ball.y, ball.r, block.x, block.y, block.w, block.h)) {
          const xy = this.collisionXorY(ball.x, ball.y, ball.r, block.x, block.y, block.w, block.h);
          ball.x += (ball.px - ball.x) * 10;
          ball.y += (ball.py - ball.y) * 10;
          xy == "x" && (ball.vx = -ball.vx);
          xy == "y" && (ball.vy = -ball.vy);
          Sounds.hitWall();
          break;
        }
      }

      // game pad collision
      const pad = this.pad;
      if (this.crcAndRectCollision(ball.x, ball.y, ball.r, pad.x, pad.y, pad.w, pad.h)) {
        const xy = this.collisionXorY(ball.x, ball.y, ball.r, pad.x, pad.y, pad.w, pad.h);
        ball.x += (ball.px - ball.x) * 10;
        ball.y += (ball.py - ball.y) * 10;

        if (xy == "y") {
          const collisionPoint = ball.x - (pad.x + pad.w / 2);
          let angle = collisionPoint / (pad.w / 2);
          angle = angle * PI / 3;
          ball.vx = ball.speed * Math.sin(angle);
          ball.vy = -ball.speed * Math.cos(angle);
          this.pad.top = 0;
          setTimeout((this.pad.top = 5), 1000 / 15);
        } else {
          ball.vx = - ball.vx;
        }
        Sounds.padHit();
      }


      // boundary collision
      if (ball.x - ball.r < 0 || ball.x + ball.r > winw ||
        ball.y - ball.r < 0 || ball.y - ball.r > winh) {

        if (ball.x - ball.r < 0 || ball.x + ball.r > winw) {
          ball.vx = - ball.vx;
          Sounds.hitWall();
        }
        if (ball.y - ball.r < 0) {
          ball.vy = - ball.vy;
          Sounds.hitWall();
        }
        if (ball.y - ball.r > winh) {
          this.balls.splice(_i, 1);
          if (!this.balls.length) {
            Sounds.gameOverAudio();
            if (this.life < 1) {
              this.text.push(new GameText(`Game Over!`, 30, 1000));
              this.run = false;
              setTimeout(() => {
                ID("score-r").innerText = ` ${this.score}`;
                rsWindow.classList.toggle("active", true);
              }, 1000);
              break;
            }
            this.life--;
            setTimeout(() => {
              this.balls.push(new Ball(pad.x + this.padW / 2, pad.y - this.padH * 2, this.bSize, this.bSpeed));
            }, 500);
          } else {
            Sounds.death();
          }
          return;
        };
      }
    }
  }

  powersCollision() {
    for (let i = 0; i < this.powers.length; i++) {
      const power = this.powers[i];
      if (
        power.x + power.size > this.pad.x &&
        power.x < this.pad.x + this.pad.w &&
        power.y + power.size > this.pad.y &&
        power.y < this.pad.y + this.pad.h
      ) {
        this.score += 15;
        Sounds.point();
        this.powers.splice(i, 1);

        for (let j = 0; j < 30; j++)
          this.particles.push(new Particle(power.x + power.w / 2, power.y, "#0ff"));

        if (power.type === "ball") {
          this.balls.push(new Ball(
            this.pad.x + this.padW / 2,
            this.pad.y - this.padH * 2,
            this.bSize,
            this.bSpeed
          ));
        } else if (power.type === "life") {
          this.life++;
        } else if (power.type === "slow" && this.bSpeed > 0.7) {
          this.balls.forEach((e) => {
            e.speed -= 0.05;
          })
          this.bSpeed -= 0.05;
        }
        break;
      }
    }

    // whern the powers outside the boundary then remove the element
    for (let i = 0; i < this.powers.length; i++) {
      if (this.powers[i].y - this.powers[i].w > winh) {
        this.powers.splice(i, 1);
        return;
      }
    }
  }

  deleteParticle() {
    for (let i = 0; i < this.particles.length; i++) {
      if (this.particles[i].r <= 0.5) {
        this.particles.splice(i, 1);
        return;
      }
    }
  }

  draw() {
    this.pad.draw();
    this.balls.forEach(ball => { ball.draw(); });
    this.particles.forEach(particle => { particle.draw(); });
    this.obstacles.forEach(obstacle => { obstacle.draw(); })
    this.blocks.forEach(block => { block.draw(); })
    this.powers.forEach(power => { power.draw(); })
    ID("helth").innerText = this.life;
    ID("score").innerText = this.score; 
    this.text.forEach(txt => { !txt.complete && txt.draw(); })
  }

  update() {
    this.pad.update();
    this.balls.forEach(ball => { ball.update(); });
    this.deleteParticle();
    this.powersCollision();
    this.collision();
    this.text.forEach(txt => { txt.update(); });
  }
}