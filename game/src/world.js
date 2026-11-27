// World model for Turkey Run: levels, the farmer's AI, hazards, pickups.
// One job: hold the mutable game state and advance it one step at a time.
// Rendering lives in render.js; this file never touches the canvas.
//
// Farmer AI states:
//   patrol — wanders the yard;   chase — runs at the turkey;
//   search — prowls the last place he saw the turkey;
//   corner — cuts ahead of the turkey to block the gate.

import {
  VIEW_W, GROUND_TOP, GROUND_BOTTOM, GATE_X, TURKEY_SPEED,
  TURKEY_RADIUS, FARMER_RADIUS, MAX_LIVES, CORN_POINTS,
  STAGE_CLEAR_POINTS, BOOST_SECONDS, SPOT_RANGE, CATCH_RANGE, STAGES,
} from './config.js';

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

// Tiny deterministic RNG so screenshot poses can be reproduced exactly.
export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function createWorld() {
  const world = {
    stageIndex: 0,
    score: 0,
    lives: MAX_LIVES,
    state: 'title', // title | playing | caught | escaped
    turkey: null,
    farmer: null,
    knives: [],
    oven: null,
    corns: [],
    pumpkins: [],
    haystacks: [],
    gate: { x: GATE_X, y: 400 },
    message: '',
    messageTimer: 0,
    spottedFlash: 0,
    shake: 0,
    grace: 0, // seconds after a stage starts during which the farmer cannot spot the turkey
    elapsed: 0,
    events: [], // one-frame event names for main.js to turn into sounds/HUD
  };

  function buildStage(index, rng) {
    const def = STAGES[index];
    world.stageIndex = index;
    world.turkey = { x: 90, y: 430, z: 0, vz: 0, dir: 1, hidden: false, invulnerable: 0, boost: 0 };
    world.farmer = {
      x: 640, y: 300, dir: -1, mode: 'patrol', patrolTarget: { x: 640, y: 300 },
      lastSeen: null, searchTimer: 0, spotted: false, pause: 0,
    };
    world.knives = [];
    for (let i = 0; i < def.knives; i++) {
      world.knives.push({
        x: 300 + i * 260 + rng() * 80,
        y: 300 + i * 90,
        dir: i % 2 === 0 ? 1 : -1,
        speed: 120 + index * 35 + i * 25,
        sweepMin: 220, sweepMax: 780,
      });
    }
    world.oven = def.oven
      ? { x: 690, y: 470, w: 120, h: 76 }
      : null;
    world.corns = [];
    for (let i = 0; i < def.corn; i++) {
      world.corns.push({
        x: 180 + rng() * 660, y: GROUND_TOP + 30 + rng() * (GROUND_BOTTOM - GROUND_TOP - 60),
        taken: false, bob: rng() * 6.28,
      });
    }
    world.pumpkins = [];
    for (let i = 0; i < def.pumpkins; i++) {
      world.pumpkins.push({
        x: 260 + rng() * 560, y: GROUND_TOP + 40 + rng() * (GROUND_BOTTOM - GROUND_TOP - 80),
        taken: false,
      });
    }
    world.haystacks = [];
    const hayX = [250, 480, 720];
    for (let i = 0; i < def.haystacks; i++) {
      world.haystacks.push({ x: hayX[i], y: 300 + (i % 2) * 170, r: 52 });
    }
    world.message = def.intro;
    world.messageTimer = 3.2;
    world.spottedFlash = 0;
    world.grace = 2.5; // let the player get moving before the farmer can spot them
  }

  world.startRun = (rng = Math.random) => {
    world.score = 0;
    world.lives = MAX_LIVES;
    world.elapsed = 0;
    buildStage(0, rng);
    world.state = 'playing';
  };

  world.nextStage = (rng = Math.random) => {
    world.score += STAGE_CLEAR_POINTS;
    world.events.push('stageClear');
    if (world.stageIndex + 1 >= STAGES.length) {
      world.state = 'escaped';
      world.events.push('win');
      return;
    }
    buildStage(world.stageIndex + 1, rng);
  };

  function loseLife(reason) {
    if (world.turkey.invulnerable > 0) return;
    world.lives -= 1;
    world.events.push('hurt');
    world.shake = 0.35;
    if (world.lives <= 0) {
      world.state = 'caught';
      world.events.push('caught');
      return;
    }
    // Knocked back to the start of the stage, farmer sent back to patrol.
    world.turkey.x = 90;
    world.turkey.y = 430;
    world.turkey.z = 0;
    world.turkey.vz = 0;
    world.turkey.invulnerable = 2.5;
    world.turkey.hidden = false;
    world.farmer.x = 640;
    world.farmer.y = 300;
    world.farmer.mode = 'patrol';
    world.grace = 2.5;
    world.farmer.lastSeen = null;
    world.message = reason === 'farmer'
      ? 'Caught by the farmer! One life lost — run!'
      : 'Ouch! That hurt — one life lost.';
    world.messageTimer = 2.5;
  }

  function farmerSeesTurkey() {
    const t = world.turkey;
    const f = world.farmer;
    if (t.hidden) return false;
    return dist(f.x, f.y, t.x, t.y) < SPOT_RANGE;
  }

  function updateFarmer(dt) {
    const f = world.farmer;
    const t = world.turkey;
    const def = STAGES[world.stageIndex];
    // During the opening grace the farmer patrols and cannot spot the turkey.
    const seen = world.grace > 0 ? false : farmerSeesTurkey();

    if (seen) {
      f.lastSeen = { x: t.x, y: t.y };
      if (f.mode !== 'chase') {
        f.mode = 'chase';
        world.events.push('spotted');
        world.spottedFlash = 0.6;
      }
      f.spotted = true;
    } else {
      f.spotted = false;
      if (f.mode === 'chase') {
        // Lost sight: search where he last saw the turkey.
        f.mode = 'search';
        f.searchTimer = 3.5;
      }
    }

    let target = null;
    let speed = def.farmerPatrolSpeed;
    if (f.mode === 'chase') {
      // Corner: aim ahead of the turkey, between it and the gate.
      const aheadX = t.x + t.dir * 70;
      const cutX = Math.max(aheadX, (t.x + GATE_X) / 2);
      target = { x: f.x < t.x ? cutX : t.x, y: t.y };
      speed = def.farmerSpeed;
      // Give up the chase if the turkey stays hidden or far away.
      if (!seen && f.lastSeen && dist(f.x, f.y, f.lastSeen.x, f.lastSeen.y) < 30) {
        f.mode = 'search';
        f.searchTimer = 3;
      }
    } else if (f.mode === 'search') {
      target = f.lastSeen || f.patrolTarget;
      speed = def.farmerPatrolSpeed * 1.5;
      f.searchTimer -= dt;
      if (f.searchTimer <= 0) {
        f.mode = 'patrol';
        f.patrolTarget = { x: 300 + Math.random() * 400, y: GROUND_TOP + 40 + Math.random() * 200 };
      }
    } else {
      target = f.patrolTarget;
      if (dist(f.x, f.y, target.x, target.y) < 24) {
        f.pause -= dt;
        if (f.pause <= 0) {
          f.patrolTarget = { x: 220 + Math.random() * 480, y: GROUND_TOP + 40 + Math.random() * 220 };
          f.pause = 1.2 + Math.random() * 1.6;
        }
      }
    }

    if (target) {
      const dx = target.x - f.x;
      const dy = target.y - f.y;
      const d = Math.hypot(dx, dy);
      if (d > 4) {
        f.x += (dx / d) * speed * dt;
        f.y += (dy / d) * speed * dt;
        f.dir = dx >= 0 ? 1 : -1;
      }
    }
    f.x = clamp(f.x, 60, VIEW_W - 60);
    f.y = clamp(f.y, GROUND_TOP, GROUND_BOTTOM);
  }

  world.update = (dt, move, wantJump) => {
    if (world.state !== 'playing') return;
    world.elapsed += dt;
    const t = world.turkey;
    const def = STAGES[world.stageIndex];

    // --- turkey movement ---
    const speed = TURKEY_SPEED * (t.boost > 0 ? 1.45 : 1);
    t.x = clamp(t.x + move.x * speed * dt, 40, VIEW_W - 40);
    t.y = clamp(t.y + move.y * speed * dt * 0.85, GROUND_TOP, GROUND_BOTTOM);
    if (move.x !== 0) t.dir = move.x > 0 ? 1 : -1;
    if (t.boost > 0) t.boost -= dt;
    if (t.invulnerable > 0) t.invulnerable -= dt;

    // --- jumping (simple hop: z rises, then falls back) ---
    if (wantJump && t.z === 0) {
      t.vz = 430;
      world.events.push('jump');
    }
    if (t.z > 0 || t.vz > 0) {
      t.z += t.vz * dt;
      t.vz -= 1250 * dt;
      if (t.z <= 0) { t.z = 0; t.vz = 0; }
    }

    // --- hiding: standing inside a haystack ducks the turkey out of sight ---
    t.hidden = world.haystacks.some((h) => dist(t.x, t.y, h.x, h.y) < h.r * 0.7);

    // --- opening grace counts down, then the farmer may spot the turkey ---
    if (world.grace > 0) world.grace -= dt;

    // --- farmer ---
    updateFarmer(dt);

    // --- knives sweep back and forth ---
    for (const k of world.knives) {
      k.x += k.dir * k.speed * dt;
      if (k.x > k.sweepMax) { k.x = k.sweepMax; k.dir = -1; }
      if (k.x < k.sweepMin) { k.x = k.sweepMin; k.dir = 1; }
    }

    // --- pickups ---
    for (const c of world.corns) {
      if (!c.taken && dist(t.x, t.y, c.x, c.y) < TURKEY_RADIUS + 18) {
        c.taken = true;
        world.score += CORN_POINTS;
        world.events.push('pickup');
      }
    }
    for (const p of world.pumpkins) {
      if (!p.taken && dist(t.x, t.y, p.x, p.y) < TURKEY_RADIUS + 20) {
        p.taken = true;
        t.boost = BOOST_SECONDS;
        world.score += 50;
        world.events.push('boost');
      }
    }

    // --- hazards: knives only bite a turkey on the ground ---
    for (const k of world.knives) {
      if (t.z < 26 && Math.abs(t.y - k.y) < 26 && Math.abs(t.x - k.x) < 42) {
        loseLife('knife');
        if (world.state !== 'playing') return;
        break;
      }
    }
    // --- the oven (kitchen stage) ---
    if (world.oven) {
      const o = world.oven;
      if (t.z < 20 && t.x > o.x - 10 && t.x < o.x + o.w + 10 && t.y > o.y - 14 && t.y < o.y + o.h) {
        loseLife('oven');
        if (world.state !== 'playing') return;
      }
    }

    // --- caught by the farmer ---
    if (t.invulnerable <= 0 && !t.hidden && dist(t.x, t.y, world.farmer.x, world.farmer.y) < CATCH_RANGE) {
      loseLife('farmer');
      if (world.state !== 'playing') return;
    }

    // --- reaching the gate advances (or escapes) ---
    if (t.x >= GATE_X - 12 && t.y > 330 && t.y < 520) {
      world.nextStage();
    }

    if (world.messageTimer > 0) world.messageTimer -= dt;
    if (world.spottedFlash > 0) world.spottedFlash -= dt;
    if (world.shake > 0) world.shake -= dt;
  };

  world.progress = () => {
    // 0..1 across the whole escape: stage share + x progress inside it.
    const stageShare = world.stageIndex / STAGES.length;
    const inside = clamp((world.turkey.x - 90) / (GATE_X - 90), 0, 1) / STAGES.length;
    return clamp(stageShare + inside, 0, 1);
  };

  world.stageName = () => STAGES[world.stageIndex].name;

  // Deterministic posed scenes for screenshots (real renders of this code).
  world.poseForShot = (kind) => {
    const rng = makeRng(kind === 'kitchen' ? 7 : kind === 'caught' ? 21 : 42);
    if (kind === 'title') {
      world.state = 'title';
      buildStage(0, rng);
      world.turkey.x = 90; world.turkey.y = 440;
      world.farmer.x = 560; world.farmer.y = 380; world.farmer.mode = 'patrol';
      return;
    }
    if (kind === 'kitchen') {
      buildStage(2, rng);
      world.state = 'playing';
      world.score = 1450;
      world.lives = 2;
      world.turkey.x = 520; world.turkey.y = 430; world.turkey.boost = 2;
      world.farmer.x = 380; world.farmer.y = 400; world.farmer.mode = 'chase';
      world.farmer.lastSeen = { x: 520, y: 430 };
      world.farmer.spotted = true;
      world.spottedFlash = 0.5;
      world.message = 'Stage 3 — the kitchen. The oven is hot, the knives are close. Escape!';
      world.messageTimer = 3;
      return;
    }
    if (kind === 'caught') {
      buildStage(1, rng);
      world.state = 'caught';
      world.score = 1150;
      world.lives = 0;
      world.turkey.x = 480; world.turkey.y = 420;
      world.farmer.x = 505; world.farmer.y = 415; world.farmer.mode = 'chase';
      return;
    }
    if (kind === 'escaped') {
      buildStage(2, rng);
      world.state = 'escaped';
      world.score = 2850;
      world.lives = 2;
      world.turkey.x = 880; world.turkey.y = 420;
      world.farmer.x = 640; world.farmer.y = 400; world.farmer.mode = 'search';
      return;
    }
    // default: 'play' — mid-chase in the farmyard, HUD complete.
    buildStage(0, rng);
    world.state = 'playing';
    world.score = 650;
    world.lives = 3;
    world.turkey.x = 430; world.turkey.y = 430; world.turkey.dir = 1;
    world.farmer.x = 300; world.farmer.y = 405; world.farmer.mode = 'chase';
    world.farmer.lastSeen = { x: 430, y: 430 };
    world.farmer.spotted = true;
    world.spottedFlash = 0.5;
    world.corns[0].taken = true;
    world.message = 'Spotted! Run for the gate!';
    world.messageTimer = 2.5;
  };

  buildStage(0, Math.random);
  return world;
}
