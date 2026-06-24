const player = document.getElementById("player");
const game = document.getElementById("game");
const msg = document.getElementById("msg");
const goal = document.getElementById("goal");

let state = {
  running: false,
  keys: {}
};

let p = {
  x: 40,
  y: 40,
  vy: 0,
  speed: 5,
  gravity: 0.6,
  grounded: true,
  checkpoint: {
    x: 40,
    y: 40
  }
};

let enemies = [
  { x: 300, y: 40, dir: 1 },
  { x: 600, y: 40, dir: -1 }
];

let jumpPressed = false;

/* ================= INPUT ================= */

document.addEventListener("keydown", e => {

  state.keys[e.key] = true;

  if (
    (e.code === "Space" || e.key === " ") &&
    !jumpPressed &&
    p.grounded
  ) {
    jumpPressed = true;
    p.vy = -12;
    p.grounded = false;
  }
});

document.addEventListener("keyup", e => {

  state.keys[e.key] = false;

  if (e.code === "Space" || e.key === " ") {
    jumpPressed = false;
  }
});

/* ================= START ================= */

function startGame() {

  if (state.running) return;

  state.running = true;

  msg.innerText = "🎮 Jogo iniciado";

  requestAnimationFrame(loop);
}

window.startGame = startGame;

/* ================= LOOP ================= */

function loop() {

  if (!state.running) return;

  update();
  render();

  requestAnimationFrame(loop);
}

/* ================= UPDATE ================= */

function update() {

  move();
  physics();
  enemiesAI();

  checkCollisions();
  checkCheckpoint();
  checkWin();
}

/* ================= MOVE ================= */

function move() {

  if (state.keys["ArrowLeft"]) {
    p.x -= p.speed;
  }

  if (state.keys["ArrowRight"]) {
    p.x += p.speed;
  }
}

/* ================= PHYSICS ================= */

function physics() {

  p.vy += p.gravity;
  p.y += p.vy;

  if (p.y >= 40) {
    p.y = 40;
    p.vy = 0;
    p.grounded = true;
  }

  if (p.x < 0) p.x = 0;

  const limit = game.clientWidth - 30;

  if (p.x > limit) {
    p.x = limit;
  }
}

/* ================= ENEMIES ================= */

function enemiesAI() {

  enemies.forEach(enemy => {

    enemy.x += enemy.dir * 2;

    if (enemy.x > 850 || enemy.x < 0) {
      enemy.dir *= -1;
    }
  });
}

/* ================= RENDER ================= */

function render() {

  player.style.left = p.x + "px";
  player.style.bottom = p.y + "px";

  enemies.forEach((enemy, index) => {

    let el = document.getElementById("enemy-" + index);

    if (!el) {

      el = document.createElement("div");

      el.id = "enemy-" + index;
      el.className = "enemy";

      game.appendChild(el);
    }

    el.style.position = "absolute";
    el.style.width = "30px";
    el.style.height = "30px";
    el.style.background = "red";
    el.style.boxShadow = "0 0 12px red";

    el.style.left = enemy.x + "px";
    el.style.bottom = enemy.y + "px";
  });
}

/* ================= COLLISION ================= */

function isColliding(a, b) {

  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

/* ================= COLLISIONS ================= */

function checkCollisions() {

  const playerRect = player.getBoundingClientRect();

  document.querySelectorAll(".spike").forEach(spike => {

    if (
      isColliding(
        playerRect,
        spike.getBoundingClientRect()
      )
    ) {
      die();
    }
  });

  document.querySelectorAll(".enemy").forEach(enemy => {

    if (
      isColliding(
        playerRect,
        enemy.getBoundingClientRect()
      )
    ) {
      die();
    }
  });

  document.querySelectorAll(".fake").forEach(fake => {

    if (
      isColliding(
        playerRect,
        fake.getBoundingClientRect()
      )
    ) {

      fake.style.opacity = "0";

      setTimeout(() => {
        die();
      }, 150);
    }
  });
}

/* ================= CHECKPOINT ================= */

function checkCheckpoint() {

  const playerRect = player.getBoundingClientRect();

  document.querySelectorAll(".checkpoint").forEach(cp => {

    if (
      isColliding(
        playerRect,
        cp.getBoundingClientRect()
      )
    ) {

      p.checkpoint = {
        x: p.x,
        y: p.y
      };

      msg.innerText = "💾 Checkpoint salvo";

      setTimeout(() => {
        msg.innerText = "";
      }, 1000);
    }
  });
}

/* ================= WIN ================= */

function checkWin() {

  if (
    isColliding(
      player.getBoundingClientRect(),
      goal.getBoundingClientRect()
    )
  ) {

    msg.innerText = "🏆 VOCÊ VENCEU!";

    setTimeout(() => {
      respawn();
    }, 1200);
  }
}

/* ================= DEATH ================= */

function die() {

  const r = player.getBoundingClientRect();

  spawnParticles(
    r.left,
    window.innerHeight - r.bottom
  );

  msg.innerText = "💀 Você morreu";

  state.running = false;

  setTimeout(() => {

    respawn();

    state.running = true;

    requestAnimationFrame(loop);

  }, 800);
}

/* ================= RESPAWN ================= */

function respawn() {

  p.x = p.checkpoint.x;
  p.y = p.checkpoint.y;
  p.vy = 0;
  p.grounded = true;

  msg.innerText = "";
}

/* ================= PARTICLES ================= */

function spawnParticles(x, y) {

  for (let i = 0; i < 15; i++) {

    const particle = document.createElement("div");

    particle.style.position = "absolute";
    particle.style.width = "6px";
    particle.style.height = "6px";
    particle.style.borderRadius = "50%";
    particle.style.background = "#ff0055";

    particle.style.left = x + "px";
    particle.style.bottom = y + "px";

    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8;

    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    let px = x;
    let py = y;

    const timer = setInterval(() => {

      px += vx;
      py += vy;

      vy -= 0.25;

      particle.style.left = px + "px";
      particle.style.bottom = py + "px";

      if (py < 0) {

        particle.remove();
        clearInterval(timer);
      }

    }, 16);
  }
}

/* ================= PRIMEIRO RENDER ================= */

render();
