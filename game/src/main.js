// Game loop, screens and HUD for Turkey Run.
// One job: own the state machine (title / playing / caught / escaped),
// run the loop, wire input and sound to the world, and keep the HUD true.
// Screenshot poses come from ?shot=title|play|kitchen|caught|escaped —
// they are real renders of this same code with a posed world.

import { VIEW_W, VIEW_H, MAX_LIVES } from './config.js';
import { createWorld } from './world.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { drawScene } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const titlePanel = document.getElementById('title-panel');
const endPanel = document.getElementById('end-panel');
const endTitle = document.getElementById('end-title');
const endText = document.getElementById('end-text');
const endScore = document.getElementById('end-score');
const hudScore = document.getElementById('hud-score');
const hudStage = document.getElementById('hud-stage');
const hudLives = document.getElementById('hud-lives');
const hudProgress = document.getElementById('hud-progress');
const hudBoost = document.getElementById('hud-boost');

const world = createWorld();
const input = createInput(canvas);
const audio = createAudio();
let shotMode = null;
let endShownFor = null;

function setStatus(text) { statusEl.textContent = text; }

function updateHud() {
  hudScore.textContent = String(world.score);
  hudStage.textContent = `Stage ${world.stageIndex + 1} · ${world.stageName()}`;
  hudLives.textContent = '♥'.repeat(world.lives) + '♡'.repeat(Math.max(0, MAX_LIVES - world.lives));
  hudProgress.style.width = `${Math.round(world.progress() * 100)}%`;
  hudBoost.textContent = world.turkey && world.turkey.boost > 0
    ? `⚡ Boost ${Math.ceil(world.turkey.boost)}s`
    : '';
}

function showTitle() {
  world.state = 'title';
  titlePanel.classList.remove('hidden');
  endPanel.classList.add('hidden');
  endShownFor = null;
  setStatus('Turkey Run title screen. Press Start to play.');
}

function showEnd(escaped) {
  endShownFor = escaped ? 'escaped' : 'caught';
  titlePanel.classList.add('hidden');
  endPanel.classList.remove('hidden');
  endTitle.textContent = escaped ? '🦃 ESCAPED!' : 'Caught!';
  endText.textContent = escaped
    ? 'You made it out of the kitchen and into the woods — Thanksgiving dinner will have to wait until next year. Well run, turkey!'
    : 'The farmer got you... but a turkey never gives up. Shake off those feathers and run again!';
  endScore.textContent = String(world.score);
  setStatus(escaped ? `Escaped! Final score ${world.score}.` : `Caught. Final score ${world.score}.`);
}

function startGame() {
  audio.unlock();
  world.startRun();
  titlePanel.classList.add('hidden');
  endPanel.classList.add('hidden');
  endShownFor = null;
  setStatus('Playing. Reach the gate on the right to escape.');
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('again-btn').addEventListener('click', startGame);
canvas.addEventListener('pointerdown', () => audio.unlock());

function playEventSounds() {
  for (const event of world.events) {
    if (event === 'jump') audio.jump();
    else if (event === 'pickup') audio.pickup();
    else if (event === 'boost') audio.boost();
    else if (event === 'spotted') audio.spotted();
    else if (event === 'hurt') audio.hurt();
    else if (event === 'caught') audio.caught();
    else if (event === 'win') audio.win();
    else if (event === 'stageClear') audio.stageClear();
  }
  world.events.length = 0;
}

function step(dt) {
  if (world.state === 'playing') {
    const move = input.moveVector();
    const jump = input.takeJump();
    input.takeClick(); // clicks already queue a jump in input.js
    world.update(dt, move, jump);
    playEventSounds();
    if (world.state === 'caught' && endShownFor !== 'caught') showEnd(false);
    if (world.state === 'escaped' && endShownFor !== 'escaped') showEnd(true);
  }
  updateHud();
  drawScene(ctx, world);
}

function frame(now) {
  if (shotMode) {
    // Posed screenshot: hold the frame still, no gameplay updates.
    updateHud();
    drawScene(ctx, world);
    requestAnimationFrame(frame);
    return;
  }
  const dt = Math.min(0.05, (now - frame.last) / 1000 || 0.016);
  frame.last = now;
  step(dt);
  requestAnimationFrame(frame);
}
frame.last = 0;

// Screenshot poses, driven by ?shot= — title / play / kitchen / caught / escaped.
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  shotMode = shot;
  world.poseForShot(shot);
  if (shot === 'caught') {
    titlePanel.classList.add('hidden');
    showEnd(false);
  } else if (shot === 'escaped') {
    titlePanel.classList.add('hidden');
    showEnd(true);
  } else if (shot === 'title') {
    titlePanel.classList.remove('hidden');
    endPanel.classList.add('hidden');
  } else {
    titlePanel.classList.add('hidden');
    endPanel.classList.add('hidden');
  }
  updateHud();
  drawScene(ctx, world);
}

if (!shotMode) {
  showTitle();
  // Title screen shows the farmyard behind the panel.
  drawScene(ctx, world);
}
requestAnimationFrame(frame);
