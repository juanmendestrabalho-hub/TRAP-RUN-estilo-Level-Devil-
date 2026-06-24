
const player = document.getElementById("player");
const game = document.getElementById("game");
const msg = document.getElementById("msg");

let x = 40;
let y = 40;
let vy = 0;
let gravity = 0.6;
let jumping = false;

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function startGame() {
  x = 40;
  y = 40;
  vy = 0;
  loop();
}

/* LOOP */
function loop() {
  move();
  physics();
  checkDeath();
  checkWin();

  requestAnimationFrame(loop);
}

/* MOVIMENTO */
function move() {
  if (keys["ArrowLeft"]) x -= 4;
  if (keys["ArrowRight"]) x += 4;

  if (keys[" "] && !jumping) {
    vy = -10;
    jumping = true;
  }

  player.style.left = x + "px";
}

/* FÍSICA */
function physics() {
  vy += gravity;
  y += vy;

  // colisão com chão simples
  if (y > 40) {
    y = 40;
    vy = 0;
    jumping = false;
  }

  player.style.bottom = y + "px";
}

/* MORTE (LEVEL DEVIL STYLE) */
function checkDeath() {
  const px = player.getBoundingClientRect();

  document.querySelectorAll(".spike").forEach(spike => {
    const s = spike.getBoundingClientRect();

    if (
      px.x < s.x + s.width &&
      px.x + px.width > s.x &&
      px.y < s.y + s.height &&
      px.y + px.height > s.y
    ) {
      respawn("💀 Você caiu numa armadilha!");
    }
  });

  document.querySelectorAll(".fake").forEach(p => {
    const r = p.getBoundingClientRect();
    if (
      px.x < r.x + r.width &&
      px.x + px.width > r.x &&
      px.y < r.y + r.height &&
      px.y + px.height > r.y
    ) {
      p.style.opacity = 0;
      setTimeout(() => respawn("💀 Chão falso!"), 200);
    }
  });
}

/* WIN */
function checkWin() {
  const px = player.getBoundingClientRect();
  const g = document.getElementById("goal").getBoundingClientRect();

  if (
    px.x < g.x + g.width &&
    px.x + px.width > g.x &&
    px.y < g.y + g.height &&
    px.y + px.height > g.y
  ) {
    msg.innerText = "🏆 Você venceu... por enquanto 😈";
  }
}

/* RESPAWN */
function respawn(text) {
  msg.innerText = text;

  x = 40;
  y = 40;
  vy = 0;
}
