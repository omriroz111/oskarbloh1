// הפיטסרי של אוסקר — core: math helpers, save file, synthesized sound + music
var OP = globalThis.OP || (globalThis.OP = {});

OP.W = 1280;
OP.H = 720;

OP.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
OP.lerp = (a, b, t) => a + (b - a) * t;
OP.rand = (a, b) => a + Math.random() * (b - a);
OP.randInt = (a, b) => Math.floor(OP.rand(a, b + 1));
OP.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
OP.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
OP.inRect = (x, y, r, pad = 0) =>
  x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
OP.easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
OP.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
OP.wrapAngle = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};
OP.pad2 = (n) => (n < 10 ? '0' : '') + n;
OP.mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ---------- save ----------
OP.SAVE_KEY = 'oscarPastry.save.v1';
OP.newSave = () => ({ day: 1, coins: 0, rep: 3, upgrades: {}, seen: {}, best: 0 });
OP.loadSave = () => {
  try {
    const s = JSON.parse(localStorage.getItem(OP.SAVE_KEY));
    if (s && s.day) return Object.assign(OP.newSave(), s);
  } catch (e) {}
  return null;
};
OP.writeSave = (s) => {
  try {
    localStorage.setItem(OP.SAVE_KEY, JSON.stringify(s));
  } catch (e) {}
};
OP.clearSave = () => {
  try {
    localStorage.removeItem(OP.SAVE_KEY);
  } catch (e) {}
};

// ---------- audio ----------
OP.Audio = {
  ctx: null,
  out: null,
  music: null,
  muted: false,
  musicTarget: 0.85,
  musicLevel: 0,
  musicVol: 0.6,
  sfxVol: 0.8,
  buzz: null,
  noiseBuf: null,

  init() {
    if (this.ctx || typeof window === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.out = this.ctx.createGain();
    this.applyVolumes();
    if (this.ambWanted) setTimeout(() => this.setAmbience(this.ambWanted), 0);
    const comp = this.ctx.createDynamicsCompressor();
    this.out.connect(comp);
    comp.connect(this.ctx.destination);
  },
  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  attachMusic(el) {
    this.music = el;
    el.volume = 0;
    try {
      this.muted = localStorage.getItem('oscarPastry.muted') === '1';
      const v = JSON.parse(localStorage.getItem('oscarPastry.volume') || 'null');
      if (v && Number.isFinite(v.music)) this.musicVol = OP.clamp(v.music, 0, 1);
      if (v && Number.isFinite(v.sfx)) this.sfxVol = OP.clamp(v.sfx, 0, 1);
    } catch (e) {}
  },
  applyVolumes() {
    if (this.out) this.out.gain.value = this.muted ? 0 : 0.6 * this.sfxVol;
  },
  setVolume(kind, v) {
    v = OP.clamp(v, 0, 1);
    if (kind === 'music') this.musicVol = v;
    else this.sfxVol = v;
    if (v > 0) this.muted = false;
    this.applyVolumes();
    this.saveVolumes();
  },
  saveVolumes() {
    try {
      localStorage.setItem('oscarPastry.volume', JSON.stringify({ music: this.musicVol, sfx: this.sfxVol }));
      localStorage.setItem('oscarPastry.muted', this.muted ? '1' : '0');
    } catch (e) {}
  },
  playMusic() {
    if (!this.music) return Promise.reject(new Error('no music'));
    const p = this.music.play();
    return p && p.then ? p : Promise.resolve();
  },
  update(dt) {
    if (!this.music) return;
    const target = this.muted ? 0 : this.musicTarget * this.musicVol;
    this.musicLevel += (target - this.musicLevel) * Math.min(1, dt * 2.5);
    this.music.volume = OP.clamp(this.musicLevel, 0, 1);
  },
  toggleMute() {
    this.muted = !this.muted;
    this.applyVolumes();
    if (this.muted) {
      this.setBuzz(false);
      this.setAmbience(null);
    }
    this.saveVolumes();
    return this.muted;
  },
  tone(freq, dur, o = {}) {
    const c = this.ctx;
    if (!c || this.muted) return;
    const t0 = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t0 + dur);
    const v = o.vol == null ? 0.3 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.out);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  },
  noise(dur, o = {}) {
    const c = this.ctx;
    if (!c || this.muted) return;
    if (!this.noiseBuf) {
      const b = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
    }
    const t0 = c.currentTime + (o.delay || 0);
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 2000, t0);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, t0 + dur);
    f.Q.value = o.q || 1;
    const g = c.createGain();
    const v = o.vol == null ? 0.25 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.out);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.03);
  },
  // Looping background bed: 'cafe' murmur, 'rain', or null. Scaled by the sound-effects volume.
  setAmbience(kind) {
    this.ambWanted = kind;
    const c = this.ctx;
    if (!c) return;
    if (this.amb && this.amb.kind === kind) return;
    if (this.amb) {
      const old = this.amb;
      old.g.gain.setTargetAtTime(0, c.currentTime, 0.35);
      setTimeout(() => old.nodes.forEach((n) => {
        try {
          n.stop();
        } catch (e) {}
      }), 2000);
      this.amb = null;
    }
    if (!kind || this.muted) return;
    if (!this.ambBuf) {
      const b = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.ambBuf = b;
    }
    const g = c.createGain();
    g.gain.value = 0;
    g.connect(this.out);
    const nodes = [];
    const src = c.createBufferSource();
    src.buffer = this.ambBuf;
    src.loop = true;
    if (kind === 'rain') {
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1400;
      const hg = c.createGain();
      hg.gain.value = 0.07;
      src.connect(hp);
      hp.connect(hg);
      hg.connect(g);
      const low = c.createBiquadFilter();
      low.type = 'lowpass';
      low.frequency.value = 280;
      const lg = c.createGain();
      lg.gain.value = 0.08;
      src.connect(low);
      low.connect(lg);
      lg.connect(g);
    } else {
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 520;
      bp.Q.value = 0.9;
      const mg = c.createGain();
      mg.gain.value = 0.035;
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.3;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(mg.gain);
      src.connect(bp);
      bp.connect(mg);
      mg.connect(g);
      lfo.start();
      nodes.push(lfo);
    }
    src.start();
    nodes.push(src);
    g.gain.setTargetAtTime(1, c.currentTime, 0.8);
    this.amb = { kind, g, nodes };
  },
  setBuzz(on) {
    const c = this.ctx;
    if (!c) return;
    if (on && !this.buzz && !this.muted) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 210;
      const lfo = c.createOscillator();
      lfo.frequency.value = 23;
      const lg = c.createGain();
      lg.gain.value = 20;
      lfo.connect(lg);
      lg.connect(o.frequency);
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 900;
      f.Q.value = 1.4;
      const g = c.createGain();
      g.gain.value = 0;
      g.gain.setTargetAtTime(0.045, c.currentTime, 0.08);
      o.connect(f);
      f.connect(g);
      g.connect(this.out);
      o.start();
      lfo.start();
      this.buzz = { o, lfo, g };
    } else if (!on && this.buzz) {
      const b = this.buzz;
      b.g.gain.setTargetAtTime(0, c.currentTime, 0.05);
      b.o.stop(c.currentTime + 0.3);
      b.lfo.stop(c.currentTime + 0.3);
      this.buzz = null;
    }
  },
};

