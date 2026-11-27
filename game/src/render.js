// Hand-drawn canvas art for Turkey Run — all original, no image files.
// One job: turn the world state into a picture. Every character, prop
// and backdrop is drawn from shapes here, in a warm autumn palette.

import { VIEW_W, VIEW_H, GROUND_TOP, GROUND_BOTTOM, GATE_X, STAGES } from './config.js';

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSky(ctx, stage) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, stage.sky[0]);
  g.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // low autumn sun
  ctx.fillStyle = '#fff2b0';
  circle(ctx, 830, 90, 42);
  ctx.fillStyle = '#ffe27a';
  circle(ctx, 830, 90, 30);
  // drifting clouds
  ctx.fillStyle = 'rgba(255, 248, 230, 0.85)';
  ellipse(ctx, 170, 80, 62, 18);
  ellipse(ctx, 210, 68, 44, 16);
  ellipse(ctx, 470, 120, 52, 15);
}

function drawFarmyard(ctx, stageIndex) {
  // distant barn and fence
  ctx.fillStyle = '#a34a28';
  ctx.fillRect(60, 150, 130, 110);
  ctx.fillStyle = '#7e3519';
  ctx.beginPath();
  ctx.moveTo(45, 152); ctx.lineTo(125, 105); ctx.lineTo(205, 152); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a2c14';
  ctx.fillRect(108, 190, 34, 70);
  ctx.strokeStyle = '#5a2c14';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(108, 190); ctx.lineTo(142, 260); ctx.moveTo(142, 190); ctx.lineTo(108, 260);
  ctx.stroke();
  // trees
  for (const [tx, ty, s] of [[880, 190, 1], [330, 165, 0.8], [700, 150, 0.7]]) {
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(tx - 6 * s, ty, 12 * s, 55 * s);
    ctx.fillStyle = stageIndex === 2 ? '#c96a2e' : '#d98a2e';
    circle(ctx, tx, ty - 18 * s, 34 * s);
    ctx.fillStyle = '#e8a33d';
    circle(ctx, tx - 18 * s, ty, 22 * s);
    circle(ctx, tx + 20 * s, ty + 2 * s, 20 * s);
  }
  // fence along the back of the yard
  ctx.strokeStyle = '#8a5a2e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 238); ctx.lineTo(VIEW_W, 238);
  ctx.moveTo(0, 258); ctx.lineTo(VIEW_W, 258);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2e';
  for (let x = 20; x < VIEW_W; x += 70) ctx.fillRect(x, 226, 8, 44);
  // ground: dry grass with fallen leaves
  const g = ctx.createLinearGradient(0, GROUND_TOP, 0, VIEW_H);
  g.addColorStop(0, '#c98d4a');
  g.addColorStop(1, '#a86a2e');
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_TOP, VIEW_W, VIEW_H - GROUND_TOP);
  ctx.fillStyle = '#8a5a2e';
  for (let i = 0; i < 26; i++) {
    const lx = (i * 137) % VIEW_W;
    const ly = GROUND_TOP + 30 + ((i * 89) % 300);
    ellipse(ctx, lx, ly, 7, 3);
  }
}

function drawKitchen(ctx) {
  // tiled wall, big table, hanging pans, and the oven's warm glow
  ctx.fillStyle = '#e8d5b5';
  ctx.fillRect(0, 0, VIEW_W, GROUND_TOP);
  ctx.strokeStyle = '#d3b48c';
  ctx.lineWidth = 2;
  for (let x = 0; x < VIEW_W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GROUND_TOP); ctx.stroke(); }
  for (let y = 0; y < GROUND_TOP; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y); ctx.stroke(); }
  // window with autumn light
  ctx.fillStyle = '#f7c873';
  ctx.fillRect(380, 40, 200, 130);
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 6;
  ctx.strokeRect(380, 40, 200, 130);
  ctx.beginPath(); ctx.moveTo(480, 40); ctx.lineTo(480, 170); ctx.moveTo(380, 105); ctx.lineTo(580, 105); ctx.stroke();
  // hanging pans
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 4;
  for (const px of [120, 210, 700, 790]) {
    ctx.beginPath(); ctx.moveTo(px, 20); ctx.lineTo(px, 55); ctx.stroke();
    ctx.fillStyle = '#4a4a4a';
    circle(ctx, px, 78, 26);
    ctx.fillStyle = '#6e6e6e';
    circle(ctx, px, 78, 18);
  }
  // floor: checker tiles
  for (let ty = 0; ty < 6; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? '#b98d5f' : '#a1764a';
      ctx.fillRect(tx * 60, GROUND_TOP + ty * 60, 60, 60);
    }
  }
  // work table on the left
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(30, 330, 220, 26);
  ctx.fillRect(44, 356, 14, 120);
  ctx.fillRect(222, 356, 14, 120);
  ctx.fillStyle = '#e8a33d';
  ellipse(ctx, 140, 322, 42, 12); // a pie, waiting
  ctx.fillStyle = '#c96a2e';
  ellipse(ctx, 140, 318, 30, 8);
}

