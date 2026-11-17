import { GameCategory } from '../types/sg';

export const HERO_ARCADE_IMAGE = '/src/assets/images/sg_hero_arcade_1794854707532.jpg';

export const CATEGORY_FILTERS: Array<'Todos' | GameCategory> = [
  'Todos',
  'Acción',
  'Arcade',
  'Aventura',
  'Estrategia',
  'Puzles',
  'Otros',
];

export const COVER_ACCENTS = [
  '#F59E0B',
  '#10B981',
  '#38BDF8',
  '#F43F5E',
  '#A78BFA',
  '#FB923C',
];

export const STARTER_HTML5_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mi Juego HTML5</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0b111c;
      color: #f8fafc;
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
    }
    canvas {
      border: 2px solid #f59e0b;
      border-radius: 12px;
      background: #131a26;
      max-width: 95vw;
      max-height: 82vh;
      cursor: pointer;
    }
    p { margin-top: 10px; font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <canvas id="game" width="640" height="360"></canvas>
  <p>Haz clic sobre el objetivo dorado para sumar puntos</p>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let target = { x: 320, y: 180, r: 24, vx: 2.8, vy: 2.1 };

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (Math.hypot(x - target.x, y - target.y) <= target.r + 8) {
        score += 10;
        target.vx *= 1.05;
        target.vy *= 1.05;
      }
    });

    function loop() {
      target.x += target.vx;
      target.y += target.vy;
      if (target.x < target.r || target.x > canvas.width - target.r) target.vx *= -1;
      if (target.y < target.r || target.y > canvas.height - target.r) target.vy *= -1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('Puntos: ' + score, 16, 30);
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;