OP.sfx = function (name) {
  const A = OP.Audio;
  if (!A.ctx || A.muted || A.sfxVol <= 0) return;
  switch (name) {
    case 'birds':
      for (let i = 0; i < 6; i++) {
        const f = 2600 + Math.random() * 1400;
        const d = i * 0.17 + Math.random() * 0.05;
        A.tone(f, 0.07, { vol: 0.05, delay: d, slide: f * 1.3 });
        A.tone(f * 1.2, 0.06, { vol: 0.04, delay: d + 0.08, slide: f });
      }
      break;
    case 'shutter':
      for (let i = 0; i < 16; i++) A.noise(0.05, { filter: 'bandpass', freq: 1800 + (i % 3) * 400, q: 3, vol: 0.12, delay: i * 0.07 });
      A.noise(1.1, { filter: 'lowpass', freq: 500, vol: 0.12 });
      break;
    case 'sparkle':
      [1568, 2093, 2637, 3136, 4186].forEach((f, i) => A.tone(f, 0.28, { vol: 0.08, delay: i * 0.06 }));
      break;
    case 'ignite':
      A.noise(0.9, { filter: 'bandpass', freq: 300, freqEnd: 1400, q: 0.7, vol: 0.3, attack: 0.15 });
      A.tone(80, 0.6, { type: 'sawtooth', vol: 0.06, slide: 140 });
      break;
    case 'doorbell':
      A.tone(1318, 0.5, { vol: 0.08 });
      A.tone(1046, 0.7, { vol: 0.07, delay: 0.14 });
      break;
    case 'pick':
      A.tone(520, 0.09, { type: 'triangle', vol: 0.18, slide: 780 });
      break;
    case 'drop':
      A.tone(220, 0.12, { vol: 0.3, slide: 140 });
      A.noise(0.06, { filter: 'lowpass', freq: 700, vol: 0.12 });
      break;
    case 'snap':
      A.tone(700, 0.1, { type: 'triangle', vol: 0.12, slide: 420 });
      break;
    case 'stamp':
      A.noise(0.09, { filter: 'lowpass', freq: 400, vol: 0.45 });
      A.tone(160, 0.14, { vol: 0.3, slide: 90 });
      break;
    case 'combo':
      [1047, 1319, 1568, 2093].forEach((f, i) => A.tone(f, 0.12, { type: 'triangle', vol: 0.14, delay: i * 0.05 }));
      break;
    case 'coinLand':
      A.tone(1760 + Math.random() * 300, 0.07, { type: 'square', vol: 0.05 });
      break;
    case 'hover':
      A.tone(900, 0.03, { vol: 0.04 });
      break;
    case 'swoosh':
      A.noise(0.35, { filter: 'bandpass', freq: 600, freqEnd: 2600, q: 0.8, vol: 0.18 });
      break;
    case 'click': A.tone(660, 0.08, { type: 'triangle', vol: 0.22, slide: 880 }); break;
    case 'pop': A.tone(420, 0.12, { vol: 0.35, slide: 900 }); break;
    case 'cut':
      A.noise(0.12, { filter: 'highpass', freq: 3500, vol: 0.35 });
      A.tone(900, 0.05, { type: 'square', vol: 0.04 });
      break;
    case 'slice': A.noise(0.22, { filter: 'bandpass', freq: 5000, freqEnd: 1500, q: 2, vol: 0.4 }); break;
    case 'spread': A.noise(0.09, { filter: 'lowpass', freq: 900, vol: 0.12 }); break;
    case 'sprinkle':
      for (let i = 0; i < 5; i++) A.tone(2400 + Math.random() * 1600, 0.04, { vol: 0.07, delay: i * 0.03 });
      break;
    case 'ding':
      A.tone(1568, 0.6, { vol: 0.28 });
      A.tone(2093, 0.8, { vol: 0.18, delay: 0.12 });
      break;
    case 'burnt':
      A.tone(140, 0.5, { type: 'sawtooth', vol: 0.14, slide: 90 });
      A.noise(0.5, { filter: 'lowpass', freq: 600, vol: 0.15 });
      break;
    case 'coin':
      A.tone(988, 0.08, { type: 'square', vol: 0.11 });
      A.tone(1319, 0.25, { type: 'square', vol: 0.11, delay: 0.07 });
      break;
    case 'wrap':
      [523, 659, 784, 1047].forEach((f, i) => A.tone(f, 0.14, { type: 'triangle', vol: 0.22, delay: i * 0.06 }));
      break;
    case 'crinkle': A.noise(0.06, { filter: 'highpass', freq: 2500, vol: 0.1 }); break;
    case 'fail':
      A.tone(400, 0.35, { type: 'sawtooth', vol: 0.14, slide: 120 });
      A.noise(0.25, { filter: 'lowpass', freq: 1200, vol: 0.2 });
      break;
    case 'happy':
      [784, 988, 1175].forEach((f, i) => A.tone(f, 0.16, { vol: 0.2, delay: i * 0.07 }));
      break;
    case 'angry': A.tone(180, 0.45, { type: 'sawtooth', vol: 0.13, slide: 110 }); break;
    case 'wrong':
      A.tone(300, 0.12, { type: 'square', vol: 0.09 });
      A.tone(240, 0.18, { type: 'square', vol: 0.09, delay: 0.1 });
      break;
    case 'swat':
      A.noise(0.1, { filter: 'lowpass', freq: 800, vol: 0.5 });
      A.tone(120, 0.1, { vol: 0.3 });
      break;
    case 'alarm':
      for (let i = 0; i < 3; i++) {
        A.tone(880, 0.18, { type: 'square', vol: 0.08, delay: i * 0.36, slide: 1320 });
        A.tone(1320, 0.18, { type: 'square', vol: 0.08, delay: i * 0.36 + 0.18, slide: 880 });
      }
      break;
    case 'caught':
      A.noise(0.15, { filter: 'lowpass', freq: 500, vol: 0.4 });
      [659, 880].forEach((f, i) => A.tone(f, 0.15, { type: 'triangle', vol: 0.2, delay: 0.1 + i * 0.08 }));
      break;
    case 'bell':
      A.tone(1760, 1.2, { vol: 0.22 });
      A.tone(2637, 0.9, { vol: 0.1 });
      break;
    case 'refill': A.tone(300, 0.25, { type: 'triangle', vol: 0.15, slide: 600 }); break;
    case 'fix':
      A.tone(700, 0.06, { type: 'square', vol: 0.09 });
      A.tone(900, 0.06, { type: 'square', vol: 0.09, delay: 0.08 });
      A.tone(1200, 0.2, { type: 'triangle', vol: 0.15, delay: 0.16 });
      break;
    case 'whistle':
      A.tone(1800, 0.18, { vol: 0.18, slide: 2400 });
      A.tone(2400, 0.3, { vol: 0.18, delay: 0.2, slide: 1600 });
      break;
    case 'banner':
      A.tone(196, 0.2, { type: 'triangle', vol: 0.3 });
      A.tone(392, 0.45, { type: 'triangle', vol: 0.25, delay: 0.15 });
      break;
    case 'buy':
      [660, 880, 1320].forEach((f, i) => A.tone(f, 0.12, { type: 'square', vol: 0.09, delay: i * 0.06 }));
      break;
  }
};
