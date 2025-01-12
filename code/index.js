const { ipcRenderer } = require('electron');
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let snowflakes = [];
let numberOfSnowflakes = 100;

function createSnowflake() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 3 + 2,
    speedY: Math.random() * 1 + 0.5,
    speedX: (Math.random() - 0.5) * 0.5,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05
  };
}

function initializeSnowflakes(count) {
  snowflakes = [];
  for (let i = 0; i < count; i++) {
    snowflakes.push(createSnowflake());
  }
}

initializeSnowflakes(numberOfSnowflakes);

function drawSnowflake(snowflake) {
  ctx.save();
  ctx.translate(snowflake.x, snowflake.y);
  ctx.rotate(snowflake.rotation);
  ctx.beginPath();
  ctx.arc(0, 0, snowflake.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

function updateSnowflakes() {
  for (let i = 0; i < snowflakes.length; i++) {
    snowflakes[i].y += snowflakes[i].speedY;
    snowflakes[i].x += snowflakes[i].speedX;
    snowflakes[i].rotation += snowflakes[i].rotationSpeed;

    if (snowflakes[i].y > canvas.height) {
      snowflakes[i].y = 0;
      snowflakes[i].x = Math.random() * canvas.width;
    }

    if (snowflakes[i].x > canvas.width || snowflakes[i].x < 0) {
      snowflakes[i].x = Math.random() * canvas.width;
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snowflakes.length; i++) {
    drawSnowflake(snowflakes[i]);
  }

  updateSnowflakes();

  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

ipcRenderer.on('update-snowflake-count', (event, count) => {
  numberOfSnowflakes = count;
  initializeSnowflakes(numberOfSnowflakes);
});