function drawGate(ctx, world) {
  const gy = 425;
  const pulse = 0.75 + 0.25 * Math.sin(world.elapsed * 4);
  ctx.save();
  ctx.globalAlpha = 0.35 * pulse;
  ctx.fillStyle = '#ffe27a';
  ctx.fillRect(GATE_X - 6, 300, 56, 230);
  ctx.restore();
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(GATE_X - 4, 300, 8, 230);
  ctx.fillRect(GATE_X + 42, 300, 8, 230);
  ctx.fillStyle = '#5a3a1e';
  ctx.beginPath();
  ctx.moveTo(GATE_X - 4, 300); ctx.lineTo(GATE_X + 23, 262); ctx.lineTo(GATE_X + 50, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESCAPE', GATE_X + 23, 556);
  ctx.textAlign = 'left';
}

function drawHaystack(ctx, h, world) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(h.x - h.r, h.y + 26);
  ctx.quadraticCurveTo(h.x - h.r * 0.8, h.y - h.r, h.x, h.y - h.r - 8);
  ctx.quadraticCurveTo(h.x + h.r * 0.8, h.y - h.r, h.x + h.r, h.y + 26);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a67c2e';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(h.x + i * 14, h.y - h.r + 12);
    ctx.lineTo(h.x + i * 10, h.y + 20);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a5a2e';
  ctx.font = '11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HIDE', h.x, h.y + 42);
  ctx.textAlign = 'left';
}

function drawCorn(ctx, c, world) {
  const bob = Math.sin(world.elapsed * 3 + c.bob) * 3;
  const x = c.x;
  const y = c.y - 14 + bob;
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 16); ctx.quadraticCurveTo(x - 26, y - 6, x - 8, y - 12);
  ctx.lineTo(x - 2, y + 12); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 16); ctx.quadraticCurveTo(x + 26, y - 6, x + 8, y - 12);
  ctx.lineTo(x + 2, y + 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd23e';
  ellipse(ctx, x, y, 9, 18);
  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(x + i * 5, y - 14); ctx.lineTo(x + i * 5, y + 14); ctx.stroke();
  }
}

