// Stage definitions and tuning for Turkey Run.
// One job: every number the game balances on lives here, so the
// difficulty curve from farmyard to kitchen can be read at a glance.

export const VIEW_W = 960;
export const VIEW_H = 600;
export const GROUND_TOP = 250; // highest walkable y (back of the yard)
export const GROUND_BOTTOM = 545; // lowest walkable y (front of the yard)
export const GATE_X = 905;

export const TURKEY_SPEED = 235;
export const TURKEY_RADIUS = 26;
export const FARMER_RADIUS = 34;
export const MAX_LIVES = 3;
export const CORN_POINTS = 100;
export const STAGE_CLEAR_POINTS = 500;
export const BOOST_SECONDS = 5;
export const SPOT_RANGE = 245;
export const CATCH_RANGE = 44;

export const STAGES = [
  {
    name: 'Farmyard',
    sky: ['#f7c873', '#e89b4d'],
    farmerSpeed: 138,
    farmerPatrolSpeed: 62,
    knives: 1,
    oven: false,
    corn: 6,
    pumpkins: 1,
    haystacks: 3,
    intro: 'Stage 1 — the farmyard. The farmer is out looking for you.',
  },
  {
    name: 'Barn Path',
    sky: ['#f2a95e', '#d97e3f'],
    farmerSpeed: 176,
    farmerPatrolSpeed: 74,
    knives: 2,
    oven: false,
    corn: 6,
    pumpkins: 1,
    haystacks: 3,
    intro: 'Stage 2 — the barn path. He is faster now, and the knives are out.',
  },
  {
    name: 'Kitchen',
    sky: ['#e8c9a0', '#c98d5a'],
    farmerSpeed: 202,
    farmerPatrolSpeed: 86,
    knives: 2,
    oven: true,
    corn: 7,
    pumpkins: 2,
    haystacks: 2,
    intro: 'Stage 3 — the kitchen. The oven is hot, the knives are close. Escape!',
  },
];
