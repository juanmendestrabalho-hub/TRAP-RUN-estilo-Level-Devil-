
const player = document.getElementById("player");
const game = document.getElementById("game");
const msg = document.getElementById("msg");
const goal = document.getElementById("goal");

let state = {
  running: false,
  keys: {},
  mouse: false
};

/* ================= PLAYER STATE ================= */

let p = {
  x: 40,
  y: 40,
  vx: 0,
  vy: 0,
  speed: 4,
  gravity: 0.6,
  grounded: true,
  checkpoint: { x: 40, y: 40 },
  facing: 1
};

/* ================= ENEMIES ================= */

let enemies = [
  { x: 300, y: 40, dir: 1 },
  { x: 600, y: 40, dir: -1 }
];

/* ================= INPUT ================= */

document.addEventListener("keydown", e => state.keys[e.key] = true);
document.addEventListener("keyup", e => state.keys[e.key] = false);

document.addEventListener("mousedown", () => state.mouse = true);
document.addEventListener("mouseup", () => state.mouse = false);

/* ================= START ================= */

function startGame() {
  if (state.running) return;
  state.running = true;
  loop();
}

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
  checkWin();
  checkCheckpoint();
}

/* ================= MOVEMENT ================= */

function move() {
  if (state.keys["ArrowLeft"]) {
    p.x -= p.speed;
    p.facing = -1;
  }

  if (state.keys["ArrowRight"]) {
    p.x += p.speed;
    p.facing = 1;
  }

  /* JUMP (SÓ SOBE SE ESTIVER NO CHÃO) */
  if (state.keys[" "] && p.grounded) {
    p.vy = -12;
    p.grounded = false;
  }

  /* DASH SIMPLES COM MOUSE */
  if (state.mouse) {
    p.x += 6 * p.facing;
  }
}

/* ================= PHYSICS ================= */

function physics() {
  p.vy += p.gravity;
  p.y += p.vy;

  let onGround = false;

  /* CHÃO BASE */
  if (p.y <= 40) {
    p.y = 40;
    p.vy = 0;
    onGround = true;
  }

  /* PLATAFORMAS */
  document.querySelectorAll(".platform").forEach(pl => {
    const r = pl.getBoundingClientRect();
    const pr = player.getBoundingClientRect();

    const platformY = window.innerHeight - r.bottom;

    const horizontal =
      pr.x < r.x + r.width &&
      pr.x + pr.width > r.x;

    const vertical =
      Math.abs(p.y - platformY) < 10;

    const falling = p.vy >= 0;

    if (horizontal && vertical && falling) {
      p.y = platformY;
      p.vy = 0;
      onGround = true;
    }
  });

  p.grounded = onGround;

  /* LIMITES DA TELA */
  if (p.x < 0) p.x = 0;
  if (p.x > window.innerWidth - 30) p.x = window.innerWidth - 30;
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

/* ================= RENDER ================= */

function render() {
  player.style.left = p.x + "px";
  player.style.bottom = p.y + "px";

  enemies.forEach((e, i) => {
    let el = document.getElementById("enemy-" + i);

    if (!el) {
      el = document.createElement("div");
      el.id = "enemy-" + i;
      el.className = "enemy";
      game.appendChild(el);
    }

    el.style.position = "absolute";
    el.style.width = "30px";
    el.style.height = "30px";
    el.style.background = "red";
    el.style.boxShadow = "0 0 10px red";

    el.style.left = e.x + "px";
    el.style.bottom = e.y + "px";
  });
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

/* ================= COLLISIONS ================= */

function checkCollisions() {
  const px = player.getBoundingClientRect();

  /* SPIKES */
  document.querySelectorAll(".spike").forEach(s => {
    if (isColliding(px, s.getBoundingClientRect())) die();
  });

  /* ENEMIES */
  enemies.forEach(e => {
    const ex = {
      x: e.x,
      y: e.y,
      width: 30,
      height: 30
    };

    if (isColliding(px, ex)) die();
  });

  /* FAKE PLATFORM */
  document.querySelectorAll(".fake").forEach(f => {
    if (isColliding(px, f.getBoundingClientRect())) {
      f.style.opacity = 0;
      setTimeout(() => die(), 150);
    }
  });
}

/* ================= CHECKPOINT ================= */

function checkCheckpoint() {
  document.querySelectorAll(".checkpoint").forEach(c => {
    if (isColliding(player.getBoundingClientRect(), c.getBoundingClientRect())) {
      p.checkpoint = { x: p.x, y: p.y };
      msg.innerText = "💾 checkpoint salvo";
      setTimeout(() => msg.innerText = "", 800);
    }
  });
}

/* ================= WIN ================= */

function checkWin() {
  if (isColliding(player.getBoundingClientRect(), goal.getBoundingClientRect())) {
    msg.innerText = "🏆 venceu!";
    setTimeout(() => respawn(), 800);
  }
}

/* ================= DEATH ================= */

function die() {
  const r = player.getBoundingClientRect();

  spawnParticles(r.left, window.innerHeight - r.bottom);

  msg.innerText = "💀 morreu";

  setTimeout(() => {
    respawn();
  }, 600);
}

/* ================= RESPAWN ================= */

function respawn() {
  p.x = p.checkpoint.x;
  p.y = p.checkpoint.y;
  p.vy = 0;
  p.grounded = true;
}

/* ================= PARTICLES ================= */

function spawnParticles(x, y) {
  for (let i = 0; i < 12; i++) {
    const d = document.createElement("div");

    d.style.position = "absolute";
    d.style.width = "6px";
    d.style.height = "6px";
    d.style.background = "#ff0055";
    d.style.left = x + "px";
    d.style.bottom = y + "px";
    d.style.borderRadius = "50%";

    document.body.appendChild(d);

    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 6;

    let vx = Math.cos(a) * s;
    let vy = Math.sin(a) * s;

    let px = x;
    let py = y;

    const loop = setInterval(() => {
      px += vx;
      py += vy;
      vy -= 0.25;

      d.style.left = px + "px";
      d.style.bottom = py + "px";

      if (py < 0) {
        d.remove();
        clearInterval(loop);
      }
    }, 16);
  }
}
