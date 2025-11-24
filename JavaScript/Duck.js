const honk = document.getElementById("honk");
const toggle = document.getElementById("toggle");
const feed = document.getElementById("feed");

let chaos = false;
let walter = null; // only one goose
let note = null;

const notes = [
  "HONK! 🦆",
  "Quack??",
  "Mine now!",
  "Your cursor belongs to me.",
  "Fear the goose.",
  "Chaos reigns.",
  "I live here now.",
  "Untitled Goose vibes.",
  "404: Bread not found.",
  "Where’s the bread?",
  "Stealing snacks...",
  "Carbs are life.",
  "Got any grapes?",
  "Nice website, shame if something happened to it.",
  "I see you moving that mouse.",
  "You can’t stop me.",
  "Click the button, I dare you."
];
// Spawn Walter once
function spawnWalter() {
  walter = document.createElement("img");
  walter.src = "/Icons/Goose.png";
  walter.className = "goose";
  walter.style.left = Math.random() * document.documentElement.scrollWidth + "px";
  walter.style.top = Math.random() * document.documentElement.scrollHeight + "px";
  document.body.appendChild(walter);

  note = document.createElement("div");
  note.className = "note";
  note.innerText = notes[Math.floor(Math.random() * notes.length)];
  document.body.appendChild(note);

  animateWalter();
}

function animateWalter() {
  let x = parseFloat(walter.style.left) || 0;
  let y = parseFloat(walter.style.top) || 0;
  let targetX, targetY;

  function pickNewTarget() {
    do {
      targetX = Math.random() * (document.documentElement.scrollWidth - 100);
      targetY = Math.random() * (document.documentElement.scrollHeight - 100);
    } while (Math.abs(targetX - x) < 100 && Math.abs(targetY - y) < 100);
  }

  pickNewTarget();

  function step() {
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20) {
      x = targetX;
      y = targetY;
      pickNewTarget();

      if (chaos && Math.random() < 0.3) {
        note.innerText = notes[Math.floor(Math.random() * notes.length)];
      }
      if (chaos && Math.random() < 0.2) honk.play();
    } else {
      const speed = 2;
      x += (dx / dist) * speed;
      y += (dy / dist) * speed;

      if (chaos) {
        x += Math.sin(Date.now() / 200) * 1.5;
        y += Math.cos(Date.now() / 250) * 1.5;
        if (Math.random() < 0.02) {
          x += (Math.random() - 0.5) * 20;
          y += (Math.random() - 0.5) * 20;
        }
      }

      walter.style.left = x + "px";
      walter.style.top = y + "px";
      walter.style.transform = `rotate(${Math.sin(x / 20) * 10}deg)`;

      if (chaos && Math.random() < 0.01) leaveFootprint(x, y);
    }

    note.style.left = (x + 40) + "px";
    note.style.top = (y - 30) + "px";

    if (walter) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function leaveFootprint(x, y) {
  const fp = document.createElement("div");
  fp.className = "footprint";
  fp.style.left = (x + 30) + "px";
  fp.style.top = (y + 60) + "px";
  document.body.appendChild(fp);
  setTimeout(() => fp.remove(), 4000);
}

// Cursor stealing
document.addEventListener("mousemove", e => {
  if (chaos && Math.random() < 0.002 && walter) {
    walter.style.left = e.pageX + "px";
    walter.style.top = e.pageY + "px";
    honk.play();
  }
});

document.addEventListener("touchmove", e => {
  if (chaos && Math.random() < 0.01 && walter) {
    const touch = e.touches[0];
    walter.style.left = touch.pageX + "px";
    walter.style.top = touch.pageY + "px";
    honk.play();
  }
});

function randomHonks() {
  if (chaos) {
    if (Math.random() < 0.5) honk.play();
    const delay = 3000 + Math.random() * 3000;
    setTimeout(randomHonks, delay);
  }
}

// Toggle chaos
toggle.addEventListener("click", () => {
  chaos = !chaos;
  toggle.innerText = chaos ? "🪦" : "🦆";

  if (chaos && !walter) {
    spawnWalter();
    randomHonks();
  } else if (!chaos && walter) {
    walter.remove();
    note.remove();
    walter = null;
    note = null;
  }
});

// Rage mode
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r" && chaos && walter) {
    honk.play();
    walter.style.left = Math.random() * document.documentElement.scrollWidth + "px";
    walter.style.top = Math.random() * document.documentElement.scrollHeight + "px";
  }
});