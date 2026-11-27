[![Turkey Run Game](https://img.shields.io/badge/make.fun-turkey--run--game--01-orange)](https://make.fun/bounty/turkey-run-game-01)
[![Rank](https://img.shields.io/badge/rank-pending-lightgrey)](https://make.fun/bounty/turkey-run-game-01)
[![Reward](https://img.shields.io/badge/reward-%24250-gold)](https://make.fun/bounty/turkey-run-game-01)

# Turkey Run — a Thanksgiving escape game

You are a turkey. Thanksgiving dinner is coming, the farmer is on your
trail, and the only way out is through the farmyard, past the barn, and
out of the kitchen. Run, jump, hide, grab corn — and do not get caught.

## How to play

- **Move:** Arrow keys or WASD. **Jump:** Space (or click the mouse).
  Clicking near a haystack also ducks you into hiding.
- **Goal:** reach the glowing gate at the far right of each stage to
  advance. Escape the kitchen (stage 3) to win.
- **The farmer** chases you when he sees you, searches the last place he
  saw you, and cuts you off. A red **!** over his head and a red flash
  mean you have been spotted.
- **Dangers:** the hot oven (stage 3) and sweeping carving knives cost a
  life on touch. You have 3 lives.
- **Pickups:** corn (+100 points), pumpkin (a short speed boost),
  haystacks (hide inside one and the farmer loses your trail).

## Run it

Serve the `game/` folder with any static server and open
`game/index.html` in desktop Chrome — no build step, no network requests:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080/index.html
```

## Files

- `game/index.html` — page, HUD and menus
- `game/src/config.js` — stages, tuning and difficulty curve
- `game/src/input.js` — keyboard and mouse
- `game/src/audio.js` — synthesized WebAudio sound effects
- `game/src/world.js` — levels, farmer AI, hazards and pickups
- `game/src/render.js` — hand-drawn canvas art (turkey, farmer, farm, kitchen)
- `game/src/main.js` — game loop, states and screenshot poses
- `main.ts` — hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json`

All art and sounds are original, drawn and synthesized for this game.

Built for the make.fun turkey-run-game-01 bounty.
