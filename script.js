const player = document.getElementById("player");
const game = document.getElementById("game");
const msg = document.getElementById("msg");
const menu = document.getElementById("menu");
const dashUI = document.getElementById("dashUI");

let running = false;

/* ================= WORLD CAMERA ================= */
let cameraX = 0;

/* ================= PLAYER ================= */

let p = {
  x: 40,
  y: 40,
  vx: 0,
  vy: 0,
  speed: 4,
  gravity: 0.6,
  jumping: false,
  grounded: false,
  wallTouch: false,
  wallDir: 0,
  facing: 1,
  checkpoint: { x: 40, y: 40 }
};

/* ================= INPUT ================= */

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* ================= DASH ================= */

let dash = {
  cooldown: 0,
  max: 60
};

/* ================= START ================= */

function startGame() {
  menu.style.display = "none";

  if (running) return;
  running = true;

  loop();
}

/* ================= LOOP ================= */

function loop() {
  if (!running) return;

  update();
  render();

  requestAnimationFrame(loop);
}

/* ================= UPDATE ================= */

function update() {
  move();
  physics();
  wallCheck();
  dashSystem();
  checkCollisions();
  updateCamera();
}

/* ================= MOVE ================= */

function move() {
  if (keys["ArrowLeft"]) {
    p.x -= p.speed;
    p.facing = -1;
  }

  if (keys["ArrowRight"]) {
    p.x += p.speed;
    p.facing = 1;
  }

  /* JUMP */
  if (keys[" "] && p.grounded) {
    p.vy = -12;
    p.grounded = false;
  }

  /* WALL JUMP */
  if (keys[" "] && p.wallTouch) {
    p.vy = -12;
    p.vx = 8 * -p.wallDir;
    p.wallTouch = false;
  }

  /* DASH */
  if (keys["Shift"] && dash.cooldown <= 0) {
    p.x += 20 * p.facing;
    dash.cooldown = dash.max;
  }
}

/* ================= PHYSICS ================= */

function physics() {
  p.vy += p.gravity;
  p.y += p.vy;

  /* chão */
  if (p.y > 40) {
    p.y = 40;
    p.vy = 0;
    p.grounded = true;
  }

  if (dash.cooldown > 0) dash.cooldown--;
}

/* ================= WALL DETECTION ================= */

function wallCheck() {
  p.wallTouch = false;

  document.querySelectorAll(".platform").forEach(w => {
    const r = w.getBoundingClientRect();
    const pr = player.getBoundingClientRect();

    /* encostando na parede lateral */
    if (
      pr.y < r.y + r.height &&
      pr.y + pr.height > r.y
    ) {
      if (Math.abs(pr.right - r.left) < 8) {
        p.wallTouch = true;
        p.wallDir = 1;
      }

      if (Math.abs(pr.left - r.right) < 8) {
        p.wallTouch = true;
        p.wallDir = -1;
      }
    }
  });
}

/* ================= DASH UI ================= */

function dashSystem() {
  const percent = dash.cooldown / dash.max;
  dashUI.style.setProperty("--dash", percent);

  dashUI.innerHTML = "";
  const fill = document.createElement("div");
  fill.style.width = (100 - percent * 100) + "%";
  fill.style.height = "100%";
  fill.style.background = "#00f5ff";

  dashUI.appendChild(fill);
}

/* ================= CAMERA ================= */

function updateCamera() {
  cameraX = p.x - window.innerWidth / 2;

  game.style.transform = `translateX(${-cameraX}px)`;
}

/* ================= COLLISIONS ================= */

function checkCollisions() {
  const pr = player.getBoundingClientRect();

  document.querySelectorAll(".spike").forEach(s => {
    if (isColliding(pr, s.getBoundingClientRect())) die();
  });
}

/* ================= RENDER ================= */

function render() {
  player.style.left = p.x + "px";
  player.style.bottom = p.y + "px";
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
  msg.innerText = "💀 morreu";

  setTimeout(() => {
    p.x = p.checkpoint.x;
    p.y = p.checkpoint.y;
    p.vy = 0;
  }, 500);
}
