// הפיטסרי של אוסקר — the shop simulation for one day (no DOM; runs headless in tests)
var OP = globalThis.OP || (globalThis.OP = {});

OP.Shop = class Shop {
  constructor(save, opts = {}) {
    this.save = save;
    this.opts = opts;
    // versus games share a seed so both players get the same customers and faults
    this.rng = opts.seed != null ? OP.mulberry32(opts.seed) : Math.random;
    this.day = save.day;
    this.t = 0;
    this.phase = opts.skipBanner ? 'prep' : 'banner';
    this.phaseT = 0;
    this.dayLength = Math.min(150 + (this.day - 1) * 12, 300);
    this.time = this.dayLength;
    this.stats = { served: 0, lost: 0, earned: 0, tips: 0, fines: 0, bonus: 0, uncollected: 0, caught: 0, escaped: 0, repStart: save.rep };

    const big = this.up('trays') > 0;
    this.trays = {};
    for (const id of OP.TRAY_IDS) {
      const max = big ? 12 : 8;
      this.trays[id] = { id, max, amount: Math.round(max * 0.25), refillT: 0, dirty: false };
    }
    this.trays.juice = { id: 'juice', max: big ? 9 : 6, amount: 2, refillT: 0, dirty: false };
    this.dough = { max: 8, amount: 8, cuts: 0, refillT: 0, autoT: 0 };
    this.oven = { slots: [], fault: false, smoke: false };
    for (let i = 0; i < (this.up('ovenBig') ? 6 : 4); i++) this.oven.slots.push({ state: 'empty', t: 0 });
    this.coffee = { cups: [], fault: false };
    this.basket = 0;
    this.boards = [null, null, null];
    this.selectedBoard = 0;

    this.spotCount = [3, 4, 5][this.up('counter')];
    this.spots = new Array(this.spotCount).fill(null);
    this.customers = [];
    this.coins = [];
    this.crumbs = [];
    this.flies = [];
    this.fx = [];
    this.flags = {};
    this.fix = { oven: 0, coffee: 0 };
    this.fixing = { oven: 0, coffee: 0 };
    this.spawnT = 1.5;
    this.flyT = OP.rand(14, 24);
    this.vacT = 0;
    this.nextId = 1;
    this.speech = null;
    this.speechQueue = [];
    // presentation-only state (flights, stamps, shake); never affects the rules
    this.flights = [];
    this.stamps = [];
    this.shakeT = 0;
    this.shakeMag = 0;
    this.combo = 0;
    this.oscarMood = null;
    this.coinShown = save.coins;
    // candy thrown by בנימין: pure mess, nothing touches it
    this.candies = [];
    this.candyClock = {};
    // same weather every time a given day is replayed
    this.weather = this.day >= 2 && OP.mulberry32(this.day * 977 + 13)() < 0.3 ? 'rain' : 'clear';

    this.tutorial = this.day === 1 && !save.seen.tutorial && !opts.skipTutorial ? 0 : -1;
    this.tutT = 0;
    if (this.tutorial >= 0) this.oven.fault = true;
    else if (!opts.noFaults && this.rng() < 0.7) {
      if (this.up('coffee') && this.rng() < 0.5) this.coffee.fault = true;
      else this.oven.fault = true;
    }
    this.inspectorAt = -1;
    this.inspectorDone = false;
    if (this.day >= 5 && (this.day === 5 || this.rng() < 0.6)) this.inspectorAt = this.dayLength * (0.3 + this.rng() * 0.4);
  }

  up(id) {
    return this.save.upgrades[id] || 0;
  }
  unlocked(id) {
    if (id === 'choc' || id === 'juice' || id === 'dough') return true;
    return this.up(id) > 0;
  }
  get bakeTime() {
    return [12, 8, 5][this.up('ovenSpeed')] * (this.oven.fault ? 2 : 1);
  }
  get burnGrace() {
    return 8;
  }
  get noBurn() {
    return this.up('thermo') > 0 || this.tutorial >= 0;
  }
  get basketMax() {
    return this.up('basket') ? 12 : 8;
  }
  get cutsNeeded() {
    return this.up('cutter') >= 1 ? 1 : 2;
  }
  get refillTime() {
    return this.up('helper') >= 1 ? 2 : 5;
  }
  get wrapTurns() {
    return this.up('wrapper') >= 1 ? 1.25 : 2;
  }
  get cupMax() {
    return this.up('coffee') >= 2 ? 3 : 2;
  }
  get cupTime() {
    return this.up('coffee') >= 2 ? 2 : 4;
  }
  get fixTime() {
    return this.phase === 'shift' ? 3 : 1.5;
  }
  get flow() {
    let f = 0.7 + this.save.rep * 0.1;
    if (this.up('flyers')) f *= 1.15;
    if (this.up('neon')) f *= 1.15;
    if (this.up('insta')) f *= 1.2;
    return f;
  }

  setPhase(p) {
    this.phase = p;
    this.phaseT = 0;
    if (p === 'done') this.finishDay();
  }

  update(dt) {
    // A co-op guest's mirror only animates between snapshots from the host:
    // no spawning, no phase changes, and no sounds or effects of its own.
    const mirror = !!this.opts.mirror;
    if (mirror) {
      this.quiet = true;
      if (OP.Net) OP.Net.muteSim = true;
    }
    this.t += dt;
    this.phaseT += dt;
    if (!mirror && this.phase === 'banner' && this.phaseT > 2.3) this.setPhase('prep');
    const live = this.phase === 'prep' || this.phase === 'shift' || this.phase === 'closing';
    if (live) {
      this.updateStations(dt);
      this.updateCrumbs(dt);
    }
    if (this.phase === 'shift') {
      if (this.tutorial < 0) this.time -= dt;
      if (!mirror) {
        this.updateSpawning(dt);
        if (this.time <= 0) this.close();
      }
    }
    if (this.phase === 'shift' || this.phase === 'closing') {
      this.updateCustomers(dt);
      this.updateFlies(dt);
    }
    this.updateCoins(dt);
    if (!mirror && this.phase === 'closing' && this.phaseT > 3) this.setPhase('done');
    if (mirror) {
      this.quiet = false;
      if (OP.Net) OP.Net.muteSim = false;
    }
    this.updateFx(dt);
    this.updateCandies(dt);
    this.updateTutorial(dt);
    this.updateSpeech(dt);
  }

  // ---------- day flow ----------
  prepChecks() {
    const trays = OP.TRAY_IDS.concat('juice').filter((id) => this.unlocked(id));
    return {
      equip: !this.oven.fault && !this.coffee.fault,
      bake: this.basket + this.oven.slots.filter((s) => s.state !== 'empty' && s.state !== 'burnt').length >= 3,
      trays: trays.every((id) => this.trays[id].amount >= this.trays[id].max * 0.5 || this.trays[id].refillT > 0),
    };
  }
  openShop() {
    if (this.phase !== 'prep') return false;
    this.setPhase('shift');
    OP.sfx('bell');
    if (this.tutorial < 0) this.say('פתוחים! בואו נאפה!', 2.5);
    return true;
  }
  close() {
    if (this.phase !== 'shift') return;
    this.time = 0;
    this.setPhase('closing');
    OP.sfx('bell');
    for (const c of this.customers) {
      if (c.state === 'waiting' || c.state === 'arriving' || c.state === 'inspecting') this.leave(c, false);
    }
    this.say('סגרנו להיום! אספו מהר את המטבעות האחרונים', 3);
  }
  finishDay() {
    this.stats.uncollected = this.coins.reduce((s, c) => s + c.amount + c.tip, 0);
    this.coins = [];
    this.stats.repEnd = this.save.rep;
    this.save.day = this.day + 1;
    this.save.best = Math.max(this.save.best || 0, this.day);
    if (!this.opts.noSave) OP.writeSave(this.save);
    OP.Audio.setBuzz(false);
  }

  // Presentation only: uses Math.random so versus players' shared rng stays in step,
  // and every co-op player simply sees their own shower of candy.
  updateCandies(dt) {
    const list = this.candies;
    for (let k = list.length - 1; k >= 0; k--) {
      const d = list[k];
      d.t += dt;
      if (d.t > d.life) list.splice(k, 1);
    }
    let throwing = false;
    for (const c of this.customers) {
      if (c.type !== 'binyamin' || c.state !== 'waiting') continue;
      throwing = true;
      const left = (this.candyClock[c.id] = (this.candyClock[c.id] == null ? 0.4 : this.candyClock[c.id]) - dt);
      if (left > 0) continue;
      this.candyClock[c.id] = 0.25 + Math.random() * 0.25;
      if (list.length >= 40) list.shift();
      list.push({
        x0: c.x - 48,
        y0: 214,
        x1: 420 + Math.random() * 760,
        y1: 430 + Math.random() * 240,
        t: 0,
        dur: 0.5 + Math.random() * 0.25,
        life: 10 + Math.random() * 5,
        kind: ['wrap', 'lolly', 'round'][Math.floor(Math.random() * 3)],
        color: ['#ff5fa2', '#ffd23a', '#5fd068', '#6fb7e9', '#ff7a2a', '#b07ce8'][Math.floor(Math.random() * 6)],
        rot: Math.random() * 6,
        spin: (Math.random() - 0.5) * 16,
      });
      if (!this.opts.demo && Math.random() < 0.5) {
        // a local sound: not forwarded to co-op guests, they throw their own
        const rec = OP.Net && OP.Net.recording;
        if (OP.Net) OP.Net.recording = false;
        OP.sfx('pick');
        if (OP.Net) OP.Net.recording = rec;
      }
    }
    // once he got his croissant the candy slowly disappears
    if (!throwing) for (const d of list) d.life = Math.min(d.life, Math.max(d.t, d.dur) + 3);
  }

  // ---------- stations ----------
  updateStations(dt) {
    const bt = this.bakeTime;
    let smoke = false;
    for (const s of this.oven.slots) {
      if (s.state === 'baking') {
        s.t += dt;
        if (s.t >= bt) {
          s.state = 'ready';
          s.t = 0;
          OP.sfx('ding');
          this.tip('ready');
        }
      } else if (s.state === 'ready' && !this.noBurn) {
        s.t += dt;
        if (s.t >= this.burnGrace) {
          s.state = 'burnt';
          s.t = 0;
          OP.sfx('burnt');
          this.react('sad');
          this.tip('burnt');
        }
      } else if (s.state === 'burnt') {
        s.t += dt;
        smoke = true;
      }
    }
    this.oven.smoke = smoke;

    for (const id in this.trays) {
      const tr = this.trays[id];
      if (tr.refillT > 0) {
        tr.refillT -= dt;
        if (tr.refillT <= 0) {
          tr.refillT = 0;
          tr.amount = tr.max;
          tr.dirty = false;
          OP.sfx('refill');
        }
      } else if (this.up('helper') >= 2 && tr.amount === 0 && this.unlocked(id)) {
        this.refill(id);
      }
    }
    const d = this.dough;
    if (d.refillT > 0) {
      d.refillT -= dt;
      if (d.refillT <= 0) {
        d.refillT = 0;
        d.amount = d.max;
        d.cuts = 0;
        OP.sfx('refill');
      }
    } else if (this.up('helper') >= 2 && d.amount === 0) {
      this.refill('dough');
    }
    if (this.up('cutter') >= 2) {
      d.autoT += dt;
      if (d.autoT >= 2.5) {
        d.autoT = 0;
        if (this.freeOvenSlot() >= 0 && d.amount > 0 && d.refillT <= 0) this.makeRaw();
      }
    }

    for (const cup of this.coffee.cups) {
      if (!cup.ready) {
        cup.t += dt;
        if (cup.t >= this.cupTime) {
          cup.ready = true;
          OP.sfx('ding');
        }
      }
    }

    for (const eq of ['oven', 'coffee']) {
      if (!this[eq].fault) continue;
      if (this.fixing[eq] > 0) {
        this.fix[eq] += dt;
        if (this.fix[eq] >= this.fixTime) {
          this[eq].fault = false;
          this.fix[eq] = 0;
          OP.sfx('fix');
          const p = eq === 'oven' ? OP.L.ovenWrench : OP.L.coffeeWrench;
          this.floatText(p.x - 40, p.y + 30, 'תוקן!', '#3bb54a', 1.3, 26, 'check');
          this.react('happy');
        }
      } else {
        this.fix[eq] = Math.max(0, this.fix[eq] - dt * 2);
      }
    }
  }

  refill(id) {
    if (id === 'dough') {
      const d = this.dough;
      if (d.refillT > 0 || d.amount === d.max) return false;
      d.refillT = this.refillTime;
      OP.sfx('click');
      return true;
    }
    const tr = this.trays[id];
    if (!tr || !this.unlocked(id) || tr.refillT > 0) return false;
    if (tr.amount === tr.max && !tr.dirty) return false;
    tr.refillT = this.refillTime;
    OP.sfx('click');
    return true;
  }
  freeOvenSlot() {
    return this.oven.slots.findIndex((s) => s.state === 'empty');
  }
  cutDough() {
    const d = this.dough;
    const r = OP.L.dough;
    if (d.refillT > 0) return 'refilling';
    if (d.amount <= 0) {
      this.hint('נגמר הבצק! לחצו על ⟳', r.x + r.w / 2, r.y - 10);
      this.tip('doughEmpty');
      return 'empty';
    }
    if (this.freeOvenSlot() < 0) {
      this.hint('התנור מלא!', OP.L.oven.x + 98, OP.L.oven.y - 12);
      return 'full';
    }
    d.cuts++;
    OP.sfx('cut');
    this.burst(r.x + r.w / 2 + OP.rand(-40, 40), r.y + 50, '#fff6e0', 5);
    if (d.cuts >= this.cutsNeeded) {
      d.cuts = 0;
      this.makeRaw();
      return 'made';
    }
    return 'cut';
  }
  makeRaw() {
    const i = this.freeOvenSlot();
    if (i < 0) return;
    const s = this.oven.slots[i];
    s.state = 'baking';
    s.t = 0;
    this.dough.amount--;
    const p = OP.ovenSlotPos(this, i);
    const d = OP.L.dough;
    this.fly('raw', d.x + d.w / 2, d.y + 44, p.x, p.y, { to: 'slot' + i, dur: 0.42, arc: 90, s0: 0.3, s1: p.s });
    OP.sfx('pop');
    this.flags.baked = true;
  }
  collectOven() {
    let moved = 0;
    let burnt = 0;
    let full = false;
    const B = OP.L.basket;
    const T = OP.L.trash;
    this.oven.slots.forEach((s, i) => {
      const p = OP.ovenSlotPos(this, i);
      if (s.state === 'ready') {
        if (this.basket < this.basketMax) {
          this.basket++;
          s.state = 'empty';
          s.t = 0;
          this.fly('croissant', p.x, p.y, B.x + 62, B.y + 26, { to: 'basket', dur: 0.55, arc: 120, s0: p.s, s1: 0.36, t: -moved * 0.09 });
          moved++;
        } else full = true;
      } else if (s.state === 'burnt') {
        s.state = 'empty';
        s.t = 0;
        this.fly('burnt', p.x, p.y, T.x + 46, T.y + 20, { dur: 0.75, arc: 170, s0: p.s, s1: 0.3, t: -burnt * 0.09 });
        burnt++;
      }
    });
    const o = OP.L.oven;
    if (moved) {
      OP.sfx('swoosh');
      this.flags.ovenCollected = true;
      this.floatText(o.x + 98, o.y - 10, '+' + moved, '#ffd23a', 1.3, 28, 'croissant');
    }
    if (burnt) {
      OP.sfx('fail');
      this.floatText(o.x + 98, o.y + 30, 'לפח!', '#ff5a3c', 1.3, 26, 'trash');
      this.addCrumbs(300, 470, burnt);
    }
    if (full) this.hint('הסל מלא!', OP.L.basket.x + 62, OP.L.basket.y - 10);
    if (!moved && !burnt && !full) {
      if (this.oven.slots.some((s) => s.state === 'baking')) this.hint('עוד לא מוכן…', o.x + 98, o.y - 12);
      else this.hint('התנור ריק, חתכו בצק!', o.x + 98, o.y - 12);
    }
    return moved;
  }
  startCup() {
    const r = OP.L.coffee;
    if (!this.unlocked('coffee')) return false;
    if (this.coffee.fault) {
      this.hint('מכונת הקפה מקולקלת! החזיקו את המפתח', r.x + 60, r.y - 10);
      return false;
    }
    if (this.coffee.cups.length >= this.cupMax) return false;
    this.coffee.cups.push({ t: 0, ready: false });
    OP.sfx('click');
    return true;
  }
  canTakeJuice() {
    const tr = this.trays.juice;
    return tr.amount > 0 && tr.refillT <= 0;
  }

  // ---------- building a croissant ----------
  newCroissant() {
    return { sliced: false, filling: null, spread: 0, toppings: [], bagged: false, wrap: 0, wrapped: false, quality: 1, flyDirty: false, crinkle: 0 };
  }
  boardCenter(i) {
    const r = OP.L.boards[i];
    return { x: r.x + r.w / 2 - 8, y: r.y + r.h / 2 - 4 };
  }
  placeFromBasket(i, from) {
    if (this.basket <= 0) {
      this.hint('הסל ריק! אפו עוד קרואסונים', OP.L.basket.x + 62, OP.L.basket.y - 10);
      return false;
    }
    if (i < 0 || this.boards[i]) return false;
    this.boards[i] = this.newCroissant();
    this.basket--;
    this.flags.placed = true;
    const bp = this.boardCenter(i);
    const f = from || { x: OP.L.basket.x + 62, y: OP.L.basket.y + 30 };
    this.fly('croissant', f.x, f.y, bp.x, bp.y, { to: 'board' + i, dur: from ? 0.14 : 0.34, arc: from ? 8 : 70, s0: from ? 0.95 : 0.36, s1: 0.95 });
    this.boards[i].born = this.t + (from ? 0.14 : 0.34);
    this.selectedBoard = i;
    OP.sfx('pop');
    return true;
  }
  moveBoard(from, to) {
    if (from === to || !this.boards[from] || this.boards[to]) return false;
    this.boards[to] = this.boards[from];
    this.boards[from] = null;
    this.selectedBoard = to;
    OP.sfx('pop');
    return true;
  }
  slice(i) {
    const c = this.boards[i];
    if (!c || c.sliced || c.bagged) return false;
    c.sliced = true;
    this.flags.sliced = true;
    c.slicedT = this.t;
    this.selectedBoard = i;
    OP.sfx('slice');
    const p = this.boardCenter(i);
    this.addCrumbs(p.x, p.y + 20, 3);
    return true;
  }
  spread(i, fid, amt) {
    const c = this.boards[i];
    if (!c || c.bagged) return 'none';
    if (!c.sliced) return 'notSliced';
    if (c.filling && c.filling !== fid) return 'other';
    if (c.spread >= 1) return 'full';
    const tr = this.trays[fid];
    if (!c.filling) {
      if (tr.refillT > 0) return 'refilling';
      if (tr.amount <= 0) return 'empty';
      tr.amount--;
      c.filling = fid;
      if (tr.amount <= 2) this.tip('trayLow');
    }
    this.selectedBoard = i;
    c.spread = Math.min(1, c.spread + amt);
    if (c.spread >= 1) {
      this.flags.spread = true;
      OP.sfx('pop');
      const p = this.boardCenter(i);
      this.burst(p.x, p.y, OP.FILLINGS[fid].color, 8);
    }
    return 'ok';
  }
  addTopping(i, tid) {
    const c = this.boards[i];
    if (!c || c.bagged) return 'none';
    if (c.toppings.includes(tid)) return 'has';
    const tr = this.trays[tid];
    if (tr.refillT > 0) return 'refilling';
    if (tr.amount <= 0) return 'empty';
    tr.amount--;
    if (tr.amount <= 2) this.tip('trayLow');
    c.toppings.push(tid);
    this.selectedBoard = i;
    OP.sfx('sprinkle');
    const p = this.boardCenter(i);
    this.burst(p.x, p.y - 20, tid === 'sugar' ? '#ffffff' : '#e3b57c', 10);
    return 'ok';
  }
  applyBag(i) {
    const c = this.boards[i];
    if (!c || c.bagged) return 'none';
    if (c.filling && c.spread < 1) return 'unspread';
    c.bagged = true;
    c.wrap = 0;
    this.flags.bagged = true;
    this.selectedBoard = i;
    OP.sfx('crinkle');
    return 'ok';
  }
  wrapTo(i, p) {
    const c = this.boards[i];
    if (!c || !c.bagged || c.wrapped) return;
    c.wrap = OP.clamp(p, 0, 1);
    if (c.wrap - c.crinkle > 0.1 || c.crinkle - c.wrap > 0.1) {
      c.crinkle = c.wrap;
      OP.sfx('crinkle');
    }
    if (c.wrap >= 1) {
      c.wrapped = true;
      this.flags.wrapped = true;
      c.wrappedT = this.t;
      OP.sfx('wrap');
      const q = this.boardCenter(i);
      this.burst(q.x, q.y - 10, '#ffd6e0', 12);
    }
  }
  // keep: touch players may lift the finger mid-wrap without the bag falling apart
  wrapRelease(i, keep) {
    const c = this.boards[i];
    if (!c || !c.bagged || c.wrapped || keep) return;
    if (c.wrap > 0.15 && this.up('wrapper') < 2) {
      c.quality = Math.max(0.2, c.quality - 0.3);
      c.wrap = 0;
      c.crinkle = 0;
      c.fellT = this.t;
      OP.sfx('fail');
      const p = this.boardCenter(i);
      this.addCrumbs(p.x, p.y + 10, 6);
      this.floatText(p.x, p.y - 50, 'התפרק!', '#e0452f');
      this.tip('fallApart');
      this.shake(7);
      this.react('sad');
    } else if (this.up('wrapper') < 2) {
      c.wrap = 0;
      c.crinkle = 0;
    }
  }
  trashBoard(i) {
    if (!this.boards[i]) return false;
    this.boards[i] = null;
    OP.sfx('fail');
    this.floatText(OP.L.trash.x + 46, OP.L.trash.y - 10, 'לפח', '#8a7d70');
    return true;
  }

  // ---------- coins ----------
  dropCoins(x, amount, tip) {
    this.coins.push({ x, y: OP.L.ledgeY, amount, tip, t: 0 });
    OP.sfx('coin');
    this.tip('coins');
  }
  collectCoin(k) {
    const cn = this.coins[k];
    if (!cn) return false;
    this.coins.splice(k, 1);
    const v = cn.amount + cn.tip;
    this.save.coins += v;
    this.stats.earned += cn.amount;
    this.stats.tips += cn.tip;
    this.flags.collected = true;
    OP.sfx('coin');
    this.floatText(cn.x, cn.y - 40, '+' + v, '#ffd23a');
    this.burst(cn.x, cn.y - 10, '#ffd23a', 8);
    const n = OP.clamp(Math.ceil(v / 4), 1, 7);
    const H = OP.L.coinHud;
    const each = Math.floor(v / n);
    for (let k = 0; k < n; k++) {
      const part = k === n - 1 ? v - each * (n - 1) : each;
      this.fly('coin', cn.x + OP.rand(-16, 16), cn.y - 12, H.x, H.y + (OP.hudY || 0), { value: part, dur: 0.62, arc: 60 + Math.random() * 80, t: -k * 0.055, s0: 1, s1: 0.8 });
    }
    return true;
  }
  collectAt(x, y, r = 36) {
    let n = 0;
    for (let k = this.coins.length - 1; k >= 0; k--) {
      if (OP.dist(x, y, this.coins[k].x, this.coins[k].y - 8) < r) {
        this.collectCoin(k);
        n++;
      }
    }
    return n;
  }
  updateCoins(dt) {
    for (const cn of this.coins) cn.t += dt;
    if (this.up('register')) {
      for (let k = this.coins.length - 1; k >= 0; k--) if (this.coins[k].t > 1.2) this.collectCoin(k);
    }
  }

  // ---------- crumbs ----------
  addCrumbs(x, y, n) {
    for (let k = 0; k < n && this.crumbs.length < 40; k++) {
      this.crumbs.push({ x: OP.clamp(x + OP.rand(-50, 50), 200, 1150), y: OP.clamp(y + OP.rand(-10, 30), 440, 646), r: OP.rand(2.5, 5), rot: OP.rand(0, 6.28), shade: Math.random() });
    }
    if (this.crumbs.length > 6 && this.phase === 'shift') this.tip('crumbs');
  }
  wipeAt(x, y, r = 34) {
    const before = this.crumbs.length;
    this.crumbs = this.crumbs.filter((c) => OP.dist(x, y, c.x, c.y) > r);
    const n = before - this.crumbs.length;
    if (n) OP.sfx('spread');
    return n;
  }
  updateCrumbs(dt) {
    if (!this.up('vacuum') || !this.crumbs.length) return;
    this.vacT += dt;
    if (this.vacT > 2.5) {
      this.vacT = 0;
      this.crumbs.shift();
    }
  }
  addRep(d) {
    this.save.rep = OP.clamp(this.save.rep + d, 0.5, 5);
  }

  // ---------- presentation hooks ----------
  fly(kind, x0, y0, x1, y1, o = {}) {
    if (this.quiet) return;
    this.flights.push(Object.assign({ kind, x0, y0, x1, y1, t: 0, dur: 0.45, arc: 80, s0: 1, s1: 1, to: null, value: 0 }, o));
  }
  inFlight(to) {
    let n = 0;
    for (const f of this.flights) if (f.to === to) n++;
    return n;
  }
  shake(mag, dur = 0.32) {
    if (this.quiet) return;
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeT = Math.max(this.shakeT, dur);
  }
  stamp(x, y, text, color, icon) {
    if (this.quiet) return;
    this.stamps.push({ x, y, text, color, icon, t: 0 });
    OP.sfx('stamp');
  }
  react(mood, dur = 1.6) {
    if (this.quiet) return;
    this.oscarMood = { mood, t: 0, dur };
  }

  // ---------- effects, speech, tutorial ----------
  floatText(x, y, text, color = '#fff', life = 1.3, size = 26, icon = null) {
    if (this.quiet) return;
    this.fx.push({ type: 'text', x, y, text, color, t: 0, life, size, icon });
  }
  hint(text, x = 640, y = 380) {
    if (this._hint === text && this.t - this._hintT < 1.2) return;
    this._hint = text;
    this._hintT = this.t;
    this.floatText(x, y, text, '#ff5a3c', 1.5, 22);
  }
  burst(x, y, color, n = 10) {
    if (this.quiet) return;
    for (let k = 0; k < n; k++) {
      this.fx.push({ type: 'p', x, y, vx: OP.rand(-150, 150), vy: OP.rand(-260, -60), g: 700, color, size: OP.rand(3, 7), t: 0, life: OP.rand(0.45, 0.85) });
    }
  }
  updateFx(dt) {
    for (let k = this.flights.length - 1; k >= 0; k--) {
      const f = this.flights[k];
      f.t += dt;
      if (f.t >= f.dur) {
        this.flights.splice(k, 1);
        if (f.kind === 'coin') OP.sfx('coinLand');
        else if (f.kind === 'croissant') this.burst(f.x1, f.y1, '#ffe2a8', 4);
        else if (f.kind === 'burnt') this.burst(f.x1, f.y1, '#5a3620', 6);
      }
    }
    for (let k = this.stamps.length - 1; k >= 0; k--) {
      this.stamps[k].t += dt;
      if (this.stamps[k].t > 1.5) this.stamps.splice(k, 1);
    }
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (!this.shakeT) this.shakeMag = 0;
    if (this.oscarMood) {
      this.oscarMood.t += dt;
      if (this.oscarMood.t > this.oscarMood.dur) this.oscarMood = null;
    }
    let pending = 0;
    for (const f of this.flights) if (f.kind === 'coin') pending += f.value;
    const target = this.save.coins - pending;
    this.coinShown += (target - this.coinShown) * Math.min(1, dt * 12);
    if (Math.abs(target - this.coinShown) < 0.5) this.coinShown = target;
    for (let k = this.fx.length - 1; k >= 0; k--) {
      const e = this.fx[k];
      e.t += dt;
      if (e.type === 'p') {
        e.vy += e.g * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }
      if (e.t >= e.life) this.fx.splice(k, 1);
    }
  }
  say(text, dur = 4) {
    if (this.quiet) return;
    this.speech = { text, t: 0, dur };
  }
  tip(id) {
    if (this.quiet || this.tutorial >= 0 || this.opts.demo || this.save.seen[id] || !OP.TIPS[id]) return;
    this.save.seen[id] = 1;
    this.speechQueue.push(OP.TIPS[id]);
  }
  updateSpeech(dt) {
    if (this.speech) {
      this.speech.t += dt;
      if (this.speech.dur > 0 && this.speech.t > this.speech.dur) this.speech = null;
    }
    if (this.tutorial < 0 && (!this.speech || this.speech.t > 1.5) && this.speechQueue.length) {
      this.say(this.speechQueue.shift(), 5);
    }
  }
  updateTutorial(dt) {
    if (this.tutorial < 0 || this.phase === 'banner') return;
    const step = OP.TUTORIAL[this.tutorial];
    if (!step) return this.endTutorial();
    if (step.done(this)) {
      this.tutorial++;
      this.tutT = 0;
      if (this.tutorial >= OP.TUTORIAL.length) this.endTutorial();
      return;
    }
    // Opened the shop before finishing the prep steps: jump to the first shift step.
    if (step.phase === 'prep' && this.phase !== 'prep') {
      this.tutorial = OP.TUTORIAL.findIndex((s) => s.phase === 'shift');
      return;
    }
    if (step.phase !== this.phase) return;
    this.tutT += dt;
    if (!this.speech || this.speech.tut !== this.tutorial) this.speech = { text: step.text, t: 0, dur: 0, tut: this.tutorial };
  }
  endTutorial() {
    this.tutorial = -1;
    this.save.seen.tutorial = 1;
    this.speech = null;
    this.spawnT = 2;
  }
};
