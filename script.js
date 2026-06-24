
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

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* ================= START ================= */
function startGame() {
  x = 40;
  y = 40;
  vy = 0;
  jumping = false;
  msg.innerText = "";

  if (!running) {
    running = true;
    loop();
  }
}

/* ================= GAME LOOP ================= */
function loop() {
  if (!running) return;

  move();
  physics();
  checkDeath();
  checkWin();

  requestAnimationFrame(loop);
}

/* ================= MOVEMENT ================= */
function move() {
  if (keys["ArrowLeft"]) x -= 4;
  if (keys["ArrowRight"]) x += 4;

  if (keys[" "] && !jumping) {
    vy = -10;
    jumping = true;
  }

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

/* ================= DEATH ================= */
function checkDeath() {
  const px = player.getBoundingClientRect();

  document.querySelectorAll(".spike").forEach(spike => {
    const s = spike.getBoundingClientRect();

    if (isColliding(px, s)) {
      die("💀 Você caiu numa armadilha!");
    }
  });

  document.querySelectorAll(".fake").forEach(p => {
    const r = p.getBoundingClientRect();

    if (isColliding(px, r)) {
      p.style.opacity = 0;
      setTimeout(() => die("💀 Chão falso!"), 150);
    }
  });
}

/* ================= WIN ================= */
function checkWin() {
  const px = player.getBoundingClientRect();
  const g = goal.getBoundingClientRect();

  if (isColliding(px, g)) {
    msg.innerText = "🏆 Você venceu... por enquanto 😈";

    setTimeout(() => {
      respawn();
    }, 1000);
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

/* ================= DEATH SYSTEM ================= */
function die(text) {
  msg.innerText = text;

  const rect = player.getBoundingClientRect();
  spawnParticles(rect.left, window.innerHeight - rect.bottom);

  setTimeout(() => {
    respawn();
  }, 700);
}

/* ================= RESPAWN ================= */
function respawn() {
  x = 40;
  y = 40;
  vy = 0;
  jumping = false;
  msg.innerText = "";
}

/* ================= PARTICLES ================= */
function spawnParticles(px, py) {
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("div");

    p.style.position = "absolute";
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.background = "#ff0055";
    p.style.left = px + "px";
    p.style.bottom = py + "px";
    p.style.borderRadius = "50%";
    p.style.boxShadow = "0 0 10px #ff0055";

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
