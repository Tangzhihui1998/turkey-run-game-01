// Keyboard and mouse input for Turkey Run.
// One job: turn raw key and pointer events into a small, testable state
// object (move vector, jump request, click position) that main.js reads.

export function createInput(canvas) {
  const keys = new Set();
  const input = {
    jumpQueued: false,
    click: null, // {x, y} in canvas coordinates, consumed by main.js
    pointer: { x: 0, y: 0 },
  };

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
  };

  window.addEventListener('keydown', (event) => {
    if (KEYMAP[event.code]) {
      keys.add(KEYMAP[event.code]);
      event.preventDefault();
    }
    if (event.code === 'Space') {
      input.jumpQueued = true;
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => {
    if (KEYMAP[event.code]) keys.delete(KEYMAP[event.code]);
  });
  window.addEventListener('blur', () => keys.clear());

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    const p = canvasPoint(event);
    input.pointer = p;
    input.click = p;
    input.jumpQueued = true; // a click also hops, so mouse-only play works
  });

  input.moveVector = () => {
    let x = 0;
    let y = 0;
    if (keys.has('left')) x -= 1;
    if (keys.has('right')) x += 1;
    if (keys.has('up')) y -= 1;
    if (keys.has('down')) y += 1;
    if (x !== 0 && y !== 0) { x *= 0.7071; y *= 0.7071; }
    return { x, y };
  };

  input.takeJump = () => {
    const j = input.jumpQueued;
    input.jumpQueued = false;
    return j;
  };

  input.takeClick = () => {
    const c = input.click;
    input.click = null;
    return c;
  };

  return input;
}
