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
    font(`${this.tSize}px bold Arial, sans-serif`);
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
      winh / 1.01,
      this.padW,
      this.padH,
      this.pSpeed,
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
    }, 1000);
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

  circleAndRectCollision = (cir, rect) => {
    const { x, y, w, h } = rect;
    let cx = cir.x, cy = cir.y, cr = cir.r;

    if (x <= cx + cr && x + w >= cx - cr &&
      y <= cy + cr && y + h >= cy - cr) {

      const extra = w > h ? w - h : h - w;
      const right = Math.max(x + w, cx + cr);
      const left = Math.min(x, cx - cr);
      const bottom = Math.max(y + h, cy + cr);
      const top = Math.min(y, cy - cr);

      const vartical = w > h ? (right - left) - extra : right - left;
      const horizontal = w < h ? (bottom - top) - extra : bottom - top;

      return vartical > horizontal ? "x" : "y";
    }
    return null;
  }


  collision() {
    for (let _i = 0; _i < this.balls.length; _i++) {
      const ball = this.balls[_i];

      // obstacle collision
      for (let i = 0; i < this.obstacles.length; i++) {
        const obt = this.obstacles[i];
        const __is__ = this.circleAndRectCollision(ball, obt);
        if (__is__) {
          ball.x += (ball.px - ball.x) * 5;
          ball.y += (ball.py - ball.y) * 5;
          __is__ == "x" && (ball.vx = -ball.vx);
          __is__ == "y" && (ball.vy = -ball.vy);
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
              const _b = ["🎭", "ball"];
              const _s = ["⚡", "speed"];
              const prs = [_l, _b, _s, _b, _s];

              const one = prs[random(0, prs.length, true)];
              const pow = new Power(obt.x, obt.y, obt.w, one[0], one[1]);
              this.powers.push(pow);

              const ln = random(20, 30);
              for (let i = 0; i < ln; i++) {
                const x = random(-5, 25);
                const y = random(-15, 15);
                const c = ["#f00", "#ff0", "#0f0", "#0ff"];
                const rc = random(0, c.length - 1, true);
                pow.particles.push(
                  new Particle(
                    x, y,
                    c[rc], random(-1, 1),
                    random(-1, 1),
                    1,
                    true
                  )
                );
              }
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
          } else {
            // set distroy particle
            const len = random(5, 15);
            for (let j = 0; j < len; j++) {
              this.particles.push(new Particle(
                random(obt.x, obt.x + obt.w),
                random(obt.y, obt.y + obt.h),
                obt.cr[obt.ht]
              ));
            }
          }
          break;
        }
      }

      // block collution
      for (let i = 0; i < this.blocks.length; i++) {
        const block = this.blocks[i];
        if (block.invisibel) continue;
        const __is__ = this.circleAndRectCollision(ball, block);
        if (__is__) {
          ball.x += (ball.px - ball.x) * 5;
          ball.y += (ball.py - ball.y) * 5;
          __is__ == "x" && (ball.vx = -ball.vx);
          __is__ == "y" && (ball.vy = -ball.vy);
          Sounds.hitWall();
          block.invisibel = true;
          setTimeout(() => {
            block.invisibel = false;
          }, 100);
          break;
        }
      }

      // game pad collision
      const pad = this.pad;
      const __is__ = this.circleAndRectCollision(ball, pad);
      if (__is__) {
        ball.x += (ball.px - ball.x) * 5;
        ball.y += (ball.py - ball.y) * 5;

        if (__is__ == "y") {
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
          let temp = [];
          this.balls.forEach(ball => {
            temp.push(new Ball(ball.x, ball.y, ball.r, ball.s, ball.setupLevel, false))
          })
          temp.forEach(ball => {
            this.balls.push(ball);
          })
        } else if (power.type === "life") {
          this.life++;
        } else if (power.type === "speed") {
          this.pad.vx += 5;
          this.pad.color = "#f00";
          setTimeout(() => {
            this.pad.color = "#fff";
            this.pad.vx -= 5;
          }, 10000)
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