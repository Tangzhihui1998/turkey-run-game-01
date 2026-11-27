// Turkey Run — hand-in program (Node 22, standard library only).
//
// It copies the static game in game/ and the screenshots in screenshots/
// next to this file into the output directory, then writes the dossier
// (dossier.json) that the judge reads, using the vendored make.fun
// library. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The run is deterministic: the same repository always produces the same
// bytes in the output directory.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Empty the output directory's contents without removing the directory
// itself: in the grader /output is a mounted volume, and removing the
// mount point fails (rmdir EBUSY) — that failed the round-1 grade run
// (run_completes, exit 1). Clearing contents keeps the same guarantee
// (no stale file leaks in) on a mount point and on a plain directory.
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}
for (const name of readdirSync(outputDir)) {
  rmSync(join(outputDir, name), { recursive: true, force: true });
}

const gameSource = join(repoRoot, 'game');
const shotsSource = join(repoRoot, 'screenshots');
const gameTarget = join(outputDir, 'game');
const shotsTarget = join(outputDir, 'screenshots');

cpSync(gameSource, gameTarget, { recursive: true });
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

// Fail loudly instead of handing in a thin entry: the gate wants 3–4
// screenshots, so refuse to write a dossier without them.
const shotFiles = readdirSync(shotsTarget).filter((name) => !name.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`expected 3-4 screenshots, found ${shotFiles.length}`);
}

// Caps mirror the gate: text budget shapes the dossier bytes, the rest
// refuse an entry the scorer would refuse (at most 4 screenshots, each
// at most 256 KiB; game/ at most 993 entries and 48 MiB in all).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
