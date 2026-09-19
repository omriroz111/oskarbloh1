// הפיטסרי של אוסקר — multiplayer for any number of players: hosting, joining, co-op mirroring, versus rounds
var OP = globalThis.OP || (globalThis.OP = {});

// Shop methods a guest may trigger on the host's shop (anything else is ignored).
OP.NET_ACTIONS = ['refill', 'cutDough', 'collectOven', 'startCup', 'placeFromBasket', 'moveBoard', 'slice', 'spread', 'addTopping', 'applyBag', 'wrapTo', 'wrapRelease', 'trashBoard', 'collectAt', 'wipeAt', 'swatAt', 'catchThief', 'serve', 'openShop'];
OP.NET_EVENTS = ['floatText', 'burst', 'stamp', 'fly', 'shake', 'react'];
OP.NET_PORT = 47777;
OP.VS_ROUNDS = 3;

OP.allSeen = () => {
  const s = { tutorial: 1, intro: 1 };
  for (const k in OP.TIPS) s[k] = 1;
  return s;
};

// Co-op has its own shared bakery, kept on the host, separate from everyone's personal game.
OP.COOP_KEY = 'oscarPastry.coop.v1';
OP.newCoopSave = () => ({ day: 1, coins: 0, rep: 3, upgrades: {}, seen: OP.allSeen(), best: 0 });
OP.loadCoopSave = () => {
  try {
    const s = JSON.parse(localStorage.getItem(OP.COOP_KEY));
    if (s && s.day) return Object.assign(OP.newCoopSave(), s, { seen: OP.allSeen() });
  } catch (e) {}
  return null;
};
OP.writeCoopSave = (s) => {
  try {
    localStorage.setItem(OP.COOP_KEY, JSON.stringify(s));
  } catch (e) {}
};
OP.clearCoopSave = () => {
  try {
    localStorage.removeItem(OP.COOP_KEY);
  } catch (e) {}
};

// versus: every player starts the match with the same kitchen and a small budget
OP.versusSave = () => ({ day: 3, coins: 150, rep: 3, upgrades: { cutter: 1, sugar: 1, pist: 1 }, seen: OP.allSeen(), best: 0 });

OP.PLAYER_COLORS = ['#f59a23', '#4a90d9', '#e5534b', '#58b368', '#9b6bd3', '#ee7fb0', '#3fb6b0', '#c98a3b'];

