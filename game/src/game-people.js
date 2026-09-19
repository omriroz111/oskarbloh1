// הפיטסרי של אוסקר — customers, orders, payment, thieves, VIPs, inspector, flies
var OP = globalThis.OP || (globalThis.OP = {});

Object.assign(OP.Shop.prototype, {
  spotX(i) {
    const xs = { 3: [540, 730, 920], 4: [500, 650, 800, 950], 5: [480, 605, 730, 855, 980] };
    return xs[this.spotCount][i];
  },

  updateSpawning(dt) {
    if (this.tutorial >= 0) {
      if (this.tutorial >= 5 && !this.tutCustomer) {
        this.tutCustomer = this.spawnCustomer({ tutorial: true, order: [{ kind: 'croissant', filling: 'choc', toppings: [] }] });
      }
      return;
    }
    if (this.time < 8) return;
    if (this.inspectorAt > 0 && !this.inspectorDone && this.time <= this.inspectorAt) {
      if (this.spawnCustomer({ type: 'inspector' })) this.inspectorDone = true;
    }
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      const base = OP.clamp(9.5 - this.day * 0.35, 3.8, 9.5) / this.flow;
      this.spawnT = base * (0.75 + this.rng() * 0.5);
      this.spawnCustomer({});
    }
  },

  makeOrder(type) {
    // בנימין only wants a plain croissant, and then he goes away
    if (type === 'binyamin') return [{ kind: 'croissant', filling: null, toppings: [] }];
    const fills = OP.FILLING_IDS.filter((f) => this.unlocked(f));
    const tops = ['sugar', 'almond'].filter((t) => this.unlocked(t));
    const drinks = ['juice'];
    if (this.unlocked('coffee')) drinks.push('coffee', 'coffee');
    const rng = this.rng;
    const pick = (a) => a[Math.floor(rng() * a.length)];
    let n = this.day >= 3 && rng() < 0.25 ? 2 : 1;
    if (type === 'vip') n = rng() < 0.5 ? 2 : 1;
    if (type === 'dvir') n = rng() < 0.5 ? 4 : 3;
    const order = [];
    for (let k = 0; k < n; k++) {
      const filling = rng() < 0.25 ? null : pick(fills);
      const toppings = tops.filter(() => rng() < 0.35);
      order.push({ kind: 'croissant', filling, toppings });
    }
    const drinkChance = type === 'vip' ? 1 : this.day === 1 ? 0.25 : 0.4;
    if (type === 'dvir') order.push({ kind: pick(drinks), toppings: [] });
    else if (order.length < 2 || rng() < 0.3) {
      if (rng() < drinkChance) order.push({ kind: pick(drinks), toppings: [] });
    }
    return order;
  },

  spawnCustomer(o) {
    const free = [];
    this.spots.forEach((s, i) => {
      if (!s) free.push(i);
    });
    if (!free.length) {
      this.spawnT = Math.min(this.spawnT, 1);
      return null;
    }
    const mid = Math.floor(this.spotCount / 2);
    const spot = o.tutorial && free.includes(mid) ? mid : OP.pick(free);
    let type = o.type || 'normal';
    if (type === 'normal' && !o.tutorial && !o.order) {
      const r = this.rng();
      const vip = this.day >= 4 ? 0.08 * (this.up('insta') ? 2 : 1) : 0;
      const thief = this.day >= 3 ? 0.12 : 0;
      const dvir = this.day >= 2 && !this.dvirDone ? 0.05 : 0;
      const binyamin = this.day >= 2 && !this.binyaminDone ? 0.05 : 0;
      if (r < vip) type = 'vip';
      else if (r < vip + thief) type = 'thief';
      else if (r < vip + thief + dvir) type = 'dvir';
      else if (r < vip + thief + dvir + binyamin) type = 'binyamin';
    }
    const order = (o.order || (type === 'inspector' ? [] : this.makeOrder(type))).map((l) =>
      Object.assign({ done: false, quality: 1, price: 0 }, l, { toppings: (l.toppings || []).slice() })
    );
    let pm = OP.clamp(46 - this.day * 0.8, 30, 46) + Math.max(0, order.length - 1) * 10;
    if (type === 'vip') pm *= 0.8;
    if (type === 'dvir') pm *= 1.15;
    if (type === 'binyamin') pm *= 1.3;
    const tx = this.spotX(spot);
    const c = {
      id: this.nextId++,
      spot,
      type,
      order,
      patience: pm,
      patienceMax: pm,
      x: tx < 700 ? 250 : 1110,
      tx,
      state: 'arriving',
      stateT: 0,
      look: OP.makeLook(type, this.rng),
      mood: 'happy',
      bounce: 0,
      shake: 0,
      walk: 0,
      tutorial: !!o.tutorial,
      inspectT: 12,
      inspectMax: 12,
      pay: 0,
      tip: 0,
    };
    this.spots[spot] = c;
    this.customers.push(c);
    if (!this.opts.demo) OP.sfx('doorbell');
    if (type === 'vip') this.tip('vip');
    if (type === 'dvir') {
      this.dvirDone = true; // at most one visit a day
      this.tip('dvir');
      OP.sfx('combo');
      this.floatText(tx, 180, 'דביר הגיע!', '#ff8a3a', 2, 28);
    }
    if (type === 'binyamin') {
      this.binyaminDone = true; // at most one visit a day
      this.tip('binyamin');
      OP.sfx('whistle');
      this.floatText(tx, 180, 'בנימין הגיע!', '#ff5fa2', 2, 28);
    }
    if (type === 'inspector') {
      this.tip('inspector');
      OP.sfx('whistle');
      this.floatText(tx, 180, 'ביקורת תברואה!', '#ff5a3c', 2, 28);
    }
    return c;
  },

  updateCustomers(dt) {
    const flyLanded = this.flies.some((f) => f.state === 'landed');
    const decay = (flyLanded ? 1.6 : 1) * (this.oven.smoke ? 1.4 : 1);
    for (let k = this.customers.length - 1; k >= 0; k--) {
      const c = this.customers[k];
      c.stateT += dt;
      c.bounce = Math.max(0, c.bounce - dt);
      c.shake = Math.max(0, c.shake - dt);
      switch (c.state) {
        case 'arriving': {
          c.walk += dt;
          const d = c.tx - c.x;
          c.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt);
          if (Math.abs(c.tx - c.x) < 1) {
            c.state = c.type === 'inspector' ? 'inspecting' : 'waiting';
            c.stateT = 0;
            if (c.order.some((l) => l.kind === 'juice')) this.tip('juice');
            if (c.order.some((l) => l.kind === 'coffee')) this.tip('coffee');
            if (c.order.some((l) => l.filling === 'pist' || l.filling === 'vanilla' || l.filling === 'cream')) this.tip('newFilling');
          }
          break;
        }
        case 'waiting': {
          if (!c.tutorial) c.patience -= dt * decay;
          const r = c.patience / c.patienceMax;
          if (flyLanded && Math.sin(this.t * 2.5 + c.id) > 0.2) c.mood = 'gross';
          else c.mood = r > 0.6 ? 'happy' : r > 0.3 ? 'worried' : 'angry';
          if (c.patience <= 0) {
            this.stats.lost++;
            this.addRep(-0.3);
            OP.sfx('angry');
            this.floatText(c.x, 220, 'אני הולך!', '#ff5a3c');
            this.tip('patience');
            this.leave(c, true);
            this.combo = 0;
            this.shake(5);
            this.react('sad');
          }
          break;
        }
        case 'inspecting':
          c.inspectT -= dt;
          c.mood = 'worried';
          if (c.inspectT <= 0) this.inspect(c);
          break;
        case 'paid':
          if (c.stateT > 0.9) this.leave(c, false);
          break;
        case 'smirk':
          if (c.stateT > 0.7) {
            c.state = 'fleeing';
            c.stateT = 0;
            c.fleeDir = c.x < 730 ? -1 : 1;
            if (this.spots[c.spot] === c) this.spots[c.spot] = null;
            this.tip('thief');
            if (this.up('alarm')) OP.sfx('alarm');
          }
          break;
        case 'fleeing':
          c.walk += dt * 2;
          c.x += c.fleeDir * (this.up('alarm') ? 115 : 190) * dt;
          if (c.x < 250 || c.x > 1110) {
            this.stats.escaped++;
            this.addRep(-0.1);
            this.floatText(c.fleeDir < 0 ? 460 : 1000, 250, 'הגנב ברח!', '#ff5a3c');
            OP.sfx('angry');
            this.shake(6);
            this.react('sad');
            this.remove(c);
          }
          break;
        case 'caught':
          if (c.stateT > 1) this.leave(c, false);
          break;
        case 'leaving':
          c.walk += dt;
          c.x += c.leaveDir * 250 * dt;
          if (c.x < 240 || c.x > 1120) this.remove(c);
          break;
      }
    }
  },

  leave(c, angry) {
    c.state = 'leaving';
    c.stateT = 0;
    c.leaveDir = c.x < 730 ? -1 : 1;
    if (this.spots[c.spot] === c) this.spots[c.spot] = null;
    if (angry) c.mood = 'angry';
  },
  remove(c) {
    const k = this.customers.indexOf(c);
    if (k >= 0) this.customers.splice(k, 1);
    if (this.spots[c.spot] === c) this.spots[c.spot] = null;
  },

  itemMatches(line, item) {
    if (line.done || line.kind !== item.kind) return false;
    if (item.kind !== 'croissant') return true;
    const c = item.c;
    const fill = c.spread >= 1 ? c.filling : null;
    if ((line.filling || null) !== fill) return false;
    if (line.toppings.length !== c.toppings.length) return false;
    return line.toppings.every((t) => c.toppings.includes(t));
  },
  linePrice(l) {
    if (l.kind === 'juice') return 3 + this.up('orange') * 2;
    if (l.kind === 'coffee') return 5;
    let p = 6 + this.up('butter') * 2;
    if (l.filling) p += 3 + (l.filling === 'choc' ? this.up('choc') * 3 : 0) + (l.filling === 'cream' ? 2 : 0);
    return p + l.toppings.length * 2;
  },

  // src: {kind:'board', i} | {kind:'juice'} | {kind:'coffee', cup}
  serve(c, src) {
    if (!c || c.state !== 'waiting') return 'no';
    let item;
    if (src.kind === 'board') {
      const b = this.boards[src.i];
      if (!b) return 'no';
      if (!b.wrapped) {
        this.hint('קודם עוטפים בשקית!', c.x, 230);
        return 'unwrapped';
      }
      item = { kind: 'croissant', c: b };
    } else if (src.kind === 'juice') {
      if (!this.canTakeJuice()) return 'no';
      item = { kind: 'juice' };
    } else if (src.kind === 'coffee') {
      const cup = this.coffee.cups[src.cup];
      if (!cup || !cup.ready) return 'no';
      item = { kind: 'coffee' };
    } else return 'no';

    const line = c.order.find((l) => this.itemMatches(l, item));
    if (!line) {
      OP.sfx('wrong');
      c.shake = 0.5;
      this.shake(3, 0.2);
      this.floatText(c.x, 230, 'זה לא מה שהזמנתי!', '#ff5a3c');
      this.tip('wrongOrder');
      return 'wrong';
    }
    line.done = true;
    line.quality = item.kind === 'croissant' ? item.c.quality : 1;
    line.price = this.linePrice(line);
    const from =
      src.from ||
      (src.kind === 'board'
        ? this.boardCenter(src.i)
        : src.kind === 'juice'
          ? { x: OP.L.juice.x + 55, y: OP.L.juice.y + 50 }
          : { x: OP.L.cupX[src.cup] || 1180, y: OP.L.cupY });
    this.fly(src.kind === 'board' ? 'wrapped' : src.kind, from.x, from.y, c.x, 350, {
      dur: 0.26,
      arc: 40,
      s0: 1,
      s1: 0.6,
      data: src.kind === 'board' ? this.boards[src.i] : null,
    });
    if (src.kind === 'board') this.boards[src.i] = null;
    else if (src.kind === 'juice') this.trays.juice.amount--;
    else this.coffee.cups.splice(src.cup, 1);
    OP.sfx('pop');
    c.bounce = 0.4;
    this.flags.served = true;
    if (c.order.every((l) => l.done)) this.customerComplete(c);
    return 'ok';
  },

  customerComplete(c) {
    const base = c.order.reduce((s, l) => s + l.price, 0);
    const q = c.order.reduce((s, l) => s + l.quality, 0) / c.order.length;
    const pr = OP.clamp(c.patience / c.patienceMax, 0, 1);
    const tipRate = (0.25 + (this.up('neon') ? 0.1 : 0)) * (this.up('paper') ? 2 : 1);
    let tip = base * tipRate * pr * q * (this.save.rep / 3);
    let total = base * (0.5 + 0.5 * q);
    if (c.type === 'vip') {
      if (c.order.every((l) => l.quality >= 0.95)) {
        total *= 3;
        tip *= 2;
        this.addRep(0.2);
        this.floatText(c.x, 200, 'VIP ×3', '#ffcf3a', 1.8, 30, 'star');
      } else {
        this.addRep(-0.2);
        this.floatText(c.x, 200, 'לא מושלם…', '#ff5a3c');
      }
    } else {
      this.addRep(q >= 0.9 ? (this.up('paper') ? 0.08 : 0.04) : -0.05);
    }
    if (c.type === 'dvir' && q >= 0.8) {
      tip *= 1.6;
      this.floatText(c.x, 200, 'דביר שבע!', '#ff8a3a', 1.8, 30, 'heart');
    }
    c.pay = Math.max(1, Math.round(total));
    c.tip = Math.round(tip);
    c.quality = q;
    this.stats.served++;
    if (q >= 0.9 && !(c.type === 'vip' && q < 0.95)) {
      this.combo++;
      if (this.combo >= 2) {
        c.tip = Math.round(c.tip * (1 + 0.15 * Math.min(this.combo - 1, 4)));
        this.floatText(c.x, 168, 'רצף ×' + this.combo, '#ff8ad0', 1.6, 30, 'heart');
        OP.sfx('combo');
        this.tip('combo');
      }
    } else this.combo = 0;
    const rating = q >= 0.95 ? ['מושלם!', '#f5b400', 'star'] : q >= 0.8 ? ['יפה!', '#3bb54a', 'check'] : ['בסדר…', '#9a8a7a', null];
    this.stamp(c.x, 252, rating[0], rating[1], rating[2]);
    this.react(q >= 0.9 ? 'happy' : 'sad');
    if (c.type === 'thief') {
      c.state = 'smirk';
      c.stateT = 0;
      return;
    }
    this.dropCoins(c.x, c.pay, c.tip);
    c.state = 'paid';
    c.stateT = 0;
    c.mood = q >= 0.9 && !(c.type === 'vip' && q < 0.95) ? 'happy' : 'worried';
    if (q >= 0.9) OP.sfx('happy');
  },

  catchThief(c) {
    if (c.state !== 'fleeing' && c.state !== 'smirk') return false;
    if (this.spots[c.spot] === c) this.spots[c.spot] = null;
    c.state = 'caught';
    c.stateT = 0;
    c.mood = 'angry';
    const x = OP.clamp(c.x, 420, 1060);
    this.dropCoins(x, Math.round(c.pay * 1.5), c.tip);
    this.stats.caught++;
    OP.sfx('caught');
    this.stamp(x, 250, 'נתפס!', '#4a7fd4', 'badge');
    return true;
  },

  isClean() {
    return (
      this.crumbs.length === 0 &&
      !this.flies.some((f) => f.state === 'landed') &&
      !this.oven.slots.some((s) => s.state === 'burnt') &&
      !Object.values(this.trays).some((t) => t.dirty)
    );
  },
  inspect(c) {
    if (this.isClean()) {
      this.save.coins += 40;
      this.stats.bonus += 40;
      this.addRep(0.2);
      this.floatText(c.x, 200, 'מטבח מבריק! +40', '#3bb54a', 2, 28);
      this.stamp(c.x, 252, 'נקי!', '#3bb54a', 'check');
      OP.sfx('happy');
      c.mood = 'happy';
    } else {
      const fine = Math.min(60, this.save.coins);
      this.save.coins -= fine;
      this.stats.fines += fine;
      this.addRep(-0.3);
      this.floatText(c.x, 200, 'קנס! -' + fine, '#ff5a3c', 2, 28);
      this.stamp(c.x, 252, 'מלוכלך!', '#e0453a', 'receipt');
      this.shake(6);
      OP.sfx('angry');
      c.mood = 'angry';
    }
    c.state = 'paid';
    c.stateT = 0;
  },

  // ---------- flies ----------
  flyTargets() {
    const L = OP.L;
    const t = [];
    for (const id of OP.TRAY_IDS) {
      if (!this.unlocked(id) || this.trays[id].amount <= 0) continue;
      const r = L.trays[id];
      t.push({ kind: 'tray', id, x: r.x + r.w / 2 + OP.rand(-18, 18), y: r.y + r.h / 2 + OP.rand(-8, 8) });
    }
    this.boards.forEach((b, i) => {
      if (b && !b.wrapped) {
        const p = this.boardCenter(i);
        t.push({ kind: 'board', i, x: p.x + OP.rand(-25, 25), y: p.y - 10 });
      }
    });
    if (this.basket > 0) t.push({ kind: 'basket', x: L.basket.x + 62, y: L.basket.y + 36 });
    return t;
  },
  spawnFly() {
    const targets = this.flyTargets();
    if (!targets.length) return null;
    const tg = OP.pick(targets);
    const f = { x: OP.rand(380, 1000), y: -30, tx: tg.x, ty: tg.y, target: tg, state: 'flying', t: 0, landT: 0, vy: 0, life: 0 };
    this.flies.push(f);
    this.tip('fly');
    return f;
  },
  retarget(f) {
    const targets = this.flyTargets();
    if (!targets.length) return this.flyAway(f);
    const tg = OP.pick(targets);
    Object.assign(f, { target: tg, tx: tg.x, ty: tg.y, state: 'flying', landT: 0 });
  },
  flyAway(f) {
    f.state = 'leaving';
    f.tx = f.x < 640 ? -80 : 1360;
    f.ty = OP.rand(-40, 120);
  },
  swat(f, auto) {
    if (f.state === 'dead') return false;
    f.state = 'dead';
    f.vy = -140;
    f.life = 0.8;
    OP.sfx('swat');
    this.floatText(f.x, f.y - 24, auto ? 'זזזפ!' : 'בום!', '#fff3a0', 1, 24, auto ? 'bolt' : null);
    this.shake(2, 0.12);
    return true;
  },
  swatAt(x, y, r = 40) {
    for (const f of this.flies) {
      if (f.state !== 'dead' && OP.dist(x, y, f.x, f.y) < r) return this.swat(f, false);
    }
    return false;
  },
  updateFlies(dt) {
    if (this.phase === 'shift' && this.day >= 2 && this.tutorial < 0 && !this.opts.mirror) {
      this.flyT -= dt * (this.crumbs.length > 10 ? 1.8 : 1) * (this.up('flytrap') ? 0.5 : 1);
      if (this.flyT <= 0) {
        this.flyT = OP.rand(20, 36);
        if (this.flies.filter((f) => f.state !== 'dead').length < 2) this.spawnFly();
      }
    }
    for (let k = this.flies.length - 1; k >= 0; k--) {
      const f = this.flies[k];
      f.t += dt;
      if (f.state === 'dead') {
        f.vy += 900 * dt;
        f.y += f.vy * dt;
        f.life -= dt;
        if (f.life <= 0) this.flies.splice(k, 1);
        continue;
      }
      if (this.phase === 'closing' && f.state !== 'leaving') this.flyAway(f);
      if (f.state === 'flying' || f.state === 'leaving') {
        const dx = f.tx - f.x;
        const dy = f.ty - f.y;
        const d = Math.hypot(dx, dy);
        const sp = 170 * dt;
        if (d < sp + 2) {
          if (f.state === 'leaving') {
            this.flies.splice(k, 1);
            continue;
          }
          f.x = f.tx;
          f.y = f.ty;
          f.state = 'landed';
          f.landT = 0;
        } else {
          f.x += (dx / d) * sp + Math.cos(f.t * 9) * 60 * dt;
          f.y += (dy / d) * sp + Math.sin(f.t * 13) * 80 * dt;
        }
      } else if (f.state === 'landed') {
        f.landT += dt;
        const tg = f.target;
        if (tg.kind === 'board') {
          const b = this.boards[tg.i];
          if (!b || b.wrapped) {
            this.retarget(f);
            continue;
          }
          if (f.landT > 4 && !b.flyDirty) {
            b.flyDirty = true;
            b.quality = Math.max(0.2, b.quality - 0.4);
            this.floatText(f.x, f.y - 30, 'איכס!', '#5f9e3a');
          }
        } else if (tg.kind === 'tray') {
          const tr = this.trays[tg.id];
          if (tr.amount <= 0 && !tr.dirty) {
            this.retarget(f);
            continue;
          }
          if (f.landT > 6 && !tr.dirty) {
            tr.dirty = true;
            tr.amount = 0;
            this.floatText(f.x, f.y - 30, 'המגש התלכלך!', '#5f9e3a');
            this.tip('dirtyTray');
          }
        } else if (tg.kind === 'basket' && this.basket <= 0) {
          this.retarget(f);
          continue;
        }
        if (this.up('flytrap') && f.landT > 3) {
          this.swat(f, true);
          continue;
        }
        if (f.landT > 9) this.retarget(f);
      }
    }
    OP.Audio.setBuzz(this.flies.some((f) => f.state !== 'dead') && this.phase !== 'done');
  },
});
