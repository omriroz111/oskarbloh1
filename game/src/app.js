// הפיטסרי של אוסקר — app shell: canvas scaling, layers, main loop, title screen, input routing
var OP = globalThis.OP || (globalThis.OP = {});

OP.App = {
  t: 0,
  fade: 0,
  confirmNew: 0,
  musicBlocked: false,
  settingsOpen: false,
  sliderDrag: null,
  cinema: null,
  iris: null,
  cinematics: true,
  mpView: 'menu',
  confirmBox: null,
  layers: {},
  mouse: { x: -1, y: -1, over: false },
  hv: {},
  cursor: 'default',
  cursorWant: 'default',
  ui: {
    list: [],
    add(r, fn) {
      this.list.push({ r, fn });
    },
    slider(track, set, id) {
      this.list.push({ r: { x: track.x - 24, y: track.y - 12, w: track.w + 48, h: track.h + 24 }, track, set, id, slider: true });
    },
  },

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.test = location.search.includes('test=1');
    OP.Audio.attachMusic(document.getElementById('music'));
    if (this.test) OP.Audio.muted = true;
    if (location.protocol.startsWith('http') && !this.test) this.loadMusicBlob();
    try {
      this.cinematics = localStorage.getItem('oscarPastry.cinema') !== '0';
    } catch (e) {}
    this.save = OP.loadSave();
    this.makeDemo();
    this.screen = 'title';
    this.resize();
    window.addEventListener('resize', () => {
      clearTimeout(this._rz);
      this._rz = setTimeout(() => this.resize(), 120);
    });
    this.bindInput();
    this.setupCodeInput();
    document.addEventListener('visibilitychange', () => (document.hidden ? this.onAppPause() : this.onAppResume()));
    if (document.fonts) document.fonts.load('800 40px Assistant').then(() => this.buildLayers());
    OP.Audio.musicTarget = 0.85;
    if (!this.test) {
      this.tryMusic();
      this.last = performance.now();
      requestAnimationFrame((ts) => this.frame(ts));
    }
  },

  tryMusic() {
    OP.Audio.playMusic()
      .then(() => {
        this.musicBlocked = false;
        console.log('[oscar] music playing');
      })
      .catch((e) => {
        this.musicBlocked = true;
        console.log('[oscar] music blocked: ' + (e && e.name));
      });
  },

  // On Android the assets come through an intercepted https origin; a blob URL keeps the song seekable so it loops.
  loadMusicBlob() {
    const el = document.getElementById('music');
    fetch(el.getAttribute('src'))
      .then((r) => r.blob())
      .then((b) => {
        el.src = URL.createObjectURL(b);
        if (!document.hidden) this.tryMusic();
      })
      .catch(() => {});
  },
  onAppPause() {
    if (OP.Audio.music) OP.Audio.music.pause();
    OP.Audio.setBuzz(false);
    if (this.play && this.screen === 'play' && this.play.view === 'game') this.play.pause();
  },
  onAppResume() {
    if (!this.test) this.tryMusic();
  },
  // Android back button: close overlays / toggle pause; returns 'exit' on the title screen.
  onBack() {
    if (this.confirmBox) {
      this.confirmBox = null;
      return 'ok';
    }
    if (this.screen === 'mp' && !this.settingsOpen) {
      this.mpBack();
      return 'ok';
    }
    if (this.cinema && !this.settingsOpen) {
      this.cinema.skip();
      return 'ok';
    }
    if (this.settingsOpen) {
      this.closeSettings();
      return 'ok';
    }
    if (this.screen === 'play' && this.play) {
      if (this.play.view === 'game') {
        if (this.play.paused) this.play.resume();
        else this.play.pause();
      }
      return 'ok';
    }
    return 'exit';
  },

  hover(id, r) {
    const inside = this.mouse.over && OP.inRect(this.mouse.x, this.mouse.y, r);
    const v = this.hv[id] || 0;
    const nv = v + ((inside ? 1 : 0) - v) * 0.3;
    this.hv[id] = nv < 0.01 ? 0 : nv;
    if (inside) this.cursorWant = 'pointer';
    return this.hv[id];
  },

  makeDemo() {
    const save = OP.newSave();
    save.day = 4;
    save.upgrades = { pist: 1, sugar: 1, almond: 1, vanilla: 1, coffee: 1 };
    save.seen.tutorial = 1;
    const d = new OP.Shop(save, { skipBanner: true, noFaults: true, demo: true, skipTutorial: true });
    d.phase = 'demo';
    d.weather = 'clear';
    for (const id in d.trays) d.trays[id].amount = d.trays[id].max;
    d.basket = 6;
    d.oven.slots[0].state = 'ready';
    Object.assign(d.oven.slots[1], { state: 'baking', t: 8 });
    Object.assign(d.oven.slots[2], { state: 'baking', t: 3 });
    d.boards[0] = Object.assign(d.newCroissant(), { sliced: true, filling: 'choc', spread: 1 });
    d.boards[2] = Object.assign(d.newCroissant(), { sliced: true, filling: 'pist', spread: 1, toppings: ['almond'], bagged: true, wrapped: true, wrap: 1 });
    d.coffee.cups = [{ t: 4, ready: true }];
    const orders = [
      [{ kind: 'croissant', filling: 'choc', toppings: ['sugar'] }, { kind: 'coffee' }],
      [{ kind: 'croissant', filling: null, toppings: [] }],
      [{ kind: 'croissant', filling: 'pist', toppings: ['almond'] }, { kind: 'juice' }],
    ];
    orders.forEach((order, i) => {
      const c = d.spawnCustomer({ order });
      d.spots[c.spot] = null;
      c.spot = i;
      d.spots[i] = c;
      c.tx = c.x = d.spotX(i);
      c.state = 'waiting';
      c.stateT = 5;
      c.tutorial = true;
    });
    this.demo = d;
  },

  resize() {
    const mobile = navigator.maxTouchPoints > 0 && !/Electron/i.test(navigator.userAgent);
    this.mobile = mobile;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    // Wide phones: while cooking, zoom in by cropping the decorative strips above the HUD
    // and below the boards, so every station is bigger under the finger.
    this.maxCrop = mobile ? OP.clamp(Math.floor((720 - (1280 * ch) / cw) / 2), 0, 56) : 0;
    this.crop = Math.min(this.crop || 0, this.maxCrop);
    this.layerScale = Math.min(cw / 1280, ch / (720 - 2 * this.maxCrop));
    this.applyView();
    this.buildLayers();
    if (this.test) this.render();
  },
  applyView() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const vis = 720 - 2 * (this.crop || 0);
    this.scale = Math.min(cw / 1280, ch / vis);
    this.ox = (cw - 1280 * this.scale) / 2;
    this.oy = (ch - vis * this.scale) / 2 - (this.crop || 0) * this.scale;
  },

  buildLayers() {
    const s = this.layerScale || this.scale;
    const defs = [
      ['back', OP.drawBackLayer],
      ['walls', OP.drawWallsLayer],
      ['counter', OP.drawCounterLayer],
      ['shade', OP.drawShadeLayer],
      ['glow', OP.drawGlowLayer],
    ];
    for (const [name, fn] of defs) {
      const c = document.createElement('canvas');
      c.width = Math.ceil(1280 * s);
      c.height = Math.ceil(720 * s);
      const x = c.getContext('2d');
      x.scale(s, s);
      fn(x);
      this.layers[name] = c;
    }
  },

  frame(ts) {
    const dt = Math.min(0.05, Math.max(0, (ts - this.last) / 1000));
    this.last = ts;
    this.step(dt);
    this.render();
    requestAnimationFrame((n) => this.frame(n));
  },

  step(dt) {
    this.t += dt;
    const zoom = this.maxCrop > 0 && this.screen === 'play' && this.play && this.play.view === 'game' && !this.cinema;
    const want = zoom ? this.maxCrop : 0;
    if (this.crop !== want) {
      this.crop += (want - this.crop) * Math.min(1, dt * 6);
      if (Math.abs(want - this.crop) < 0.3) this.crop = want;
    }
    OP.hudY = this.crop || 0;
    OP.Audio.update(dt);
    this.fade = Math.max(0, this.fade - dt * 2.5);
    if (this.confirmNew > 0) this.confirmNew -= dt;
    if (this.iris) {
      this.iris.t += dt;
      if (!this.iris.fired && this.iris.t >= 0.45) {
        this.iris.fired = true;
        this.iris.fn();
      }
      if (this.iris.t >= 1.0) this.iris = null;
    }
    if (this.cinema) {
      this.cinema.update(dt);
      OP.Audio.setAmbience(null);
    } else if (this.screen === 'title' || this.screen === 'mp') {
      this.demo.update(dt);
      OP.Audio.setAmbience(null);
    } else if (this.play) this.play.update(dt);
  },

  render() {
    const ctx = this.ctx;
    this.applyView();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1d110a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.scale, 0, 0, this.scale, this.ox, this.oy);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 1280, 720);
    ctx.clip();
    this.ui.list = [];
    this.cursorWant = 'default';
    if (this.cinema) this.cinema.draw(ctx, this.t);
    else if (this.screen === 'title') OP.drawTitle(ctx, this, this.t);
    else if (this.screen === 'mp') OP.drawMp(ctx, this, this.t);
    else this.play.draw(ctx, this.t);
    if (this.iris) this.drawIris(ctx);
    if (this.confirmBox) {
      this.ui.list = [];
      this.cursorWant = 'default';
      OP.drawConfirm(ctx, this, this.t);
    }
    if (this.settingsOpen) {
      this.ui.list = [];
      this.cursorWant = 'default';
      OP.drawSettings(ctx, this, this.t);
    }
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(20,10,5,${this.fade})`;
      ctx.fillRect(0, 0, 1280, 720);
    }
    ctx.restore();
    if (this.cursorWant === 'default' && !this.settingsOpen && this.screen === 'play' && this.play) this.cursorWant = this.play.cursor || 'default';
    this.updateCodeInput();
    if (this.sliderDrag) this.cursorWant = 'grabbing';
    if (this.cursorWant !== this.cursor) {
      this.cursor = this.cursorWant;
      this.canvas.style.cursor = this.cursor;
    }
  },

  bindInput() {
    const cv = this.canvas;
    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      const px = (e.clientX - r.left) * (cv.width / r.width);
      const py = (e.clientY - r.top) * (cv.height / r.height);
      return { x: (px - this.ox) / this.scale, y: (py - this.oy) / this.scale };
    };
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try {
        cv.setPointerCapture(e.pointerId);
      } catch (_) {}
      const p = pos(e);
      this.mouse = { x: p.x, y: p.y, over: e.pointerType === 'mouse' };
      this.touch = e.pointerType !== 'mouse';
      this.onDown(e.pointerId, p.x, p.y);
    });
    cv.addEventListener('pointermove', (e) => {
      const p = pos(e);
      if (e.pointerType === 'mouse') this.mouse = { x: p.x, y: p.y, over: true };
      if (this.sliderDrag && this.sliderDrag.id === e.pointerId) {
        const b = this.sliderDrag.b;
        b.set(OP.clamp((p.x - b.track.x) / b.track.w, 0, 1));
        return;
      }
      if (this.screen === 'play' && this.play && !this.settingsOpen && !this.cinema) this.play.pointerMove(e.pointerId, p.x, p.y);
    });
    const up = (e) => {
      if (this.sliderDrag && this.sliderDrag.id === e.pointerId) {
        this.sliderDrag = null;
        OP.sfx('click');
        return;
      }
      if (this.screen !== 'play' || !this.play) return;
      const p = pos(e);
      this.play.pointerUp(e.pointerId, p.x, p.y);
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => {
      this.mouse.over = false;
    });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (e.key === 'Escape') {
        if (this.confirmBox) this.confirmBox = null;
        else if (this.cinema && !this.settingsOpen) this.cinema.skip();
        else if (this.settingsOpen) this.closeSettings();
        else if (this.screen === 'mp') this.mpBack();
        else if (this.screen === 'play' && this.play.view === 'game') {
          if (this.play.paused) this.play.resume();
          else this.play.pause();
        }
      }
      if ((e.key === 'Enter' || e.key === ' ') && this.screen === 'title' && !this.settingsOpen) this.start();
      if (e.key === 'm' || e.key === 'M' || e.key === 'צ') this.toggleMute();
    });
  },

  onDown(id, x, y) {
    OP.Audio.unlock();
    if (this.musicBlocked) this.tryMusic();
    for (let i = this.ui.list.length - 1; i >= 0; i--) {
      const b = this.ui.list[i];
      if (!OP.inRect(x, y, b.r)) continue;
      if (b.slider) {
        this.sliderDrag = { id, b };
        b.set(OP.clamp((x - b.track.x) / b.track.w, 0, 1));
        return;
      }
      OP.sfx('click');
      b.fn();
      return;
    }
    if (this.settingsOpen || this.cinema || this.iris) return;
    if (this.screen === 'play' && this.play) this.play.pointerDown(id, x, y);
  },

  playCutscene(name, onDone, ...args) {
    const shots = OP.CUTSCENES[name](this, ...args);
    OP.Audio.musicTarget = 0.6;
    this.cinema = new OP.Cinema(this, shots, () => {
      this.cinema = null;
      OP.Audio.musicTarget = this.screen === 'title' ? 0.85 : 0.35;
      this.fade = 0.8;
      if (onDone) onDone();
    });
  },
  // circular wipe: closes, runs fn at the dark moment, opens again
  transition(fn) {
    this.iris = { t: 0, fn, fired: false };
  },
  drawIris(ctx) {
    const t = this.iris.t;
    const k = t < 0.45 ? 1 - OP.easeOutCubic(t / 0.45) : OP.easeOutCubic((t - 0.45) / 0.55);
    const r = Math.max(0, k * 780);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 1280, 720);
    ctx.arc(640, 360, r, 0, Math.PI * 2, true);
    ctx.fillStyle = '#0b0603';
    ctx.fill();
    if (r > 2) {
      ctx.beginPath();
      ctx.arc(640, 360, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,200,110,.7)';
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    ctx.restore();
  },
  toggleCinematics() {
    this.cinematics = !this.cinematics;
    try {
      localStorage.setItem('oscarPastry.cinema', this.cinematics ? '1' : '0');
    } catch (e) {}
  },

  start() {
    if (this.screen !== 'title' || this.iris) return;
    OP.Audio.unlock();
    OP.sfx('swoosh');
    this.transition(() => {
      this.save = OP.loadSave() || OP.newSave();
      this.play = new OP.Play(this);
      this.screen = 'play';
      OP.Audio.musicTarget = 0.35;
      const save = this.save;
      if (!save.seen.intro) {
        this.playCutscene('intro', () => {
          save.seen.intro = 1;
          OP.writeSave(save);
          OP.sfx('banner');
        });
      } else if (this.cinematics && save.day > 1) {
        this.playCutscene('morning', () => OP.sfx('banner'), this.play.shop);
      } else {
        OP.sfx('banner');
      }
    });
  },
  askNewGame() {
    const s = this.save;
    this.confirmBox = {
      title: 'משחק חדש?',
      text: s ? `ההתקדמות שלך (יום ${s.day}, ${s.coins} מטבעות) תימחק ואי אפשר יהיה לשחזר אותה` : 'מתחילים מהיום הראשון',
      yes: 'כן, משחק חדש',
      onYes: () => {
        OP.clearSave();
        this.save = null;
        this.start();
      },
    };
  },

  // ---------- multiplayer ----------
  openMp() {
    this.screen = 'mp';
    this.mpView = 'menu';
    OP.sfx('swoosh');
  },
  showJoin() {
    this.mpView = 'join';
    if (OP.Net.status === 'error') OP.Net.reset();
    setTimeout(() => this.codeInput && this.codeInput.focus(), 50);
  },
  hostMp(mode) {
    this.mpView = 'host';
    OP.Net.host(mode);
  },
  joinMp() {
    const code = this.codeInput ? this.codeInput.value : '';
    OP.Net.join(code);
  },
  mpBack() {
    if (this.mpView === 'menu') return this.closeMp();
    OP.Net.leave();
    this.mpView = 'menu';
  },
  closeMp() {
    OP.Net.leave();
    this.screen = 'title';
    this.save = OP.loadSave();
  },
  hostStartMatch() {
    const net = OP.Net;
    if (!net.peer || this.iris) return;
    const players = net.pids.slice();
    const msg =
      net.mode === 'versus'
        ? { t: 'start', mode: 'versus', round: 1, seed: Math.floor(Math.random() * 1e9), players }
        : { t: 'start', mode: 'coop', save: OP.loadCoopSave() || OP.newCoopSave(), players };
    net.send(msg);
    this.startMp(msg, 'host');
  },
  hostNextRound(players) {
    const msg = { t: 'start', mode: 'versus', round: this.play.mp.round + 1, seed: Math.floor(Math.random() * 1e9), players };
    OP.Net.send(msg);
    this.startMp(msg, 'host');
  },
  askNewCoop() {
    const s = OP.loadCoopSave();
    this.confirmBox = {
      title: 'פיטסרי משותפת חדשה?',
      text: s ? `הפיטסרי המשותפת (יום ${s.day}, ${s.coins} מטבעות) תתחיל מההתחלה` : 'מתחילים מהיום הראשון',
      yes: 'כן, מההתחלה',
      onYes: () => {
        OP.clearCoopSave();
        if (OP.Net.role === 'host' && OP.Net.peer) OP.Net.send(OP.Net.lobbyMsg());
      },
    };
  },
  startMp(msg, role = 'guest') {
    OP.Net.status = 'playing';
    OP.Net.mode = msg.mode;
    let save = msg.save;
    if (msg.mode === 'versus') {
      // each player keeps their own kitchen and coins between the rounds of one match
      if (msg.round === 1 || !this.vs) this.vs = { save: OP.versusSave(), totals: {}, scored: 0 };
      save = Object.assign(this.vs.save, { day: msg.round });
    }
    this.transition(() => {
      this.play = new OP.Play(this, { mp: { role, mode: msg.mode, save, seed: msg.seed, round: msg.round, players: msg.players } });
      this.screen = 'play';
      OP.Audio.musicTarget = 0.35;
      const shop = this.play.shop;
      const n = (msg.players || OP.Net.pids).length;
      let scene = null;
      if (msg.mode === 'coop') scene = save.day === 1 ? 'coopIntro' : this.cinematics ? 'coopMorning' : null;
      else scene = msg.round === 1 ? 'vsIntro' : this.cinematics ? 'vsMorning' : null;
      if (scene) this.playCutscene(scene, () => OP.sfx('banner'), shop, n, msg.round);
      else OP.sfx('banner');
    });
  },
  setupCodeInput() {
    this.codeInput = document.getElementById('codeInput');
    if (!this.codeInput) return;
    this.codeInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        this.joinMp();
      }
    });
  },
  updateCodeInput() {
    const el = this.codeInput;
    if (!el) return;
    const show = this.screen === 'mp' && this.mpView === 'join' && !this.settingsOpen && !this.confirmBox && !(OP.Net.status === 'lobby' && OP.Net.role === 'guest');
    if (!show) {
      if (el.style.display !== 'none') {
        el.style.display = 'none';
        el.blur();
      }
      return;
    }
    const r = this.canvas.getBoundingClientRect();
    const k = r.width / this.canvas.width;
    const R = OP.MP_INPUT;
    el.style.display = 'block';
    el.style.left = r.left + (this.ox + R.x * this.scale) * k + 'px';
    el.style.top = r.top + (this.oy + R.y * this.scale) * k + 'px';
    el.style.width = R.w * this.scale * k + 'px';
    el.style.height = R.h * this.scale * k + 'px';
    el.style.fontSize = Math.round(28 * this.scale * k) + 'px';
  },
  toTitle() {
    if ((this.play && this.play.mp) || OP.Net.status !== 'idle') OP.Net.leave();
    OP.Audio.setBuzz(false);
    this.play = null;
    this.save = OP.loadSave();
    this.screen = 'title';
    this.fade = 1;
    OP.Audio.musicTarget = 0.85;
  },
  openSettings() {
    this.settingsOpen = true;
    if (this.play) this.play.pause();
    OP.sfx('swoosh');
  },
  closeSettings() {
    this.settingsOpen = false;
    this.sliderDrag = null;
  },
  toggleMute() {
    OP.Audio.toggleMute();
  },

  // test harness hook: set up a named state and draw one frame
  runScene(name) {
    this.buildLayers();
    this.settingsOpen = false;
    this.sliderDrag = null;
    this.fade = 0;
    this.cinema = null;
    this.iris = null;
    this.confirmBox = null;
    if (OP.Net) OP.Net.reset();
    OP.Audio.muted = true;
    const result = OP.TestScenes[name](this);
    this.render();
    return result;
  },
};
