// הפיטסרי של אוסקר — the play screen: scene rendering, touch/mouse gestures, day flow
var OP = globalThis.OP || (globalThis.OP = {});

function dustMotes(ctx, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const lx of OP.LAMPS) {
    for (let k = 0; k < 12; k++) {
      const seed = Math.sin(k * 91.7 + lx) * 43758.5453;
      const r0 = seed - Math.floor(seed);
      const ph = (t * (0.025 + r0 * 0.02) + r0) % 1;
      const y = 150 + ph * 420;
      const spread = 20 + (y - 146) * 0.34;
      const x = lx + (r0 - 0.5) * spread * 1.6 + Math.sin(t * 0.7 + k * 1.3) * 10;
      OP.ell(ctx, x, y, 1.8, 1.8);
      ctx.fillStyle = `rgba(255,232,185,${0.45 * Math.sin(ph * Math.PI)})`;
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCustomerTargets(ctx, targets, t) {
  const p = (Math.sin(t * 8) + 1) / 2;
  for (const c of targets) {
    const r = OP.orderCardRect(c);
    OP.rr(ctx, r.x - 8 - p * 3, r.y - 12 - p * 3, r.w + 16 + p * 6, r.h + 24 + p * 6, 16);
    ctx.strokeStyle = `rgba(95,220,110,${0.6 + p * 0.4})`;
    ctx.lineWidth = 6;
    ctx.stroke();
    OP.icon(ctx, 'arrowDown', c.x - 44, 226 + p * 8, 30, { color: '#5fd068' });
  }
}

function drawDashed(ctx, r, t, color, lw = 3) {
  ctx.save();
  OP.rr(ctx, r.x - 7, r.y - 7, r.w + 14, r.h + 14, 16);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -t * 30;
  ctx.stroke();
  ctx.restore();
}

OP.renderScene = (ctx, shop, t, app, o = {}) => {
  const L = app.layers;
  const drag = o.drag || {};
  ctx.save();
  if (shop.shakeMag > 0 && shop.shakeT > 0) {
    const m = shop.shakeMag * Math.min(1, shop.shakeT / 0.2);
    ctx.translate(640, 360);
    ctx.scale(1.016, 1.016);
    ctx.translate(-640 + (Math.random() - 0.5) * m * 2, -360 + (Math.random() - 0.5) * m * 2);
  }
  const tod = o.tod != null ? o.tod : OP.shopTod(shop);
  const night = OP.nightness(tod);
  OP.drawWindowView(ctx, t, tod, shop.weather);
  ctx.drawImage(L.back, 0, 0, 1280, 720);
  const moving =(c) => (c.state === 'leaving' || c.state === 'fleeing' ? 1 : 0);
  const cs = shop.customers.slice().sort((a, b) => moving(a) - moving(b));
  for (const c of cs) {
    c.lookX = drag.x != null && c.state === 'waiting' ? drag.x : null;
    OP.drawCustomer(ctx, c, t);
  }
  ctx.drawImage(L.walls, 0, 0, 1280, 720);
  for (const c of cs) OP.drawOrderCard(ctx, c, t);
  for (const c of cs) OP.drawNameTag(ctx, c, t);
  if (o.targets && o.targets.length) drawCustomerTargets(ctx, o.targets, t);
  const op = OP.OSCAR_POS;
  OP.drawOscar(ctx, op.x, op.y, op.s, t, {
    talking: !!(shop.speech && shop.speech.t < 3),
    wave: !!o.title,
    mood: shop.oscarMood ? shop.oscarMood.mood : null,
  });
  ctx.drawImage(L.counter, 0, 0, 1280, 720);
  for (const c of cs) OP.drawCustomerHands(ctx, c, t);
  OP.drawLedgeCoins(ctx, shop, t);
  OP.drawOven(ctx, shop, t);
  OP.drawDough(ctx, shop, t);
  OP.drawBasket(ctx, shop, t, drag.basket || 0);
  for (const id of OP.TRAY_IDS) OP.drawTray(ctx, shop, id, t);
  OP.drawJuiceCrate(ctx, shop, t, (drag.juice || 0) + shop.inFlight('juice'));
  OP.drawCoffeeMachine(ctx, shop, t, drag.cup == null ? -1 : drag.cup);
  OP.drawBagStack(ctx, t);
  OP.drawTrash(ctx, !!drag.overTrash, t);
  OP.drawBoards(ctx, shop, t, drag.board == null ? -1 : drag.board, drag.hoverBoard == null ? -1 : drag.hoverBoard);
  if (o.boardTargets) for (const i of o.boardTargets) drawDashed(ctx, OP.L.boards[i], t, 'rgba(95,220,110,.95)', 4);
  if (o.hover) drawDashed(ctx, o.hover, t, 'rgba(255,255,255,.75)', 3);
  OP.drawCrumbs(ctx, shop);
  for (const f of shop.flies) OP.drawFly(ctx, f, t);
  OP.drawFlights(ctx, shop, t, false);
  OP.drawCandies(ctx, shop, t);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, 0.84 + night * 0.2 + Math.sin(t * 3.1) * 0.04 + Math.sin(t * 7.3) * 0.02);
  ctx.drawImage(L.glow, 0, 0, 1280, 720);
  if (night > 0.2) {
    ctx.globalAlpha = (night - 0.2) * 0.7;
    ctx.drawImage(L.glow, 0, 0, 1280, 720);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(L.shade, 0, 0, 1280, 720);
  OP.drawGrade(ctx, tod, shop.weather);
  dustMotes(ctx, t);
  OP.drawStamps(ctx, shop);
  ctx.restore();
};

const HINTS = {
  notSliced: 'קודם חותכים את הקרואסון!',
  other: 'כבר יש מילוי אחר',
  empty: 'המגש ריק! לחצו על כפתור המילוי',
  refilling: 'ממלאים את המגש…',
  has: 'כבר יש את התוספת הזאת',
  unspread: 'קודם מסיימים למרוח!',
};

OP.Play = class Play {
  constructor(app, opts = {}) {
    this.app = app;
    this.mp = opts.mp || null;
    if (this.mp) {
      const m = this.mp;
      const save = Object.assign({}, m.save, { upgrades: Object.assign({}, m.save.upgrades), seen: Object.assign({}, m.save.seen) });
      const shopOpts = { noSave: true, skipTutorial: true };
      if (m.mode === 'versus') shopOpts.seed = m.seed;
      if (m.mode === 'coop' && m.role === 'guest') shopOpts.mirror = true;
      this.shop = new OP.Shop(save, shopOpts);
      if (m.mode === 'coop' && m.role === 'host') {
        OP.hookHostShop(this.shop);
        OP.Net.recording = true;
        OP.Net.evq = [];
      }
      if (m.mode === 'coop' && m.role === 'guest') OP.hookGuestShop(this.shop);
      this.save = this.shop.save;
      this.syncT = 0;
      this.scoreT = 0;
      this.cursorT = 0;
      // per-player state, keyed by player id
      this.partners = {};
      this.remoteFix = {};
      this.opps = {};
      this.finals = {};
      this.ready = {};
      this.toasts = [];
    } else {
      this.save = app.save;
      this.shop = new OP.Shop(this.save);
    }
    this.view = 'game';
    this.viewT = 0;
    this.paused = false;
    this.gestures = new Map();
    this.shopTab = 'kitchen';
    this.bought = null;
    this.boughtT = 0;
    this.hoverRect = null;
    this.cursor = 'default';
  }

  update(dt) {
    this.viewT += dt;
    for (const g of this.gestures.values()) {
      if (g.type === 'drag') {
        g.lift = Math.min(1, (g.lift || 0) + dt * 7);
        g.tilt = (g.tilt || 0) * Math.max(0, 1 - dt * 5);
      }
    }
    const live = !this.paused && this.view === 'game' && !this.app.settingsOpen && this.shop.phase !== 'done';
    OP.Audio.setAmbience(live ? (this.shop.weather === 'rain' ? 'rain' : 'cafe') : null);
    if (this.mp) this.updateNet(dt);
    // multiplayer never stops the clock: the others are still working
    if ((this.paused && !this.mp) || this.view !== 'game') return;
    const fixing = { oven: 0, coffee: 0 };
    for (const g of this.gestures.values()) if (g.type === 'fix') fixing[g.eq] = 1;
    if (this.mp && this.mp.role === 'host') {
      for (const v of Object.values(this.remoteFix)) {
        fixing.oven |= v.oven;
        fixing.coffee |= v.coffee;
      }
    }
    this.shop.fixing = fixing;
    this.shop.update(dt);
    const guestMirror = this.mp && this.mp.mode === 'coop' && this.mp.role === 'guest';
    if (this.shop.phase === 'done' && !this.ending && !guestMirror) {
      this.ending = true;
      this.gestures.clear();
      if (this.mp) return this.endMpDay();
      const show = () => {
        this.view = 'summary';
        this.viewT = 0;
        OP.sfx('bell');
      };
      if (this.app.cinematics) this.app.playCutscene('night', show, this.shop);
      else show();
    }
  }

  draw(ctx, t) {
    const shop = this.shop;
    const app = this.app;
    const targets = this.dropTargets();
    const idle = this.view === 'game' && !this.paused && !this.gestures.size;
    OP.renderScene(ctx, shop, t, app, {
      drag: this.dragInfo(),
      targets: targets.customers,
      boardTargets: targets.boards,
      hover: idle ? this.hoverRect : null,
    });
    this.drawGestures(ctx, t);
    if (this.mp) OP.drawPartner(ctx, this, t);
    OP.drawFx(ctx, shop);
    const ui = app.ui;
    if (this.view === 'game') {
      OP.drawTutorial(ctx, shop, t);
      OP.drawHUD(ctx, shop, t, app);
      if (this.mp) OP.drawMpHud(ctx, this, t);
      OP.drawFlights(ctx, shop, t, true);
      OP.drawSpeech(ctx, shop, t);
      OP.drawPrepPanel(ctx, shop, t, app);
      OP.drawBanner(ctx, shop, t);
      if (this.paused) {
        OP.drawPause(ctx, app, t);
      } else {
        ui.add(OP.hudRect(OP.L.pauseBtn), () => this.pause());
        ui.add(OP.hudRect(OP.L.muteBtn), () => app.openSettings());
        if (shop.phase === 'prep') {
          ui.add(OP.L.prepPanel, () => {});
          ui.add(OP.L.openBtn, () => shop.openShop());
        }
      }
    } else if (this.view === 'summary') {
      if (this.mp) OP.drawCoopSummary(ctx, app, t);
      else OP.drawSummary(ctx, app, t);
    } else if (this.view === 'versus') {
      OP.drawVersusResult(ctx, app, t);
    } else if (this.view === 'shop') {
      OP.drawShop(ctx, app, t);
    }
    if (this.mp) OP.drawMpOverlay(ctx, this, t);
  }

  pause() {
    if (this.view !== 'game') return;
    this.paused = true;
    this.gestures.clear();
    OP.Audio.setBuzz(false);
  }
  resume() {
    this.paused = false;
  }
  openShopScreen() {
    this.view = 'shop';
    this.viewT = 0;
    OP.sfx('swoosh');
  }
  buy(id) {
    if (this.mp) return this.mpBuy(id);
    if (OP.buyUpgrade(this.save, id)) {
      OP.sfx('buy');
      this.bought = id;
      this.boughtT = this.app.t;
      if (id === 'paper') this.app.playCutscene('newspaper', null);
    } else {
      OP.sfx('wrong');
    }
  }
  nextDay() {
    if (this.mp) return this.mp.mode === 'coop' ? this.nextCoopDay() : this.markReady();
    if (this.app.iris) return;
    OP.writeSave(this.save);
    OP.sfx('swoosh');
    this.app.transition(() => {
      this.shop = new OP.Shop(this.save);
      this.view = 'game';
      this.viewT = 0;
      this.ending = false;
      if (this.app.cinematics) this.app.playCutscene('morning', () => OP.sfx('banner'), this.shop);
      else OP.sfx('banner');
    });
  }

  // ---------- multiplayer ----------
  updateNet(dt) {
    const net = OP.Net;
    const m = this.mp;
    const shop = this.shop;
    this.syncT += dt;
    this.scoreT += dt;
    this.cursorT += dt;
    if (m.mode === 'coop' && m.role === 'host' && this.syncT >= 1 / 12) {
      this.syncT = 0;
      net.send({ t: 'state', s: OP.snapShop(shop), ev: net.evq.splice(0) });
    }
    if (m.mode === 'coop' && m.role === 'guest') {
      const fx = { oven: 0, coffee: 0 };
      for (const g of this.gestures.values()) if (g.type === 'fix') fx[g.eq] = 1;
      const key = fx.oven + ',' + fx.coffee;
      if (key !== this.fixKey) {
        this.fixKey = key;
        net.send({ t: 'fix', v: fx });
      }
    }
    if (m.mode === 'coop' && this.cursorT >= 1 / 12 && this.pointer) {
      this.cursorT = 0;
      let drag = null;
      for (const g of this.gestures.values()) if (g.type === 'drag' || g.type === 'spread') drag = g;
      const x = Math.round(drag ? drag.x : this.pointer.x);
      const y = Math.round(drag ? drag.y - (drag.oy || 0) : this.pointer.y);
      const src = drag ? drag.src || 'spread' : null;
      const key = x + ',' + y + ',' + src;
      if (key !== this.cursorKey) {
        this.cursorKey = key;
        net.send({ t: 'cursor', x, y, src, tid: drag && drag.tid, fill: drag && drag.fill });
      }
    }
    if (m.mode === 'versus' && this.scoreT >= 1) {
      this.scoreT = 0;
      const st = shop.stats;
      net.send({ t: 'score', round: m.round, profit: st.earned + st.tips + st.bonus - st.fines, served: st.served, lost: st.lost, phase: shop.phase });
    }
    for (const k of Object.keys(this.partners)) if (this.app.t - this.partners[k].at > 3) delete this.partners[k];
    this.toasts = this.toasts.filter((x) => this.app.t - x.at < 3);
    if (m.mode === 'versus') this.updateRound();
  }

  // players still connected who started this match
  activePlayers() {
    const net = OP.Net;
    return (this.mp.players || net.pids).filter((p) => net.pids.includes(p));
  }

  onPlayerLeft(pid) {
    delete this.partners[pid];
    delete this.remoteFix[pid];
    delete this.opps[pid];
    this.toasts.push({ text: OP.Net.nameOf(pid) + ' יצא מהמשחק', at: this.app.t });
  }

  showDayEnd(view, cutscene, ...args) {
    this.gestures.clear();
    const show = () => {
      this.view = view;
      this.viewT = 0;
      OP.sfx('bell');
    };
    if (this.app.cinematics && cutscene) this.app.playCutscene(cutscene, show, this.shop, ...args);
    else show();
  }

  endMpDay() {
    const st = this.shop.stats;
    const profit = st.earned + st.tips + st.bonus - st.fines;
    if (this.mp.mode === 'coop') {
      // the day's coins stay in the shared bakery's cash box
      OP.writeCoopSave(this.save);
      this.coopResult = { day: this.shop.day, stats: st, profit, total: this.save.coins, save: this.save };
      OP.Net.send(Object.assign({ t: 'dayEnd' }, this.coopResult));
      this.showDayEnd('summary', 'coopNight', profit, OP.Net.count);
    } else {
      const me = { round: this.mp.round, profit, served: st.served, lost: st.lost, caught: st.caught };
      this.finals[OP.Net.pid] = me;
      this.app.vs.save = this.save;
      OP.Net.send(Object.assign({ t: 'final' }, me));
      this.showDayEnd('versus', 'night');
    }
  }

  onCoopDayEnd(msg) {
    if (this.mp.role !== 'guest' || this.coopResult) return;
    this.coopResult = msg;
    this.save = msg.save;
    this.showDayEnd('summary', 'coopNight', msg.profit, OP.Net.count);
  }

  nextCoopDay() {
    if (this.mp.role !== 'host' || this.app.iris) return;
    OP.writeCoopSave(this.save);
    const msg = { t: 'start', mode: 'coop', save: this.save, players: OP.Net.pids.slice() };
    OP.Net.send(msg);
    this.app.startMp(msg, 'host');
  }

  // co-op buys go through the host so everyone spends from the same cash box
  mpBuy(id) {
    if (this.mp.mode === 'versus') {
      const ok = OP.buyUpgrade(this.save, id, null);
      this.boughtFlash(id, ok, true);
      return;
    }
    if (this.mp.role === 'host') this.applyBuy(id, OP.Net.pid);
    else OP.Net.send({ t: 'buy', id });
  }
  applyBuy(id, by) {
    const ok = OP.buyUpgrade(this.save, id, OP.writeCoopSave);
    OP.Net.send({ t: 'shopSync', save: this.save, id, ok, by });
    this.boughtFlash(id, ok, by === OP.Net.pid, by);
  }
  onShopSync(msg) {
    this.save = msg.save;
    this.boughtFlash(msg.id, msg.ok, msg.by === OP.Net.pid, msg.by);
  }
  boughtFlash(id, ok, mine, by) {
    if (ok) {
      OP.sfx('buy');
      this.bought = id;
      this.boughtT = this.app.t;
      if (!mine && by) {
        const u = OP.UPGRADES.find((x) => x.id === id);
        this.toasts.push({ text: `${OP.Net.nameOf(by)} קנה: ${u ? u.name : id}`, at: this.app.t });
      }
      if (id === 'paper') this.app.playCutscene('newspaper', null);
    } else if (mine) OP.sfx('wrong');
  }

  // ---------- versus rounds ----------
  roundDone() {
    return this.activePlayers().every((p) => this.finals[p]);
  }
  updateRound() {
    const vs = this.app.vs;
    if (!vs) return;
    if ((this.view === 'versus' || this.view === 'shop') && this.roundDone() && vs.scored !== this.mp.round) {
      vs.scored = this.mp.round;
      for (const [p, f] of Object.entries(this.finals)) vs.totals[p] = (vs.totals[p] || 0) + f.profit;
      if (this.mp.round >= OP.VS_ROUNDS && this.app.cinematics) {
        const winner = this.standings()[0];
        this.app.playCutscene('vsWinner', null, this.shop, winner && OP.Net.nameOf(winner.pid), winner && winner.pid === OP.Net.pid);
      }
    }
    // the host starts the next round once everyone still here has pressed ready
    if (this.mp.role === 'host' && this.mp.round < OP.VS_ROUNDS && vs.scored === this.mp.round && this.activePlayers().every((p) => this.ready[p]) && !this.app.iris && !this.starting) {
      this.starting = true;
      this.app.hostNextRound(this.activePlayers());
    }
  }
  markReady() {
    if (this.ready[OP.Net.pid]) return;
    this.ready[OP.Net.pid] = true;
    OP.Net.send({ t: 'ready', round: this.mp.round });
    OP.sfx('click');
  }
  standings() {
    const vs = this.app.vs;
    return this.activePlayers()
      .map((pid) => ({ pid, total: (vs && vs.totals[pid]) || 0, round: this.finals[pid] }))
      .sort((a, b) => b.total - a.total);
  }

  boardAt(x, y) {
    return OP.L.boards.findIndex((r) => OP.inRect(x, y, r, this.app.touch ? 16 : 8));
  }
  // touch play needs fewer circles to close a bag
  wrapTurns() {
    return this.shop.wrapTurns * (this.app.touch ? 0.6 : 1);
  }
  customerAt(x, y) {
    if (y < 60 || y > 430) return null;
    let best = null;
    let bd = 1e9;
    for (const c of this.shop.customers) {
      if (c.state !== 'waiting') continue;
      const card = OP.orderCardRect(c);
      const d = Math.abs(x - c.x);
      if ((d < (this.app.touch ? 100 : 80) || OP.inRect(x, y, card, 8)) && d < bd) {
        best = c;
        bd = d;
      }
    }
    return best;
  }

  dragInfo() {
    const info = { basket: 0, juice: 0 };
    for (const g of this.gestures.values()) {
      if (g.type !== 'drag') continue;
      info.x = g.x;
      if (g.src === 'basket') info.basket++;
      if (g.src === 'juice') info.juice++;
      if (g.src === 'cup') info.cup = g.cup;
      if (g.src === 'board') {
        info.board = g.i;
        info.overTrash = OP.inRect(g.x, g.y - (g.oy || 0), OP.L.trash, 10);
      }
      if (g.moved > 10 && ['basket', 'bag', 'topping', 'board'].includes(g.src)) {
        const bi = this.boardAt(g.x, g.y - (g.oy || 0));
        if (bi >= 0) info.hoverBoard = bi;
      }
    }
    return info;
  }

  dropTargets() {
    const out = { customers: [], boards: [] };
    let g = null;
    for (const x of this.gestures.values()) if (x.type === 'drag' && x.moved > 6) g = x;
    if (!g) return out;
    const shop = this.shop;
    let item = null;
    if (g.src === 'juice') item = { kind: 'juice' };
    else if (g.src === 'cup') item = { kind: 'coffee' };
    else if (g.src === 'board' && shop.boards[g.i] && shop.boards[g.i].wrapped) item = { kind: 'croissant', c: shop.boards[g.i] };
    if (item) out.customers = shop.customers.filter((c) => c.state === 'waiting' && c.order.some((l) => shop.itemMatches(l, item)));
    shop.boards.forEach((b, i) => {
      if (g.src === 'basket' && !b) out.boards.push(i);
      else if (g.src === 'bag' && b && !b.bagged && !(b.filling && b.spread < 1)) out.boards.push(i);
      else if (g.src === 'topping' && b && !b.bagged && !b.toppings.includes(g.tid)) out.boards.push(i);
      else if (g.src === 'board' && i !== g.i && !b) out.boards.push(i);
    });
    return out;
  }

  drawGestures(ctx, t) {
    const shop = this.shop;
    for (const g of this.gestures.values()) {
      if (g.trail && g.trail.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        for (let k = 1; k < g.trail.length; k++) {
          const a = g.trail[k - 1];
          const b = g.trail[k];
          const age = this.app.t - b.t;
          if (age > 0.25) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - age / 0.25)})`;
          ctx.lineWidth = 3 + (k / g.trail.length) * 7;
          ctx.stroke();
        }
        ctx.restore();
      }
      if (g.type === 'drag') {
        const lift = g.lift || 0;
        const x = g.x;
        const y = g.y - (g.oy || 0) - 10 - lift * 10;
        OP.softShadow(ctx, g.x + 10 + lift * 10, g.y - (g.oy || 0) + 40 + lift * 16, 48, 12, 0.32 - lift * 0.1);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(g.tilt || 0);
        const s = 1 + lift * 0.12;
        ctx.scale(s, s);
        ctx.translate(-x, -y);
        if (g.src === 'basket') OP.drawCroissant(ctx, x, y, 0.9, { state: 'baked', noShadow: true });
        else if (g.src === 'juice') OP.drawJuiceBox(ctx, x, y, 1.25);
        else if (g.src === 'cup') OP.drawCup(ctx, x, y, 1.1, 1, true, t);
        else if (g.src === 'bag') OP.drawBagFlat(ctx, x, y, 1.2, Math.sin(t * 6) * 0.08);
        else if (g.src === 'topping') OP.drawToppingIcon(ctx, x, y, 1.5, g.tid);
        else if (g.src === 'board' && shop.boards[g.i]) OP.drawBuilt(ctx, x, y, 0.95, shop.boards[g.i], t);
        ctx.restore();
      } else if (g.type === 'spread') {
        OP.drawSpatula(ctx, g.x, g.y, g.fill, t);
      } else if (g.type === 'cut' || g.type === 'boardPress') {
        OP.drawKnife(ctx, g.x, g.y, t);
      } else if (g.type === 'wipe' && g.moved > 12) {
        OP.drawSponge(ctx, g.x, g.y);
        if (Math.random() < 0.3) this.shop.burst(g.x + OP.rand(-20, 20), g.y, 'rgba(255,255,255,.9)', 1);
      }
    }
  }

  updateHover(x, y) {
    this.hoverRect = null;
    this.cursor = 'default';
    const shop = this.shop;
    if (this.view !== 'game' || this.paused) return;
    if (shop.phase !== 'prep' && shop.phase !== 'shift' && shop.phase !== 'closing') return;
    const L = OP.L;
    if (shop.flies.some((f) => f.state !== 'dead' && OP.dist(x, y, f.x, f.y) < 40)) {
      this.cursor = 'crosshair';
      return;
    }
    if (shop.coins.some((cn) => OP.dist(x, y, cn.x, cn.y - 8) < 40)) {
      this.cursor = 'pointer';
      return;
    }
    const bi = this.boardAt(x, y);
    if (bi >= 0 && shop.boards[bi]) {
      this.hoverRect = L.boards[bi];
      this.cursor = shop.boards[bi].wrapped ? 'grab' : 'pointer';
      return;
    }
    const cands = [[L.oven, 'pointer'], [L.dough, 'pointer'], [L.basket, 'grab'], [L.juice, 'grab'], [L.coffee, 'pointer'], [L.bags, 'grab']];
    for (const id of OP.TRAY_IDS) cands.push([L.trays[id], 'grab']);
    for (const [r, cur] of cands) {
      if (OP.inRect(x, y, r)) {
        this.hoverRect = r;
        this.cursor = cur;
        return;
      }
    }
  }

  pointerDown(id, x, y) {
    const shop = this.shop;
    if (this.view !== 'game' || this.paused) return;
    if (shop.phase !== 'prep' && shop.phase !== 'shift' && shop.phase !== 'closing') return;
    const L = OP.L;
    // fingers are less precise than a mouse and hide what they hold
    const T = this.app.touch ? 1.45 : 1;
    // extra margin around stations for fingers; trays sit close together, so only vertically
    const P = this.app.touch ? 14 : 0;
    const inTray = (r) => x >= r.x - 2 && x <= r.x + r.w + 2 && y >= r.y - P && y <= r.y + r.h + P;
    const g = { id, x, y, sx: x, sy: y, lastX: x, lastY: y, moved: 0, type: 'none' };
    this.gestures.set(id, g);
    const drag = (props) => {
      Object.assign(g, { type: 'drag', lift: 0, tilt: 0, oy: this.app.touch ? 56 : 0 }, props);
      OP.sfx('pick');
    };

    for (const rid of ['dough', 'juice'].concat(OP.TRAY_IDS)) {
      if (!shop.unlocked(rid)) continue;
      const p = OP.refillPos(rid);
      if (OP.dist(x, y, p.x, p.y) < 24 * T) {
        shop.refill(rid);
        return;
      }
    }
    if (shop.swatAt(x, y, 40 * T)) return;
    for (const c of shop.customers) {
      if ((c.state === 'fleeing' || c.state === 'smirk') && Math.abs(x - c.x) < 60 * T && y > 200 && y < 420) {
        shop.catchThief(c);
        return;
      }
    }
    if (shop.collectAt(x, y, 40 * T)) {
      g.type = 'coins';
      return;
    }
    if (shop.oven.fault && OP.dist(x, y, L.ovenWrench.x, L.ovenWrench.y) < 38 * T) {
      Object.assign(g, { type: 'fix', eq: 'oven' });
      return;
    }
    if (shop.coffee.fault && OP.dist(x, y, L.coffeeWrench.x, L.coffeeWrench.y) < 38 * T) {
      Object.assign(g, { type: 'fix', eq: 'coffee' });
      return;
    }
    const bi = this.boardAt(x, y);
    if (bi >= 0 && shop.boards[bi]) {
      const c = shop.boards[bi];
      shop.selectedBoard = bi;
      if (c.wrapped) {
        drag({ src: 'board', i: bi });
      } else if (c.bagged) {
        const p = shop.boardCenter(bi);
        Object.assign(g, {
          type: 'wrap',
          i: bi,
          cx: p.x,
          cy: p.y,
          lastA: Math.atan2(y - p.y, x - p.x),
          accum: c.wrap * Math.PI * 2 * this.wrapTurns(),
          near: OP.dist(x, y, p.x, p.y) < 16,
        });
      } else {
        Object.assign(g, { type: 'boardPress', i: bi, minX: x, maxX: x, trail: [] });
      }
      return;
    }
    if (OP.inRect(x, y, L.oven, P)) {
      if (shop.oven.fault && !shop.oven.slots.some((s) => s.state === 'ready' || s.state === 'burnt')) {
        shop.hint('התנור מקולקל! החזיקו לחוץ על המפתח', L.oven.x + 98, L.oven.y - 12);
      } else shop.collectOven();
      return;
    }
    if (OP.inRect(x, y, L.dough, P)) {
      Object.assign(g, { type: 'cut', ax: x, ay: y, trail: [] });
      return;
    }
    if (OP.inRect(x, y, L.basket, P)) {
      if (shop.basket - shop.inFlight('basket') > 0) drag({ src: 'basket' });
      else shop.placeFromBasket(-1);
      return;
    }
    for (const fid of OP.FILLING_IDS) {
      if (!inTray(L.trays[fid])) continue;
      if (!shop.unlocked(fid)) shop.hint('נפתח בחנות השדרוגים', x, y - 30);
      else {
        Object.assign(g, { type: 'spread', fill: fid, dir: 0, run: 0, changes: 0, warned: {} });
        OP.sfx('pick');
      }
      return;
    }
    for (const tid of ['sugar', 'almond']) {
      if (!inTray(L.trays[tid])) continue;
      if (!shop.unlocked(tid)) shop.hint('נפתח בחנות השדרוגים', x, y - 30);
      else drag({ src: 'topping', tid });
      return;
    }
    if (OP.inRect(x, y, L.juice, P)) {
      if (shop.canTakeJuice()) drag({ src: 'juice' });
      else shop.hint(shop.trays.juice.refillT > 0 ? 'ממלאים מיץ…' : 'נגמר המיץ! לחצו על כפתור המילוי', L.juice.x + 55, L.juice.y - 10);
      return;
    }
    if (OP.inRect(x, y, L.coffee, P)) {
      if (!shop.unlocked('coffee')) {
        shop.hint('מכונת קפה נפתחת בחנות השדרוגים', L.coffee.x + 40, L.coffee.y - 10);
        return;
      }
      const ci = shop.coffee.cups.findIndex((cup, i) => cup.ready && Math.abs(x - L.cupX[i]) < 24 * T && y > L.cupY - 50 * T);
      if (ci >= 0) drag({ src: 'cup', cup: ci });
      else shop.startCup();
      return;
    }
    if (OP.inRect(x, y, L.bags, P)) {
      drag({ src: 'bag' });
      return;
    }
    Object.assign(g, { type: 'wipe' });
    shop.wipeAt(x, y);
  }

  pointerMove(id, x, y) {
    this.pointer = { x, y };
    const g = this.gestures.get(id);
    if (!g) {
      this.updateHover(x, y);
      return;
    }
    const shop = this.shop;
    const dx = x - g.lastX;
    g.moved = Math.max(g.moved, OP.dist(x, y, g.sx, g.sy));
    g.x = x;
    g.y = y;
    if (g.trail) {
      g.trail.push({ x, y, t: this.app.t });
      if (g.trail.length > 12) g.trail.shift();
    }
    switch (g.type) {
      case 'drag':
        g.tilt = OP.lerp(g.tilt || 0, OP.clamp(dx * 0.025, -0.45, 0.45), 0.35);
        break;
      case 'cut':
        if (OP.inRect(x, y, OP.L.dough, 24)) {
          if (OP.dist(x, y, g.ax, g.ay) > 80) {
            shop.cutDough();
            g.ax = x;
            g.ay = y;
          }
        } else {
          g.ax = x;
          g.ay = y;
        }
        break;
      case 'boardPress': {
        const c = shop.boards[g.i];
        if (!c) {
          g.type = 'none';
          break;
        }
        g.minX = Math.min(g.minX, x);
        g.maxX = Math.max(g.maxX, x);
        const touch = this.app.touch;
        if (!c.sliced && g.maxX - g.minX > (touch ? 50 : 80) && Math.abs(y - g.sy) < (touch ? 70 : 50)) {
          shop.slice(g.i);
          g.type = 'none';
        } else if (Math.abs(y - g.sy) > 50 || (c.sliced && g.moved > 18)) {
          Object.assign(g, { type: 'drag', src: 'board', lift: 0, tilt: 0, trail: null, oy: this.app.touch ? 56 : 0 });
          OP.sfx('pick');
        }
        break;
      }
      case 'spread': {
        const bi = this.boardAt(x, y);
        const c = bi >= 0 ? shop.boards[bi] : null;
        if (!c || c.bagged) break;
        const s = Math.sign(dx);
        if (s && s !== g.dir) {
          if (g.dir && g.run > 14) g.changes++;
          g.dir = s;
          g.run = 0;
        }
        g.run += Math.abs(dx);
        // on touch any rubbing works; with a mouse it takes a real back-and-forth
        const cap = this.app.touch ? 1 : g.changes >= 2 ? 1 : g.changes === 1 ? 0.7 : 0.35;
        const amt = Math.max(0, Math.min(Math.abs(dx) / (this.app.touch ? 220 : 340), cap - c.spread));
        if (amt <= 0 && c.filling) break;
        const r = shop.spread(bi, g.fill, amt);
        if (r === 'ok' && amt > 0) {
          if (this.app.t - (g.snd || 0) > 0.12) {
            OP.sfx('spread');
            g.snd = this.app.t;
            shop.burst(x, y + 6, OP.FILLINGS[g.fill].color, 1);
          }
        } else if (HINTS[r] && !g.warned[r]) {
          g.warned[r] = 1;
          const p = shop.boardCenter(bi);
          shop.hint(HINTS[r], p.x, p.y - 64);
        }
        break;
      }
      case 'wrap': {
        const c = shop.boards[g.i];
        if (!c || c.wrapped) {
          g.type = 'none';
          break;
        }
        const d = OP.dist(x, y, g.cx, g.cy);
        const a = Math.atan2(y - g.cy, x - g.cx);
        if (d > 16) {
          if (g.near) g.near = false;
          else {
            const da = OP.wrapAngle(a - g.lastA);
            if (Math.abs(da) < 1.3) g.accum += da;
          }
          g.lastA = a;
          shop.wrapTo(g.i, Math.abs(g.accum) / (Math.PI * 2 * this.wrapTurns()));
          if (c.wrapped) g.type = 'none';
        } else g.near = true;
        break;
      }
      case 'wipe':
        shop.wipeAt(x, y);
        shop.collectAt(x, y, 30);
        break;
      case 'coins':
        shop.collectAt(x, y, 40);
        break;
      case 'fix': {
        const p = g.eq === 'oven' ? OP.L.ovenWrench : OP.L.coffeeWrench;
        if (OP.dist(x, y, p.x, p.y) > 70) g.type = 'none';
        break;
      }
    }
    g.lastX = x;
    g.lastY = y;
  }

  pointerUp(id, x, y) {
    const g = this.gestures.get(id);
    if (!g) return;
    this.gestures.delete(id);
    const shop = this.shop;
    const L = OP.L;
    if (g.type === 'wrap') {
      shop.wrapRelease(g.i, !!this.app.touch);
      return;
    }
    const touchTap = this.app.touch && g.moved < 10;
    // touch shortcuts: tap the dough to cut, tap a filling to spread it on the selected croissant
    if (g.type === 'cut' && touchTap) {
      shop.cutDough();
      return;
    }
    if (g.type === 'spread' && touchTap) {
      const i = shop.selectedBoard;
      const b = shop.boards[i];
      if (b && !b.bagged) {
        const r = shop.spread(i, g.fill, 1);
        if (r === 'ok') OP.sfx('spread');
        else if (HINTS[r]) {
          const p = shop.boardCenter(i);
          shop.hint(HINTS[r], p.x, p.y - 64);
        }
      } else shop.hint('בחרו קרואסון ואז לחצו על המילוי', x, y - 40);
      return;
    }
    if (g.type !== 'drag') return;
    const tap = g.moved < 10;
    y -= g.oy || 0;
    const bi = this.boardAt(x, y);
    const cust = this.customerAt(x, y);
    const from = { x, y: y - 10 };
    const warn = (r, i) => {
      if (!HINTS[r]) return;
      const p = shop.boardCenter(i);
      shop.hint(HINTS[r], p.x, p.y - 64);
    };
    let ok = false;
    switch (g.src) {
      case 'basket':
        if (tap) {
          const e = shop.boards.findIndex((b) => !b);
          if (e >= 0) shop.placeFromBasket(e);
          else shop.hint('אין מקום על הקרשים', 700, 540);
          ok = true;
        } else if (bi >= 0 && !shop.boards[bi]) ok = shop.placeFromBasket(bi, from);
        break;
      case 'topping': {
        const target = tap ? shop.selectedBoard : bi;
        if (target >= 0 && shop.boards[target]) {
          const r = shop.addTopping(target, g.tid);
          ok = r === 'ok';
          if (!ok) warn(r, target);
        } else if (tap) shop.hint('גררו את התוספת אל קרואסון', x, y - 40);
        if (tap) ok = true;
        break;
      }
      case 'bag': {
        const target = tap ? shop.selectedBoard : bi;
        if (target >= 0 && shop.boards[target]) {
          const r = shop.applyBag(target);
          ok = r === 'ok';
          if (!ok) warn(r, target);
        } else if (tap) shop.hint('גררו שקית אל קרואסון', x, y - 50);
        if (tap) ok = true;
        break;
      }
      case 'juice':
        if (cust) ok = shop.serve(cust, { kind: 'juice', from }) === 'ok';
        else if (tap) {
          shop.hint('גררו את המיץ אל לקוח', L.juice.x + 55, L.juice.y - 10);
          ok = true;
        }
        break;
      case 'cup':
        if (cust) ok = shop.serve(cust, { kind: 'coffee', cup: g.cup, from }) === 'ok';
        else if (tap) {
          shop.hint('גררו את הקפה אל לקוח', L.coffee.x + 60, L.coffee.y - 10);
          ok = true;
        }
        break;
      case 'board': {
        if (!shop.boards[g.i]) {
          ok = true;
          break;
        }
        if (OP.inRect(x, y, L.trash, 12)) ok = shop.trashBoard(g.i);
        else if (cust) ok = shop.serve(cust, { kind: 'board', i: g.i, from }) === 'ok';
        else if (bi >= 0 && bi !== g.i && !shop.boards[bi]) ok = shop.moveBoard(g.i, bi);
        else if (tap) {
          if (shop.boards[g.i].wrapped) {
            const p = shop.boardCenter(g.i);
            shop.hint('גררו אל הלקוח', p.x, p.y - 64);
          }
          ok = true;
        }
        break;
      }
    }
    if (ok && !tap) OP.sfx('drop');
    else if (!ok) this.snapBack(g, x, y);
  }

  snapBack(g, x, y) {
    const shop = this.shop;
    const L = OP.L;
    const y0 = y - 10;
    OP.sfx('snap');
    switch (g.src) {
      case 'basket':
        shop.fly('croissant', x, y0, L.basket.x + 62, L.basket.y + 30, { to: 'basket', dur: 0.24, arc: 30, s0: 0.9, s1: 0.36 });
        break;
      case 'juice':
        shop.fly('juice', x, y0, L.juice.x + 55, L.juice.y + 50, { to: 'juice', dur: 0.24, arc: 30, s0: 1.05, s1: 0.6 });
        break;
      case 'cup':
        shop.fly('coffee', x, y0, L.cupX[g.cup] || 1180, L.cupY - 6, { to: 'cup' + g.cup, dur: 0.24, arc: 30, s0: 1, s1: 0.7 });
        break;
      case 'bag':
        shop.fly('bag', x, y0, L.bags.x + 46, L.bags.y + 40, { dur: 0.24, arc: 30 });
        break;
      case 'topping': {
        const r = L.trays[g.tid];
        shop.fly('topping', x, y0, r.x + r.w / 2, r.y + 30, { dur: 0.24, arc: 30, data: g.tid });
        break;
      }
      case 'board':
        if (shop.boards[g.i]) {
          const p = shop.boardCenter(g.i);
          shop.fly('wrapped', x, y0, p.x, p.y, { to: 'board' + g.i, dur: 0.24, arc: 30, s0: 1.06, s1: 1.06, data: shop.boards[g.i] });
        }
        break;
    }
  }
};
