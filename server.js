require('dotenv').config();
const express = require('express');
const path = require('path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

GlobalFonts.registerFromPath(path.join(__dirname, 'assets/fonts/Cinzel.ttf'), 'Cinzel');

const app = express();
const PORT = process.env.PORT || 3000;

const W = 1200;
const H = 480;

const bgPromise = loadImage(path.join(__dirname, 'assets/images/nexus_pirate_sunset_sea_1792409017140.jpg'));
const logoPromise = loadImage(path.join(__dirname, 'assets/images/nexus_rune_logo_1792409017867.jpg'));

function drawCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function spacedText(ctx, text, x, y, spacing) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx - spacing - x;
}

function spacedTextWidth(ctx, text, spacing) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return w - spacing;
}

function fitFont(ctx, text, fontBuilder, maxPx, maxWidth) {
  let size = maxPx;
  while (size > 20) {
    ctx.font = fontBuilder(size);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawBold(ctx, text, x, y, weightBoost = 1.6) {
  ctx.fillText(text, x, y);
  ctx.strokeText(text, x, y);
  void weightBoost;
}

async function renderBanner(username) {
  const [bg, logo] = await Promise.all([bgPromise, logoPromise]);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  drawCover(ctx, bg, 0, 0, W, H);

  const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  topFade.addColorStop(0, 'rgba(0,0,0,0.55)');
  topFade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topFade;
  ctx.fillRect(0, 0, W, H);

  const bottomFade = ctx.createLinearGradient(0, H * 0.35, 0, H);
  bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
  bottomFade.addColorStop(1, 'rgba(0,0,0,0.88)');
  ctx.fillStyle = bottomFade;
  ctx.fillRect(0, 0, W, H);

  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  const cx = 185;
  const cy = H / 2;
  const r = 105;

  const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.1);
  glow.addColorStop(0, 'rgba(249,115,22,0.55)');
  glow.addColorStop(0.5, 'rgba(234,88,12,0.22)');
  glow.addColorStop(1, 'rgba(234,88,12,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCover(ctx, logo, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(251,191,36,0.9)';
  ctx.shadowColor = 'rgba(249,115,22,0.9)';
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const tx = 360;
  const maxTextW = W - tx - 60;

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.fillStyle = '#fbbf24';
  ctx.font = '22px Cinzel';
  const eyebrow = 'BIENVENUE DANS LE';
  const eyebrowW = spacedTextWidth(ctx, eyebrow, 10);
  spacedText(ctx, eyebrow, tx, 128, 10);

  ctx.strokeStyle = 'rgba(251,191,36,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tx + eyebrowW + 20, 120);
  ctx.lineTo(tx + eyebrowW + 90, 120);
  ctx.stroke();

  const nameSize = fitFont(ctx, 'NEURO NEXUS', (s) => `bold ${s}px Cinzel`, 78, maxTextW);
  const nameGrad = ctx.createLinearGradient(tx, 160, tx, 240);
  nameGrad.addColorStop(0, '#ffffff');
  nameGrad.addColorStop(0.55, '#fde68a');
  nameGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = nameGrad;
  ctx.lineWidth = 2;
  ctx.strokeStyle = nameGrad;
  ctx.shadowColor = 'rgba(245,158,11,0.75)';
  ctx.shadowBlur = 30;
  drawBold(ctx, 'NEURO NEXUS', tx, 210);
  ctx.shadowBlur = 0;

  const diamondY = 242;
  ctx.strokeStyle = 'rgba(245,158,11,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tx, diamondY);
  ctx.lineTo(tx + 150, diamondY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tx + 168, diamondY);
  ctx.lineTo(tx + 190, diamondY - 8);
  ctx.lineTo(tx + 208, diamondY);
  ctx.lineTo(tx + 190, diamondY + 8);
  ctx.closePath();
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(tx + 226, diamondY);
  ctx.lineTo(tx + 400, diamondY);
  ctx.stroke();

  const userSize = fitFont(ctx, username, (s) => `bold ${s}px Cinzel`, 46, maxTextW);
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.2;
  ctx.shadowColor = 'rgba(249,115,22,0.6)';
  ctx.shadowBlur = 18;
  drawBold(ctx, username, tx, 310);
  ctx.shadowBlur = 0;
  void userSize;

  ctx.fillStyle = 'rgba(254,243,199,0.92)';
  ctx.font = '24px Cinzel';
  const tagline = "tu as atterri dans le point de convergence de l'univers Neuro...";
  fitFont(ctx, tagline, (s) => `${s}px Cinzel`, 24, maxTextW);
  ctx.fillText(tagline, tx, 355);

  return canvas.encode('png');
}

app.get('/', (req, res) => {
  res.json({ service: 'Neuro Nexus Banner', usage: '/banner?user=NomDuMembre' });
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/banner', async (req, res) => {
  let user = String(req.query.user || '').trim().replace(/^@+/, '');
  if (!user) {
    return res.status(400).json({ error: 'Paramètre "user" manquant : /banner?user=Nom' });
  }
  if (user.length > 32) user = user.slice(0, 32) + '…';
  try {
    const png = await renderBanner(user);
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de rendu' });
  }
});

app.listen(PORT, () => {
  console.log(`Nexus banner service lancé sur le port ${PORT}`);
});
