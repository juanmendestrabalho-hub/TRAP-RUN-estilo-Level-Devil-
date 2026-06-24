
/* ================= ENGINE CORE ================= */

const game = document.getElementById("game");
const player = document.getElementById("player");
const goal = document.getElementById("goal");
const msg = document.getElementById("msg");

let state = {
  running: false,
  level: 1,
  keys: {},
};

/* ================= PLAYER ================= */

let playerState = {
  x: 40,
  y: 40,
  vy: 0,
  speed: 4,
  gravity: 0.6,
  jumping: false,
  facing: 1,
  checkpoint: { x: 40, y: 40 }
};

/* ================= WORLD ================= */

let enemies = [
  { x: 300, y: 40, dir: 1 },
  { x: 600, y: 40, dir: -1 }
];

/* ================= INPUT ================= */

document.addEventListener("keydown", (e) => {
  state.keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  state.keys[e.key] = false;
});

/* ================= START (SAFE LOOP) ================= */

function startGame() {
  if (state.running) return; // 🚨 evita múltiplos loops

  state.running = true;
  loop();
}

/* ================= MAIN LOOP ================= */

function loop() {
  if (!state.running) return;

  update();
  render();

  requestAnimationFrame(loop);
}

/* ================= UPDATE ================= */

function update() {
  movePlayer();
  applyPhysics();
  updateEnemies();
  checkCollisions();
  checkWin();
  checkCheckpoint();
}

/* ================= PLAYER MOVEMENT ================= */

function movePlayer() {
  if (state.keys["ArrowLeft"]) {
    playerState.x -= playerState.speed;
    playerState.facing = -1;
  }

  if (state.keys["ArrowRight"]) {
    playerState.x += playerState.speed;
    playerState.facing = 1;
  }

  if (state.keys[" "] && !playerState.jumping) {
    playerState.vy = -10;
    playerState.jumping = true;
  }

  if (state.keys["Shift"] && playerState.dashCooldown <= 0) {
    playerState.x += 18 * playerState.facing;
    playerState.dashCooldown = 30;
  }

  if (playerState.dashCooldown > 0) {
    playerState.dashCooldown--;
  }
}

/* ================= PHYSICS ================= */

function applyPhysics() {
  playerState.vy += playerState.gravity;
  playerState.y += playerState.vy;

  if (playerState.y > 40) {
    playerState.y = 40;
    playerState.vy = 0;
    playerState.jumping = false;
  }
}

/* ================= RENDER ================= */

function render() {
  player.style.left = playerState.x + "px";
  player.style.bottom = playerState.y + "px";

  enemies.forEach((e, i) => {
    let el = document.getElementById("enemy-" + i);

    if (!el) {
      el = document.createElement("div");
      el.id = "enemy-" + i;
      el.className = "enemy";
      game.appendChild(el);
    }

    el.style.left = e.x + "px";
    el.style.bottom = e.y + "px";
  });
}

/* ================= ENEMIES ================= */

function updateEnemies() {
  enemies.forEach(e => {
    e.x += e.dir * 2;

    if (e.x > 800 || e.x < 0) {
      e.dir *= -1;
    }
  });
}

/* ================= COLLISIONS ================= */

function checkCollisions() {
  const p = player.getBoundingClientRect();

  document.querySelectorAll(".spike").forEach(s => {
    if (isColliding(p, s.getBoundingClientRect())) {
      die();
    }
  });

  enemies.forEach(e => {
    const ex = {
      x: e.x,
      y: e.y,
      width: 30,
      height: 30
    };

    if (isColliding(p, ex)) {
      die();
    }
  });

  document.querySelectorAll(".fake").forEach(f => {
    if (isColliding(p, f.getBoundingClientRect())) {
      f.style.opacity = 0;
      setTimeout(() => die(), 150);
    }
  });
}

/* ================= CHECKPOINT ================= */

function checkCheckpoint() {
  document.querySelectorAll(".checkpoint").forEach(c => {
    if (isColliding(player.getBoundingClientRect(), c.getBoundingClientRect())) {
      playerState.checkpoint = {
        x: playerState.x,
        y: playerState.y
      };

      msg.innerText = "💾 checkpoint salvo";

      setTimeout(() => msg.innerText = "", 800);
    }
  });
}

/* ================= WIN ================= */

function checkWin() {
  if (isColliding(player.getBoundingClientRect(), goal.getBoundingClientRect())) {
    msg.innerText = "🏆 fase concluída";

    setTimeout(() => {
      respawn();
    }, 800);
  }
}

/* ================= DEATH ================= */

function die() {
  msg.innerText = "💀 morreu";

  const rect = player.getBoundingClientRect();
  spawnParticles(rect.left, window.innerHeight - rect.bottom);

  setTimeout(() => {
    respawn();
  }, 600);
}

/* ================= RESPAWN ================= */

function respawn() {
  playerState.x = playerState.checkpoint.x;
  playerState.y = playerState.checkpoint.y;
  playerState.vy = 0;
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

/* ================= PARTICLES ================= */

function spawnParticles(x, y) {
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("div");

    p.style.position = "absolute";
    p.style.width = "6px";
    p.style.height = "6px";
    p.style.background = "#ff0055";
    p.style.left = x + "px";
    p.style.bottom = y + "px";
    p.style.borderRadius = "50%";

    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6;

    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    let px = x;
    let py = y;

    const interval = setInterval(() => {
      px += vx;
      py += vy;
      vy -= 0.25;

      p.style.left = px + "px";
      p.style.bottom = py + "px";

      if (py < 0) {
        p.remove();
        clearInterval(interval);
      }
    }, 16);
  }
}