OP.Net = {
  ws: null,
  role: null,
  mode: null,
  status: 'idle',
  peer: false,
  pid: 0,
  pids: [],
  hostPid: 0,
  info: null,
  error: null,
  hosting: null,
  actor: 'host',
  recording: false,
  muteSim: false,
  evq: [],
  attempts: 0,

  canHost() {
    return typeof window !== 'undefined' && !!window.oscarHost;
  },
  get count() {
    return Math.max(1, this.pids.length);
  },
  // players are numbered by the order they joined; the host is always player 1
  nameOf(pid) {
    if (pid === this.hostPid) return 'המארח';
    const i = this.pids.indexOf(pid);
    return 'שחקן ' + (i >= 0 ? i + 1 : pid);
  },
  colorOf(pid) {
    const i = this.pids.indexOf(pid);
    return OP.PLAYER_COLORS[(i >= 0 ? i : pid) % OP.PLAYER_COLORS.length];
  },

  reset() {
    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.close();
      } catch (e) {}
    }
    Object.assign(this, { ws: null, role: null, mode: null, status: 'idle', peer: false, pid: 0, pids: [], hostPid: 0, info: null, error: null, hosting: null, recording: false, evq: [], attempts: 0 });
  },

  async host(mode) {
    this.reset();
    this.role = 'host';
    this.mode = mode;
    this.status = 'starting';
    const r = await window.oscarHost.host();
    if (!r.ok) return this.fail('לא הצלחתי לפתוח שרת: ' + r.error);
    this.hosting = { port: r.port, lan: r.lan || [], code: null, tunnel: 'starting' };
    this.connect(`ws://127.0.0.1:${r.port}`, 3);
    const t = await window.oscarHost.tunnel();
    if (!this.hosting) return;
    if (t.ok) {
      const hosting = this.hosting;
      hosting.code = t.url.replace(/^https:\/\//, '').replace(/\.trycloudflare\.com.*$/, '');
      hosting.tunnel = 'checking';
      const c = await window.oscarHost.tunnelCheck();
      // the code stays usable either way; 'slow' only means we could not confirm it yet
      if (this.hosting === hosting) hosting.tunnel = c.ok && c.reachable ? 'ready' : 'slow';
    } else {
      this.hosting.tunnel = 'error';
      this.hosting.tunnelError = t.error;
    }
  },

  urlForCode(code) {
    const raw = String(code || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!raw) return null;
    if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(raw)) return 'ws://' + (raw.includes(':') ? raw : raw + ':' + OP.NET_PORT);
    const name = raw.replace(/^(wss?|https?):\/\//, '').replace(/\.trycloudflare\.com.*$/, '').replace(/\/.*$/, '');
    if (!/^[a-z0-9-]+$/.test(name)) return null;
    return 'wss://' + name + '.trycloudflare.com';
  },

  join(code) {
    const url = this.urlForCode(code);
    if (!url) return this.fail('הקוד לא נראה נכון');
    this.reset();
    this.role = 'guest';
    this.status = 'connecting';
    // a freshly opened tunnel can take a couple of minutes to become reachable
    this.connect(url, url.startsWith('wss://') ? 80 : 6);
  },

  connect(url, retries) {
    let ws;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      return this.fail('כתובת לא תקינה');
    }
    this.ws = ws;
    ws.onopen = () => {
      this.attempts = 0;
      if (this.status === 'connecting' || this.status === 'starting') this.status = 'lobby';
    };
    ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      this.handle(msg);
    };
    ws.onerror = () => {};
    ws.onclose = () => {
      if (this.ws !== ws) return;
      if ((this.status === 'connecting' || this.status === 'starting') && this.attempts < retries) {
        this.attempts++;
        setTimeout(() => {
          if (this.ws === ws) this.connect(url, retries);
        }, 1500);
        return;
      }
      if (this.status === 'connecting' || this.status === 'starting') return this.fail('לא הצלחתי להתחבר. בדקו את הקוד ושהשרת פתוח');
      if (this.status !== 'idle' && this.status !== 'error') this.lost();
    };
  },

  send(obj) {
    obj.from = this.pid;
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
  },
  fail(msg) {
    this.error = msg;
    this.status = 'error';
    OP.sfx('wrong');
  },
  lost() {
    this.status = 'lost';
    this.peer = false;
    if (OP.App.play && OP.App.play.mp) OP.App.play.netLost = true;
    else if (OP.App.screen === 'mp') this.fail('החיבור למארח נותק');
  },
  leave() {
    this.send({ t: 'bye' });
    const wasHost = this.role === 'host';
    this.reset();
    if (wasHost && this.canHost()) window.oscarHost.stop();
  },
  lobbyMsg() {
    const coop = this.mode === 'coop' ? OP.loadCoopSave() : null;
    return { t: 'lobby', mode: this.mode, hostPid: this.pid, info: coop ? { day: coop.day, coins: coop.coins } : null };
  },

  handle(msg) {
    const app = OP.App;
    const play = app.play && app.play.mp ? app.play : null;
    const from = msg.from;
    switch (msg.t) {
      case 'welcome':
        this.pid = msg.pid;
        this.pids = msg.pids || [msg.pid];
        if (this.role === 'host') this.hostPid = msg.pid;
        this.peer = this.pids.length > 1;
        break;
      case 'peer':
        this.pids = msg.pids || this.pids;
        this.peer = this.pids.length > 1;
        if (msg.joined) {
          if (this.role === 'host') this.send(this.lobbyMsg());
          OP.sfx('doorbell');
        } else if (this.role === 'guest' && msg.pid === this.hostPid) {
          this.lost();
        } else if (play) {
          play.onPlayerLeft(msg.pid);
        }
        break;
      case 'lobby':
        this.mode = msg.mode;
        this.hostPid = msg.hostPid;
        this.info = msg.info;
        if (this.status !== 'playing') this.status = 'lobby';
        break;
      case 'start':
        if (this.role === 'guest') app.startMp(msg, 'guest');
        break;
      case 'state':
        if (play && play.mp.role === 'guest' && play.mp.mode === 'coop') OP.applySnap(play.shop, msg.s, msg.ev);
        break;
      case 'act':
        if (play && play.mp.role === 'host' && play.mp.mode === 'coop') OP.applyAct(play.shop, msg);
        break;
      case 'fix':
        if (play) play.remoteFix[from] = msg.v;
        break;
      case 'cursor':
        if (play) play.partners[from] = Object.assign({ at: app.t }, msg);
        break;
      case 'dayEnd':
        if (play) play.onCoopDayEnd(msg);
        break;
      case 'buy':
        if (play && play.mp.role === 'host' && play.mp.mode === 'coop') play.applyBuy(msg.id, from);
        break;
      case 'shopSync':
        if (play && play.mp.role === 'guest') play.onShopSync(msg);
        break;
      case 'score':
        if (play) play.opps[from] = msg;
        break;
      case 'final':
        if (play) play.finals[from] = msg;
        break;
      case 'ready':
        if (play && msg.round === play.mp.round) play.ready[from] = true;
        break;
    }
  },
};

