// Synthesized sound effects for Turkey Run (WebAudio, no audio files).
// One job: every sound the game makes, built from oscillators so the
// game loads zero external media.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freqStart, freqEnd, seconds, type, volume, delay = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + seconds);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  return {
    unlock() { ensure(); },
    jump() { tone(280, 620, 0.16, 'sine', 0.16); },
    pickup() { tone(660, 660, 0.09, 'triangle', 0.16); tone(880, 880, 0.12, 'triangle', 0.16, 0.08); },
    boost() { tone(420, 940, 0.28, 'square', 0.08); },
    spotted() { tone(190, 150, 0.28, 'sawtooth', 0.14); tone(150, 110, 0.22, 'sawtooth', 0.12, 0.1); },
    hurt() { tone(320, 90, 0.35, 'sawtooth', 0.16); },
    caught() { tone(300, 60, 0.8, 'sawtooth', 0.16); tone(220, 55, 0.8, 'triangle', 0.12, 0.12); },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.15, i * 0.13));
    },
    stageClear() { tone(523, 523, 0.12, 'triangle', 0.14); tone(784, 784, 0.2, 'triangle', 0.14, 0.11); },
    setMuted(value) { muted = value; },
  };
}
