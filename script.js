
const player = document.getElementById("player");
const game = document.getElementById("game");
const msg = document.getElementById("msg");
const goal = document.getElementById("goal");

let x = 40;
let y = 40;
let vy = 0;

let gravity = 0.6;
let jumping = false;

let keys = {};
let running = false;

/* ================= NEW SYSTEMS ================= */

let dashCooldown = 0;
let dashPower = 18;
let facing = 1;

let checkpoint = { x: 40, y: 40 };

let enemies = [
  { x: 300, y: 40, dir: 1 },
  { x: 600, y: 40, dir: -1 }
];

/* INPUT */
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* ================= START ================= */
function startGame() {
  x = checkpoint.x;
  y = checkpoint.y;
  vy = 0;
  msg.innerText = "";

  if (!running) {
    running = true;
    loop();
  }
}

/* ================= LOOP ================= */
function loop() {
  if (!running) return;

  move();
  physics();
  enemiesAI();
  checkDeath();
  checkWin();
  checkCheckpoint();

  renderEnemies();

  requestAnimationFrame(loop);
}

/* ================= MOVEMENT ================= */
function move() {

  if (keys["ArrowLeft"]) {
    x -= 4;
    facing = -1;
  }

  if (keys["ArrowRight"]) {
    x += 4;
    facing = 1;
  }

  /* JUMP */
  if (keys[" "] && !jumping) {
    vy = -10;
    jumping = true;
  }

  /* DASH */
  if (keys["Shift"] && dashCooldown <= 0) {
    x += dashPower * facing;
    dashCooldown = 40;
  }

  dashCooldown--;

  player.style.left = x + "px";
}

/* ================= PHYSICS ================= */
function physics() {
  vy += gravity;
  y += vy;

  if (y > 40) {
    y = 40;
    vy = 0;
    jumping = false;
  }

  player.style.bottom = y + "px";
}

/* ================= WALL JUMP ================= */
function wallJumpCheck() {
  const platforms = document.querySelectorAll(".platform");

  let touchingWall = false;

  platforms.forEach(p => {
    const r = p.getBoundingClientRect();
    const px = player.getBoundingClientRect();

    if (
      px.y < r.y + r.height &&
      px.y + px.height > r.y &&
      Math.abs(px.right - r.left) < 10
    ) {
      touchingWall = true;
      facing *= -1;
    }
  });

  return touchingWall;
}

/* ================= ENEMIES ================= */
function enemiesAI() {
  enemies.forEach(e => {
    e.x += e.dir * 2;

    if (e.x > 800 || e.x < 0) {
      e.dir *= -1;
    }
  });
}

/* ================= RENDER ENEMIES ================= */
function renderEnemies() {

  document.querySelectorAll(".enemy").forEach(e => e.remove());

  enemies.forEach(e => {
    const div = document.createElement("div");

    div.className = "enemy";
    div.style.position = "absolute";
    div.style.width = "30px";
    div.style.height = "30px";
    div.style.background = "red";
    div.style.left = e.x + "px";
    div.style.bottom = e.y + "px";
    div.style.boxShadow = "0 0 15px red";

    game.appendChild(div);
  });
}

/* ================= CHECKPOINT ================= */
function checkCheckpoint() {
  document.querySelectorAll(".checkpoint").forEach(c => {
    const r = c.getBoundingClientRect();
    const px = player.getBoundingClientRect();

    if (isColliding(px, r)) {
      checkpoint = { x, y };
      msg.innerText = "💾 Checkpoint salvo!";
      setTimeout(() => msg.innerText = "", 800);
    }
  });
}

/* ================= DEATH ================= */
function checkDeath() {

  const px = player.getBoundingClientRect();

  /* spikes */
  document.querySelectorAll(".spike").forEach(spike => {
    const s = spike.getBoundingClientRect();

    if (isColliding(px, s)) die();
  });

  /* enemies */
  enemies.forEach(e => {
    const ex = {
      x: e.x,
      y: e.y,
      width: 30,
      height: 30
    };

    if (isColliding(px, ex)) die();
  });
}

/* ================= WIN ================= */
function checkWin() {
  const px = player.getBoundingClientRect();
  const g = goal.getBoundingClientRect();

  if (isColliding(px, g)) {
    msg.innerText = "🏆 Fase completa!";
    setTimeout(() => startGame(), 1000);
  }
}

/* ================= COLLISION ================= */
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/* ================= DEATH ================= */
function die() {
  const rect = player.getBoundingClientRect();

  spawnParticles(rect.left, window.innerHeight - rect.bottom);

  msg.innerText = "💀 Você morreu";

  setTimeout(() => {
    x = checkpoint.x;
    y = checkpoint.y;
    vy = 0;
  }, 600);
}

/* ================= PARTICLES ================= */
function spawnParticles(px, py) {
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("div");

    p.style.position = "absolute";
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.background = "#ff0055";
    p.style.left = px + "px";
    p.style.bottom = py + "px";
    p.style.borderRadius = "50%";

    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6;

    let vx = Math.cos(angle) * speed;
    let vyLocal = Math.sin(angle) * speed;

    let posX = px;
    let posY = py;

    const interval = setInterval(() => {
      posX += vx;
      posY += vyLocal;
      vyLocal -= 0.25;

      p.style.left = posX + "px";
      p.style.bottom = posY + "px";

      if (posY < 0) {
        p.remove();
        clearInterval(interval);
      }
    }, 16);
  }
}