function drawPumpkin(ctx, p, world) {
  const bob = Math.sin(world.elapsed * 2.5 + p.x) * 2;
  const x = p.x;
  const y = p.y + bob;
  ctx.fillStyle = '#e86a1e';
  ellipse(ctx, x, y, 22, 18);
  ctx.fillStyle = '#f07f2e';
  ellipse(ctx, x - 8, y, 9, 16);
  ellipse(ctx, x + 8, y, 9, 16);
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(x - 3, y - 24, 6, 10);
  ctx.fillStyle = '#3a2412';
  circle(ctx, x - 7, y - 4, 2.5);
  circle(ctx, x + 7, y - 4, 2.5);
  ctx.beginPath();
  ctx.arc(x, y + 2, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function drawKnife(ctx, k) {
  ctx.save();
  ctx.translate(k.x, k.y);
  ctx.rotate(k.dir > 0 ? 0.12 : Math.PI - 0.12);
  // blade
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath();
  ctx.moveTo(-34, -7); ctx.lineTo(18, -7); ctx.lineTo(34, 0); ctx.lineTo(18, 7); ctx.lineTo(-34, 7);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#9aa5ab';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // handle
  ctx.fillStyle = '#5a2c14';
  ctx.fillRect(-52, -7, 20, 14);
  ctx.fillStyle = '#c9a227';
  circle(ctx, -30, 0, 3);
  ctx.restore();
  // danger shadow on the ground
  ctx.fillStyle = 'rgba(180, 30, 30, 0.18)';
  ellipse(ctx, k.x, k.y + 26, 46, 8);
}

function drawOven(ctx, o, world) {
  const glow = 0.5 + 0.3 * Math.sin(world.elapsed * 5);
  ctx.save();
  ctx.globalAlpha = glow * 0.5;
  ctx.fillStyle = '#ff7a1e';
  ellipse(ctx, o.x + o.w / 2, o.y + o.h, o.w, 26);
  ctx.restore();
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.fillStyle = '#ff9a3d';
  ctx.fillRect(o.x + 14, o.y + 16, o.w - 28, o.h - 30);
  ctx.fillStyle = '#7a1e00';
  ctx.fillRect(o.x + 14, o.y + 16, o.w - 28, 10);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;
  ctx.strokeRect(o.x + 14, o.y + 16, o.w - 28, o.h - 30);
  ctx.fillStyle = '#fff3d0';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT OVEN!', o.x + o.w / 2, o.y - 8);
  ctx.textAlign = 'left';
}

// The turkey: brown body, fanned tail, red wattle, worried eye.
function drawTurkey(ctx, t, world) {
  const x = t.x;
  const groundY = t.y;
  const y = groundY - t.z;
  const scale = 0.9 + (t.y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP) * 0.25;
  const bob = t.z === 0 && world.state === 'playing' ? Math.sin(world.elapsed * 10) * 2 : 0;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(t.dir * scale, scale);
  if (t.invulnerable > 0 && Math.floor(world.elapsed * 10) % 2 === 0) ctx.globalAlpha = 0.45;
  if (t.hidden) ctx.globalAlpha = 0.55;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ellipse(ctx, 0, t.z + 34, 26, 7);
  // tail fan
  ctx.fillStyle = '#8a5a2e';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ellipse(ctx, -26, -14, 7, 24);
    ctx.restore();
  }
  ctx.fillStyle = '#c97b2d';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ellipse(ctx, -26, -14, 4, 18);
    ctx.restore();
  }
  // body
  ctx.fillStyle = '#6e4520';
  ellipse(ctx, 0, 0, 26, 30);
  ctx.fillStyle = '#8a5a2e';
  ellipse(ctx, 0, 4, 20, 22);
  // wing
  ctx.fillStyle = '#5a3517';
  ellipse(ctx, -2, 2, 13, 18);
  // neck and head
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(16, -42, 10, 26);
  ctx.fillStyle = '#a86a2e';
  circle(ctx, 22, -48, 13);
  // beak
  ctx.fillStyle = '#e8a33d';
  ctx.beginPath();
  ctx.moveTo(32, -50); ctx.lineTo(44, -45); ctx.lineTo(32, -41);
  ctx.closePath(); ctx.fill();
  // wattle
  ctx.fillStyle = '#d43d2a';
  ellipse(ctx, 28, -38, 4, 8);
  // eye: wide and worried
  ctx.fillStyle = '#fff';
  circle(ctx, 25, -52, 4.5);
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, 26, -52, 2.2);
  // legs
  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, 28); ctx.lineTo(-6, 36 + t.z * 0);
  ctx.moveTo(8, 28); ctx.lineTo(8, 36);
  ctx.stroke();
  ctx.restore();
}