// ---------- co-op: the host's shop is the truth; every guest keeps a mirror of it ----------
OP.hookHostShop = (shop) => {
  for (const m of OP.NET_EVENTS) {
    const orig = shop[m];
    shop[m] = function (...args) {
      const r = orig.apply(this, args);
      if (OP.Net.recording) OP.Net.evq.push([m, args, OP.Net.actor]);
      return r;
    };
  }
};

OP.hookGuestShop = (shop) => {
  for (const a of OP.NET_ACTIONS) {
    const orig = shop[a];
    shop[a] = function (...args) {
      if (this.quiet) return orig.apply(this, args);
      let wire = args;
      if (a === 'catchThief') wire = [args[0] && args[0].id];
      if (a === 'serve') wire = [args[0] && args[0].id, args[1]];
      OP.Net.send({ t: 'act', a, args: wire });
      return orig.apply(this, args);
    };
  }
};

OP.applyAct = (shop, msg) => {
  if (!OP.NET_ACTIONS.includes(msg.a) || typeof shop[msg.a] !== 'function') return;
  let args = Array.isArray(msg.args) ? msg.args : [];
  if (msg.a === 'catchThief' || msg.a === 'serve') {
    const c = shop.customers.find((x) => x.id === args[0]);
    if (!c) return;
    args = msg.a === 'serve' ? [c, args[1] || {}] : [c];
  }
  // events carry the acting player so that player does not see them twice
  OP.Net.actor = msg.from || 'guest';
  try {
    shop[msg.a](...args);
  } catch (e) {
    console.error('bad action', msg.a, e);
  } finally {
    OP.Net.actor = 'host';
  }
};

OP.snapShop = (s) => ({
  phase: s.phase,
  phaseT: s.phaseT,
  time: s.time,
  t: s.t,
  day: s.day,
  dayLength: s.dayLength,
  trays: s.trays,
  dough: s.dough,
  oven: s.oven,
  coffee: s.coffee,
  basket: s.basket,
  boards: s.boards,
  customers: s.customers,
  spots: s.spots.map((c) => (c ? c.id : null)),
  coins: s.coins,
  crumbs: s.crumbs,
  flies: s.flies.map((f) => ({ x: f.x, y: f.y, tx: f.tx, ty: f.ty, state: f.state, t: f.t, landT: f.landT, vy: f.vy, life: f.life, target: f.target })),
  stats: s.stats,
  combo: s.combo,
  oscarMood: s.oscarMood,
  speech: s.speech,
  fix: s.fix,
  weather: s.weather,
  coinsTotal: s.save.coins,
  rep: s.save.rep,
});

OP.applySnap = (m, s, ev) => {
  for (const k of ['phase', 'phaseT', 'time', 't', 'day', 'dayLength', 'trays', 'dough', 'oven', 'coffee', 'basket', 'boards', 'customers', 'coins', 'crumbs', 'flies', 'stats', 'combo', 'oscarMood', 'speech', 'fix', 'weather']) {
    m[k] = s[k];
  }
  m.spots = s.spots.map((id) => (id == null ? null : m.customers.find((c) => c.id === id) || null));
  m.save.coins = s.coinsTotal;
  m.save.rep = s.rep;
  if (!ev) return;
  for (const [kind, args, actor] of ev) {
    if (actor === OP.Net.pid) continue; // already shown locally the moment this player acted
    if (kind === 'sfx') OP.sfx(args[0]);
    else if (OP.NET_EVENTS.includes(kind)) OP.Shop.prototype[kind].apply(m, args);
  }
};

// sounds made by the host's shop are forwarded too; a guest's mirror simulation stays silent
if (!OP._netSfxHooked) {
  OP._netSfxHooked = true;
  const baseSfx = OP.sfx;
  OP.sfx = function (name) {
    if (OP.Net.muteSim) return;
    baseSfx(name);
    if (OP.Net.recording) OP.Net.evq.push(['sfx', [name], OP.Net.actor]);
  };
}
