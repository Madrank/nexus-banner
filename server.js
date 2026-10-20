require('dotenv').config();
const express = require('express');
const path = require('path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath(path.join(__dirname, 'assets/fonts/Cinzel.ttf'), 'Cinzel');

const app = express();
const PORT = process.env.PORT || 3000;

const SIZE = 512;

const logoPromise = loadImage(path.join(__dirname, 'assets/images/nexus_rune_logo_1792409017867.jpg'));
const deckPromise = loadImage(path.join(__dirname, 'assets/images/nexus_pirate_deck_1792409018130.jpg'));

async function loadAvatar(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  try {
    const img = await loadImage(url);
    return img.width > 0 && img.height > 0 ? img : null;
  } catch {
    return null;
  }
}

function drawCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

async function renderAvatar(avatarUrl) {
  const [logo, deck, avatar] = await Promise.all([logoPromise, deckPromise, loadAvatar(avatarUrl)]);
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.save();
  ctx.globalAlpha = 0.35;
  drawCover(ctx, deck, 0, 0, SIZE, SIZE);
  ctx.restore();

  const dark = ctx.createLinearGradient(0, 0, 0, SIZE);
  dark.addColorStop(0, 'rgba(3,7,18,0.75)');
  dark.addColorStop(0.5, 'rgba(3,7,18,0.45)');
  dark.addColorStop(1, 'rgba(3,7,18,0.9)');
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = 175;

  const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.7);
  glow.addColorStop(0, 'rgba(249,115,22,0.5)');
  glow.addColorStop(0.55, 'rgba(234,88,12,0.18)');
  glow.addColorStop(1, 'rgba(234,88,12,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const flame = ctx.createRadialGradient(cx, cy + r + 10, 5, cx, cy + r + 10, 90);
  flame.addColorStop(0, 'rgba(251,146,60,0.55)');
  flame.addColorStop(0.5, 'rgba(245,158,11,0.2)');
  flame.addColorStop(1, 'rgba(245,158,11,0)');
  ctx.fillStyle = flame;
  ctx.fillRect(cx - 100, cy + r - 70, 200, 180);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCover(ctx, avatar || logo, cx - r, cy - r, r * 2, r * 2);

  const innerShade = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
  innerShade.addColorStop(0, 'rgba(0,0,0,0)');
  innerShade.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = innerShade;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.lineWidth = 8;
  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringGrad.addColorStop(0, '#fbbf24');
  ringGrad.addColorStop(0.5, '#f97316');
  ringGrad.addColorStop(1, '#f59e0b');
  ctx.strokeStyle = ringGrad;
  ctx.shadowColor = 'rgba(249,115,22,0.95)';
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(254,243,199,0.7)';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = 'rgba(249,115,22,0.9)';
  ctx.shadowBlur = 16;
  const d = 9;
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    const px = cx + dx * (r + 4);
    const py = cy + dy * (r + 4);
    ctx.beginPath();
    ctx.moveTo(px, py - d);
    ctx.lineTo(px + d, py);
    ctx.lineTo(px, py + d);
    ctx.lineTo(px - d, py);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  return canvas.encode('png');
}

app.get('/', (req, res) => {
  res.json({ service: 'Neuro Nexus Avatar', usage: '/avatar?avatar=URL_AVATAR (optionnel, sceau Nexus par défaut)' });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/avatar', async (req, res) => {
  const avatar = String(req.query.avatar || '').trim();
  try {
    const png = await renderAvatar(avatar);
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de rendu' });
  }
});

app.listen(PORT, () => {
  console.log(`Nexus avatar service lancé sur le port ${PORT}`);
});