// The farmer: overalls, straw hat, red shirt, determined stride.
function drawFarmer(ctx, f, world) {
  const x = f.x;
  const y = f.y;
  const scale = 0.95 + (f.y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP) * 0.3;
  const stride = f.mode === 'chase' ? Math.sin(world.elapsed * 14) * 6 : Math.sin(world.elapsed * 6) * 3;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(f.dir * scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ellipse(ctx, 0, 40, 30, 8);
  // legs (overalls)
  ctx.fillStyle = '#2e4a7a';
  ctx.fillRect(-12, 8 + stride * 0.4, 9, 30);
  ctx.fillRect(4, 8 - stride * 0.4, 9, 30);
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(-13, 36 + stride * 0.4, 12, 5);
  ctx.fillRect(3, 36 - stride * 0.4, 12, 5);
  // body: red shirt + overalls
  ctx.fillStyle = '#c0392b';
  ellipse(ctx, 0, -8, 20, 24);
  ctx.fillStyle = '#2e4a7a';
  ctx.fillRect(-14, -18, 28, 26);
  ctx.fillStyle = '#ffd23e';
  circle(ctx, -8, -12, 2.5);
  circle(ctx, 8, -12, 2.5);
  // arms reaching forward
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(10, -16); ctx.lineTo(30, -6 + stride);
  ctx.moveTo(-10, -16); ctx.lineTo(-26, -2 - stride);
  ctx.stroke();
  // head + straw hat
  ctx.fillStyle = '#f0c08a';
  circle(ctx, 4, -42, 13);
  ctx.fillStyle = '#e8c95a';
  ellipse(ctx, 4, -50, 24, 6);
  ctx.fillStyle = '#d9b441';
  ctx.beginPath();
  ctx.arc(4, -50, 13, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#7a3b12';
  ctx.fillRect(-9, -52, 26, 4);
  // angry eyes + moustache
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, 10, -44, 2);
  circle(ctx, 18, -44, 2);
  ctx.strokeStyle = '#5a3a1e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(6, -34); ctx.lineTo(20, -34);
  ctx.stroke();
  ctx.restore();

  // spotted mark: a big red "!" while he is on the chase
  if (f.spotted || f.mode === 'chase') {
    ctx.save();
    ctx.translate(f.x, f.y - 78 * scale);
    const pop = 1 + 0.12 * Math.sin(world.elapsed * 8);
    ctx.scale(pop, pop);
    ctx.fillStyle = '#d43d2a';
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 1);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.restore();
  }
  // searching "?" while he prowls the last-seen spot
  if (f.mode === 'search') {
    ctx.save();
    ctx.translate(f.x, f.y - 78 * scale);
    ctx.fillStyle = '#e8a33d';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#4a2408';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 1);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.restore();
  }
}

export function drawScene(ctx, world) {
  const stage = STAGES[world.stageIndex];
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 10 * world.shake, (Math.random() - 0.5) * 10 * world.shake);
  }
  if (world.stageIndex === 2) {
    drawKitchen(ctx);
  } else {
    drawSky(ctx, stage);
    drawFarmyard(ctx, world.stageIndex);
  }
  drawGate(ctx, world);
  for (const h of world.haystacks) drawHaystack(ctx, h, world);
  for (const c of world.corns) if (!c.taken) drawCorn(ctx, c, world);
  for (const p of world.pumpkins) if (!p.taken) drawPumpkin(ctx, p, world);
  if (world.oven) drawOven(ctx, world.oven, world);
  // depth sort: farmer and turkey by y
  const t = world.turkey;
  const f = world.farmer;
  if (f.y < t.y) { drawFarmer(ctx, f, world); drawTurkey(ctx, t, world); }
  else { drawTurkey(ctx, t, world); drawFarmer(ctx, f, world); }
  for (const k of world.knives) drawKnife(ctx, k);

  // spotted red flash at the screen edges
  if (world.spottedFlash > 0) {
    const a = Math.min(0.35, world.spottedFlash * 0.5);
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.35, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.75);
    g.addColorStop(0, 'rgba(212,61,42,0)');
    g.addColorStop(1, `rgba(212,61,42,${a})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  // stage message banner
  if (world.messageTimer > 0 && world.message) {
    ctx.fillStyle = 'rgba(43,29,18,0.82)';
    ctx.fillRect(180, 12, 600, 36);
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.message, VIEW_W / 2, 36);
    ctx.textAlign = 'left';
  }

  // "HIDDEN" tag while tucked in a haystack
  if (t.hidden && world.state === 'playing') {
    ctx.fillStyle = '#7ec850';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN — he cannot see you', t.x, t.y - 84 - t.z);
    ctx.textAlign = 'left';
  }
  ctx.restore();
}
