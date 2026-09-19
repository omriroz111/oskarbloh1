// הפיטסרי של אוסקר — cinematic cutscenes: letterbox, fades, camera moves, typed subtitles, skip
var OP = globalThis.OP || (globalThis.OP = {});

OP.camera = (ctx, zoom, fx, fy) => {
  ctx.translate(640, 360);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
};

(function () {
  const ease = (k) => k * k * (3 - 2 * k);
  const seg = (k, a, b) => OP.clamp((k - a) / (b - a), 0, 1);

  OP.Cinema = class Cinema {
    constructor(app, shots, onDone) {
      this.app = app;
      this.shots = shots;
      this.onDone = onDone;
      this.t = 0;
      this.i = 0;
      this.st = 0;
      this.fired = {};
      this.done = false;
      this.total = shots.reduce((s, x) => s + x.dur, 0);
    }
    update(dt) {
      if (this.done) return;
      this.t += dt;
      this.st += dt;
      const shot = this.shots[this.i];
      for (const [at, name] of shot.sfx || []) {
        const key = this.i + '@' + at + name;
        if (this.st >= at && !this.fired[key]) {
          this.fired[key] = 1;
          OP.sfx(name);
        }
      }
      if (shot.update) shot.update(dt, this.st);
      if (this.st >= shot.dur) {
        this.i++;
        this.st = 0;
        if (this.i >= this.shots.length) this.finish();
      }
    }
    finish() {
      if (this.done) return;
      this.done = true;
      if (this.onDone) this.onDone();
    }
    skip() {
      if (this.done) return;
      OP.sfx('swoosh');
      this.finish();
    }
    elapsed() {
      let e = this.st;
      for (let k = 0; k < Math.min(this.i, this.shots.length); k++) e += this.shots[k].dur;
      return e;
    }
    draw(ctx, gt) {
      const idx = Math.min(this.i, this.shots.length - 1);
      const shot = this.shots[idx];
      const st = this.i >= this.shots.length ? shot.dur : this.st;
      const k = OP.clamp(st / shot.dur, 0, 1);
      ctx.save();
      shot.draw(ctx, st, k, gt);
      ctx.restore();

      const fin = shot.fadeIn == null ? 0.4 : shot.fadeIn;
      const fout = shot.fadeOut == null ? 0.4 : shot.fadeOut;
      let a = 0;
      if (fin > 0 && st < fin) a = 1 - st / fin;
      if (fout > 0 && shot.dur - st < fout) a = Math.max(a, 1 - (shot.dur - st) / fout);
      if (a > 0) {
        ctx.fillStyle = `rgba(6,3,1,${a})`;
        ctx.fillRect(0, 0, 1280, 720);
      }

      const v = ctx.createRadialGradient(640, 360, 380, 640, 360, 820);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,.42)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = 'rgba(255,240,220,.035)';
      for (let n = 0; n < 70; n++) ctx.fillRect(Math.random() * 1280, Math.random() * 720, 2, 2);

      const inBar = OP.easeOutCubic(Math.min(1, this.t / 0.7));
      const outBar = OP.clamp((this.total - this.elapsed()) / 0.45, 0, 1);
      const bar = 72 * Math.min(inBar, outBar);
      ctx.fillStyle = '#050302';
      ctx.fillRect(0, 0, 1280, bar);
      ctx.fillRect(0, 720 - bar, 1280, bar);

      const sub = shot.sub;
      if (sub) {
        const s0 = st - (sub.at == null ? 0.3 : sub.at);
        const end = sub.until || shot.dur - 0.2;
        if (s0 > 0 && st < end + 0.3) {
          const fade = st > end ? 1 - (st - end) / 0.3 : Math.min(1, s0 * 4);
          const shown = sub.text.slice(0, Math.min(sub.text.length, Math.floor(s0 * 32)));
          const who = sub.who ? sub.who + ':' : '';
          const ww = who ? OP.textWidth(ctx, who + ' ', 32, 800) : 0;
          const tw = OP.textWidth(ctx, sub.text, 32, 700) + ww;
          const y = 720 - 72 - 42;
          ctx.save();
          ctx.globalAlpha = Math.max(0, fade);
          OP.rr(ctx, 640 - tw / 2 - 28, y - 29, tw + 56, 58, 20);
          ctx.fillStyle = 'rgba(12,6,2,.55)';
          ctx.fill();
          if (who) OP.text(ctx, who, 640 + tw / 2, y, { size: 32, weight: 800, color: '#ff9fb4', align: 'right', stroke: '#1a0a04', lw: 6 });
          OP.text(ctx, shown, 640 + tw / 2 - ww, y, { size: 32, weight: 700, color: '#fff8ea', align: 'right', stroke: '#1a0a04', lw: 6 });
          ctx.restore();
        }
      }

      if (this.t > 0.5 && !this.done) {
        const sb = { x: 1108, y: 668, w: 152, h: 42 };
        const hv = this.app.hover('skip', sb);
        OP.rr(ctx, sb.x, sb.y, sb.w, sb.h, 21);
        OP.fs(ctx, `rgba(255,255,255,${0.14 + hv * 0.16})`, 'rgba(255,255,255,.65)', 2);
        OP.iconText(ctx, 'fastForward', 'דלג', sb.x + sb.w / 2, sb.y + 22, { size: 22, color: '#fff', iconSize: 24 });
        this.app.ui.add(sb, () => this.skip());
      }
    }
  };

  function titleCard(ctx, text, icon, a, y = 132) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, a);
    ctx.translate(640, y - (1 - Math.min(1, a)) * 30);
    OP.ribbon(ctx, 0, 0, OP.textWidth(ctx, text, 32) + 110, text, icon);
    ctx.restore();
  }

  // up to three friend bakers standing or walking next to Oscar
  function crew(n, xAt, walking, facing, happy) {
    const out = [];
    for (let i = 0; i < Math.min(3, Math.max(1, n - 1)); i++) {
      out.push({ x: xAt(i), walking, facing, pal: OP.BAKER_PALS[i % OP.BAKER_PALS.length], mood: happy ? 'happy' : null });
    }
    return out;
  }

  function raysBg(ctx, gt, c0, c1) {
    const bg = ctx.createRadialGradient(640, 340, 40, 640, 360, 800);
    bg.addColorStop(0, c0);
    bg.addColorStop(1, c1);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1280, 720);
    ctx.save();
    ctx.translate(640, 340);
    ctx.rotate(gt * 0.15);
    for (let i = 0; i < 14; i++) {
      ctx.rotate((Math.PI * 2) / 14);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(900, -70);
      ctx.lineTo(900, 70);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,210,140,.07)';
      ctx.fill();
    }
    ctx.restore();
  }

  function makeConfetti(seed) {
    const rnd = OP.mulberry32(seed);
    return Array.from({ length: 90 }, () => ({
      x: rnd() * 1280,
      y: -rnd() * 500,
      vy: 140 + rnd() * 220,
      vx: (rnd() - 0.5) * 90,
      spin: (rnd() - 0.5) * 10,
      w: 7 + rnd() * 8,
      c: ['#ff8ad0', '#ffd23a', '#5fd068', '#6fb7e9', '#ff7a2a'][Math.floor(rnd() * 5)],
    }));
  }
  function drawConfetti(ctx, list, tt) {
    for (const c of list) {
      const cx = c.x + c.vx * tt;
      const cy = c.y + c.vy * tt + 60 * tt * tt;
      if (cy > 760) continue;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(c.spin * tt);
      ctx.scale(1, Math.cos(tt * 6 + c.x));
      ctx.fillStyle = c.c;
      ctx.fillRect(-c.w / 2, -c.w / 4, c.w, c.w / 2);
      ctx.restore();
    }
  }

  OP.cineShop = () => {
    const save = OP.newSave();
    save.seen.tutorial = 1;
    const s = new OP.Shop(save, { skipBanner: true, noFaults: true, demo: true, skipTutorial: true });
    s.phase = 'demo';
    s.weather = 'clear';
    for (const id in s.trays) s.trays[id].amount = 0;
    s.oven.fault = true;
    return s;
  };

  OP.CUTSCENES = {
    intro(app) {
      const shop = OP.cineShop();
      return [
        {
          dur: 4.8,
          fadeIn: 1.0,
          sub: { text: 'פריז. חמש לפנות בוקר…', at: 1.1 },
          sfx: [[0.6, 'birds'], [2.8, 'birds']],
          draw: (ctx, st, k, gt) => {
            OP.camera(ctx, OP.lerp(1.22, 1.03, ease(k)), OP.lerp(880, 640, ease(k)), OP.lerp(320, 360, ease(k)));
            OP.drawStreet(ctx, gt, { tod: OP.lerp(0, 0.05, k), shutter: 0, dusty: true, lampOn: 1, people: 1 });
          },
        },
        {
          dur: 5.6,
          sub: { who: 'אוסקר', text: 'סבא שלי אפה כאן קרואסונים ארבעים שנה…', at: 1.5 },
          draw: (ctx, st, k, gt) => {
            const wk = OP.clamp(k / 0.7, 0, 1);
            const ox = OP.lerp(-80, 600, ease(wk));
            OP.camera(ctx, 1.12, OP.clamp(ox + 80, 520, 760), 390);
            OP.drawStreet(ctx, gt, { tod: 0.07, shutter: 0, dusty: true, lampOn: 1, oscar: { x: ox, walking: wk < 1, facing: 1, sack: true } });
          },
        },
        {
          dur: 4.4,
          sub: { who: 'אוסקר', text: '…והיום, זה התור שלי!', at: 1.0 },
          sfx: [[1.2, 'whistle']],
          draw: (ctx, st, k, gt) => {
            OP.camera(ctx, OP.lerp(2.3, 2.6, ease(k)), 604, OP.lerp(478, 462, k));
            OP.drawStreet(ctx, gt, { tod: 0.09, shutter: 0, dusty: true, lampOn: 1, oscar: { x: 600, facing: 1, sack: true, mood: k > 0.3 ? 'happy' : null, talking: k > 0.22 && k < 0.8 } });
          },
        },
        {
          dur: 5.4,
          sub: { text: 'הפיטסרי של אוסקר חוזר לחיים!', at: 3.1 },
          sfx: [[0.4, 'shutter'], [2.4, 'click'], [3.0, 'sparkle'], [3.1, 'bell']],
          draw: (ctx, st, k, gt) => {
            const flick = k > 0.44 && k < 0.54 ? (Math.sin(st * 45) > 0 ? 1 : 0) : k >= 0.54 ? 1 : 0;
            OP.camera(ctx, OP.lerp(1.0, 1.1, ease(k)), 640, OP.lerp(400, 380, k));
            OP.drawStreet(ctx, gt, {
              tod: OP.lerp(0.11, 0.2, k),
              shutter: ease(seg(k, 0.07, 0.42)),
              lights: flick,
              signOn: seg(k, 0.55, 0.62),
              dusty: k < 0.55,
              lampOn: 1 - seg(k, 0.6, 0.9),
              sparkles: seg(k, 0.56, 1),
              oscar: { x: 560, facing: 1, mood: k > 0.56 ? 'happy' : null, wave: k > 0.62 },
            });
          },
        },
        {
          dur: 4.8,
          fadeOut: 0.7,
          sub: { who: 'אוסקר', text: 'בואו נאפה!', at: 2.5 },
          sfx: [[1.4, 'ignite'], [3.4, 'ding']],
          update: (dt, st) => {
            shop.oven.fault = st < 1.4;
            if (st > 2.3 && shop.oven.slots[0].state === 'empty') {
              shop.oven.slots[0].state = 'baking';
              shop.oven.slots[1].state = 'baking';
            }
            for (const s of shop.oven.slots) if (s.state === 'baking') s.t = Math.min(11.6, s.t + dt * 6);
            shop.oscarMood = st > 2.4 ? { mood: 'happy', t: 0, dur: 9 } : null;
            shop.speech = null;
          },
          draw: (ctx, st, k, gt) => {
            OP.camera(ctx, OP.lerp(1.0, 1.5, ease(k)), OP.lerp(640, 300, ease(k)), OP.lerp(360, 310, ease(k)));
            OP.renderScene(ctx, shop, gt, app, { tod: 0.12 });
            if (st > 1.4 && st < 2.2) {
              const f = 1 - (st - 1.4) / 0.8;
              ctx.fillStyle = `rgba(255,170,80,${0.35 * f})`;
              ctx.fillRect(0, 0, 1280, 720);
            }
          },
        },
      ];
    },

    morning(app, shop) {
      const rain = shop.weather === 'rain';
      const line = rain ? 'בוקר גשום בפריז… אבל התנור כבר חם' : OP.pick(['בוקר טוב, פריז!', 'ריח של חמאה ממלא את הרחוב…', 'עוד יום של קרואסונים חמים']);
      return [
        {
          dur: 3.4,
          fadeIn: 0.5,
          sub: { text: line, at: 1.0 },
          sfx: [[0.3, rain ? 'swoosh' : 'birds'], [0.8, 'shutter'], [2.3, 'sparkle']],
          draw: (ctx, st, k, gt) => {
            ctx.save();
            OP.camera(ctx, OP.lerp(1.14, 1.0, ease(k)), 640, 390);
            OP.drawStreet(ctx, gt, {
              tod: 0.1,
              weather: shop.weather,
              shutter: ease(seg(k, 0.2, 0.6)),
              lights: k > 0.58 ? 1 : 0,
              signOn: seg(k, 0.62, 0.7),
              sparkles: seg(k, 0.64, 1),
              lampOn: 1 - k,
              people: 3,
              oscar: { x: 500, facing: 1, mood: k > 0.66 ? 'happy' : null },
            });
            ctx.restore();
            titleCard(ctx, 'יום ' + shop.day, 'croissant', seg(k, 0.1, 0.3) * (1 - seg(k, 0.85, 1)));
          },
        },
        {
          dur: 1.5,
          fadeIn: 0.2,
          fadeOut: 0.3,
          draw: (ctx, st, k, gt) => {
            OP.camera(ctx, OP.lerp(1.35, 1.0, OP.easeOutCubic(k)), 640, 380);
            OP.renderScene(ctx, shop, gt, app, {});
          },
        },
      ];
    },

    night(app, shop) {
      const st = shop.stats;
      const profit = st.earned + st.tips + st.bonus - st.fines;
      const good = st.lost <= 1 && st.served >= 4;
      const line = good ? OP.pick(['איזה יום! פריז אוהבת אותנו', 'הלקוחות יצאו מחייכים. כל הכבוד!']) : OP.pick(['יום קשה… מחר נאפה טוב יותר', 'לא נורא. גם בצק צריך זמן לתפוח']);
      return [
        {
          dur: 3.2,
          fadeIn: 0.3,
          sub: { who: 'אוסקר', text: line, at: 0.5 },
          sfx: [[2.4, 'click']],
          update: () => {
            shop.oscarMood = { mood: good ? 'happy' : 'sad', t: 0, dur: 9 };
            shop.speech = null;
          },
          draw: (ctx, s, k, gt) => {
            OP.camera(ctx, OP.lerp(1.0, 1.45, ease(k)), OP.lerp(640, 250, ease(k)), OP.lerp(360, 340, ease(k)));
            OP.renderScene(ctx, shop, gt, app, { tod: OP.lerp(0.86, 1, k) });
            const dark = seg(k, 0.72, 0.8);
            if (dark > 0) {
              ctx.fillStyle = `rgba(5,5,20,${0.45 * dark})`;
              ctx.fillRect(0, 0, 1280, 720);
            }
          },
        },
        {
          dur: 3.8,
          fadeOut: 0.5,
          sub: { text: `יום ${shop.day} הסתיים`, at: 0.5 },
          sfx: [[0.5, 'shutter'], [2.3, 'click'], [1.6, 'coin']],
          draw: (ctx, s, k, gt) => {
            ctx.save();
            OP.camera(ctx, OP.lerp(1.1, 1.0, ease(k)), 640, 380);
            const off = k > 0.62 && !(k < 0.68 && Math.sin(s * 50) > 0.2);
            OP.drawStreet(ctx, gt, {
              tod: 1,
              weather: shop.weather,
              shutter: 1 - ease(seg(k, 0.1, 0.55)),
              lights: k < 0.55 ? 1 : 0,
              signOn: off ? 0 : 1,
              lampOn: 1,
              people: 1,
              oscar: { x: OP.lerp(800, 1160, ease(seg(k, 0.6, 1))), walking: k > 0.6 && k < 1, facing: 1 },
            });
            ctx.restore();
            const pk = seg(k, 0.2, 0.35) * (1 - seg(k, 0.9, 1));
            if (pk > 0) {
              ctx.save();
              ctx.globalAlpha = pk;
              ctx.translate(640, 150);
              OP.rr(ctx, -150, -40, 300, 80, 24);
              OP.fs(ctx, 'rgba(255,250,235,.95)', OP.OUT, 4);
              OP.coinIcon(ctx, 96, 0, 24);
              const shown = Math.round(profit * seg(k, 0.25, 0.6));
              OP.text(ctx, (shown >= 0 ? '+' : '') + shown, -10, 2, { size: 44, color: '#e89a0c', stroke: OP.OUT, lw: 7, dir: 'ltr' });
              ctx.restore();
            }
          },
        },
      ];
    },

    // ---------- multiplayer ----------
    coopIntro(app, shop, n = 2) {
      return [
        {
          dur: 4.4,
          fadeIn: 0.9,
          sub: { who: 'אוסקר', text: 'לאפות לבד זה נחמד…', at: 1.2 },
          sfx: [[0.5, 'birds']],
          draw: (ctx, st, k, gt) => {
            const ox = OP.lerp(-60, 470, ease(OP.clamp(k / 0.8, 0, 1)));
            OP.camera(ctx, 1.1, OP.clamp(ox + 120, 540, 760), 400);
            OP.drawStreet(ctx, gt, { tod: 0.07, shutter: 0, dusty: true, lampOn: 1, oscar: { x: ox, walking: k < 0.8, facing: 1, sack: true } });
          },
        },
        {
          dur: 4.8,
          sub: { who: 'אוסקר', text: '…אבל ביחד זה הרבה יותר טעים!', at: 1.8 },
          sfx: [[0.6, 'doorbell'], [2.2, 'combo']],
          draw: (ctx, st, k, gt) => {
            const wk = ease(OP.clamp(k / 0.7, 0, 1));
            OP.camera(ctx, OP.lerp(1.15, 1.0, ease(k)), 640, 400);
            OP.drawStreet(ctx, gt, { tod: 0.09, shutter: 0, dusty: true, lampOn: 1, friends: crew(n, (i) => OP.lerp(1400 + i * 120, 640 + i * 120, wk), wk < 1, -1, k > 0.75), oscar: { x: 470, facing: 1, wave: k > 0.35, mood: k > 0.7 ? 'happy' : null } });
          },
        },
        {
          dur: 5.2,
          sub: { text: n > 2 ? `${n} אופים. מטבח אחד. קופה אחת.` : 'שני אופים. מטבח אחד. קופה אחת.', at: 2.6 },
          sfx: [[0.4, 'shutter'], [2.2, 'click'], [2.6, 'sparkle'], [2.7, 'bell']],
          draw: (ctx, st, k, gt) => {
            const flick = k > 0.4 && k < 0.5 ? (Math.sin(st * 45) > 0 ? 1 : 0) : k >= 0.5 ? 1 : 0;
            ctx.save();
            OP.camera(ctx, OP.lerp(1.0, 1.08, ease(k)), 640, 390);
            OP.drawStreet(ctx, gt, {
              tod: OP.lerp(0.11, 0.2, k),
              shutter: ease(seg(k, 0.07, 0.4)),
              lights: flick,
              signOn: seg(k, 0.5, 0.58),
              dusty: k < 0.5,
              lampOn: 1 - seg(k, 0.6, 0.9),
              sparkles: seg(k, 0.52, 1),
              friends: crew(n, (i) => 640 + i * 120, false, -1, k > 0.52),
              oscar: { x: 470, facing: 1, mood: k > 0.52 ? 'happy' : null, wave: k > 0.6 },
            });
            ctx.restore();
            titleCard(ctx, 'הפיטסרי של החברים', 'players', seg(k, 0.55, 0.7) * (1 - seg(k, 0.94, 1)));
          },
        },
        {
          dur: 3.6,
          fadeOut: 0.6,
          sub: { who: 'אוסקר', text: 'כולם למטבח!', at: 1.2 },
          sfx: [[1.4, 'ding']],
          update: () => {
            shop.oscarMood = { mood: 'happy', t: 0, dur: 9 };
            shop.speech = null;
          },
          draw: (ctx, st, k, gt) => {
            OP.camera(ctx, OP.lerp(1.4, 1.0, OP.easeOutCubic(k)), 640, 380);
            OP.renderScene(ctx, shop, gt, app, {});
          },
        },
      ];
    },

    coopMorning(app, shop, n = 2) {
      const line = OP.pick(['עוד יום בפיטסרי של החברים!', 'הצוות מוכן, התנור חם', 'בוקר טוב, אופים!']);
      return [
        {
          dur: 3.6,
          fadeIn: 0.5,
          sub: { text: line, at: 1.0 },
          sfx: [[0.3, 'birds'], [0.8, 'shutter'], [2.4, 'sparkle']],
          draw: (ctx, st, k, gt) => {
            ctx.save();
            OP.camera(ctx, OP.lerp(1.12, 1.0, ease(k)), 640, 390);
            OP.drawStreet(ctx, gt, {
              tod: 0.1,
              weather: shop.weather,
              shutter: ease(seg(k, 0.2, 0.6)),
              lights: k > 0.58 ? 1 : 0,
              signOn: seg(k, 0.62, 0.7),
              sparkles: seg(k, 0.64, 1),
              lampOn: 1 - k,
              people: 2,
              friends: crew(n, (i) => 640 + i * 120, false, -1, k > 0.66),
              oscar: { x: 470, facing: 1, mood: k > 0.66 ? 'happy' : null },
            });
            ctx.restore();
            titleCard(ctx, `יום ${shop.day} · ביחד`, 'players', seg(k, 0.1, 0.3) * (1 - seg(k, 0.85, 1)));
          },
        },
        {
          dur: 1.5,
          fadeIn: 0.2,
          fadeOut: 0.3,
          draw: (ctx, st, k, gt) => {
            OP.camera(ctx, OP.lerp(1.35, 1.0, OP.easeOutCubic(k)), 640, 380);
            OP.renderScene(ctx, shop, gt, app, {});
          },
        },
      ];
    },

    coopNight(app, shop, profit = 0, n = 2) {
      const st = shop.stats;
      const good = st.lost <= 2 && st.served >= 5;
      const line = good ? OP.pick(['איזה צוות! פריז אוהבת אתכם', 'עבודת צוות מושלמת. כל הכבוד!']) : OP.pick(['יום קשה… מחר נתחלק טוב יותר', 'לא נורא. ביחד נצליח מחר']);
      return [
        {
          dur: 3.0,
          fadeIn: 0.3,
          sub: { who: 'אוסקר', text: line, at: 0.5 },
          update: () => {
            shop.oscarMood = { mood: good ? 'happy' : 'sad', t: 0, dur: 9 };
            shop.speech = null;
          },
          draw: (ctx, s, k, gt) => {
            OP.camera(ctx, OP.lerp(1.0, 1.4, ease(k)), OP.lerp(640, 260, ease(k)), OP.lerp(360, 340, ease(k)));
            OP.renderScene(ctx, shop, gt, app, { tod: OP.lerp(0.86, 1, k) });
          },
        },
        {
          dur: 4.2,
          fadeOut: 0.5,
          sub: { text: `יום ${shop.day} הסתיים`, at: 0.5 },
          sfx: [[0.5, 'shutter'], [1.6, 'coin'], [2.4, 'click']],
          draw: (ctx, s, k, gt) => {
            ctx.save();
            OP.camera(ctx, OP.lerp(1.1, 1.0, ease(k)), 640, 380);
            const walk = ease(seg(k, 0.6, 1));
            OP.drawStreet(ctx, gt, {
              tod: 1,
              weather: shop.weather,
              shutter: 1 - ease(seg(k, 0.1, 0.55)),
              lights: k < 0.55 ? 1 : 0,
              signOn: k > 0.62 ? 0 : 1,
              lampOn: 1,
              friends: crew(n, (i) => OP.lerp(640 + i * 120, 1500 + i * 120, walk), k > 0.6, 1),
              oscar: { x: OP.lerp(470, 1300, walk), walking: k > 0.6, facing: 1 },
            });
            ctx.restore();
            const pk = seg(k, 0.2, 0.35) * (1 - seg(k, 0.9, 1));
            if (pk > 0) {
              ctx.save();
              ctx.globalAlpha = pk;
              ctx.translate(640, 150);
              OP.rr(ctx, -210, -46, 420, 92, 24);
              OP.fs(ctx, 'rgba(255,250,235,.95)', OP.OUT, 4);
              OP.coinIcon(ctx, 150, -6, 24);
              const shown = Math.round(profit * seg(k, 0.25, 0.6));
              OP.text(ctx, (shown >= 0 ? '+' : '') + shown, 40, -4, { size: 44, color: '#e89a0c', stroke: OP.OUT, lw: 7, dir: 'ltr' });
              OP.text(ctx, 'לקופה המשותפת', -110, -4, { size: 24, color: OP.OUT });
              ctx.restore();
            }
          },
        },
      ];
    },

    vsIntro(app, shop, n = 2) {
      const count = Math.max(2, n);
      return [
        {
          dur: 5.0,
          fadeIn: 0.3,
          fadeOut: 0.4,
          sub: { text: `${count} אופים. ${OP.VS_ROUNDS} ימים. רק אחד ינצח.`, at: 2.2 },
          sfx: [[0.3, 'whistle'], [1.0, 'stamp'], [1.2, 'combo'], [2.0, 'sparkle']],
          draw: (ctx, st, k, gt) => {
            raysBg(ctx, gt, '#3b2a6a', '#120a24');
            // bakers line up and slide in from both sides
            const shown = Math.min(count, 5);
            for (let i = 0; i < shown; i++) {
              const slot = (i - (shown - 1) / 2) * 210;
              const from = slot < 0 ? -700 : 700;
              const e = OP.easeOutBack(OP.clamp((st - 0.2 - i * 0.12) / 0.6, 0, 1));
              const x = 640 + OP.lerp(from, slot, e);
              OP.drawOscar(ctx, x, 420, 0.8, gt + i, { pal: i === 0 ? null : OP.BAKER_PALS[(i - 1) % OP.BAKER_PALS.length], mood: st > 1.6 ? 'happy' : null });
            }
            const vk = OP.clamp((st - 1.0) / 0.35, 0, 1);
            if (vk > 0) {
              ctx.save();
              ctx.translate(640, 250);
              const sc = OP.easeOutBack(vk) * (1 + Math.sin(gt * 6) * 0.03);
              ctx.scale(sc, sc);
              ctx.rotate(-0.08);
              OP.text(ctx, 'VS', 0, 0, { size: 150, color: '#ffd23a', stroke: '#3a1a08', lw: 18, dir: 'ltr' });
              ctx.restore();
            }
            titleCard(ctx, 'תחרות האופים!', 'star', seg(k, 0.1, 0.25), 120);
          },
        },
      ];
    },

    vsMorning(app, shop, n = 2, round = 1) {
      return [
        {
          dur: 3.0,
          fadeIn: 0.4,
          sub: { text: OP.pick(['מי יאפה הכי מהר היום?', 'הקופה מלאה, הלקוחות רעבים', 'עוד יום, עוד הזדמנות לנצח']), at: 1.0 },
          sfx: [[0.3, 'birds'], [0.8, 'shutter']],
          draw: (ctx, st, k, gt) => {
            ctx.save();
            OP.camera(ctx, OP.lerp(1.12, 1.0, ease(k)), 640, 390);
            OP.drawStreet(ctx, gt, { tod: 0.1, weather: shop.weather, shutter: ease(seg(k, 0.2, 0.6)), lights: k > 0.58 ? 1 : 0, signOn: seg(k, 0.62, 0.7), lampOn: 1 - k, people: 3, oscar: { x: 500, facing: 1, mood: k > 0.66 ? 'happy' : null } });
            ctx.restore();
            titleCard(ctx, `יום ${round} מתוך ${OP.VS_ROUNDS}`, 'star', seg(k, 0.1, 0.3) * (1 - seg(k, 0.85, 1)));
          },
        },
        {
          dur: 1.4,
          fadeIn: 0.2,
          fadeOut: 0.3,
          draw: (ctx, st, k, gt) => {
            OP.camera(ctx, OP.lerp(1.35, 1.0, OP.easeOutCubic(k)), 640, 380);
            OP.renderScene(ctx, shop, gt, app, {});
          },
        },
      ];
    },

    vsWinner(app, shop, name, iWon) {
      const confetti = makeConfetti(99);
      return [
        {
          dur: 5.0,
          fadeIn: 0.3,
          fadeOut: 0.6,
          sub: { text: iWon ? 'אתם האופים הכי טובים בפריז!' : `${name || 'היריב'} הוא האופה הכי טוב בפריז!`, at: 1.6 },
          sfx: [[0.2, 'swoosh'], [0.9, 'stamp'], [1.0, 'combo'], [1.3, 'sparkle'], [2.4, 'coin']],
          draw: (ctx, st, k, gt) => {
            raysBg(ctx, gt, '#7a3b24', '#1d0d06');
            const e = OP.easeOutBack(OP.clamp(st / 0.9, 0, 1));
            ctx.save();
            ctx.translate(640, 400);
            ctx.scale(e, e);
            OP.drawOscar(ctx, 0, 20, 0.9, gt, { mood: 'happy', pal: iWon ? null : OP.BAKER_PALS[0] });
            ctx.restore();
            const ck = OP.clamp((st - 0.8) / 0.4, 0, 1);
            if (ck > 0) {
              // a golden crown lands on the winner
              ctx.save();
              ctx.translate(640, OP.lerp(-80, 262, OP.easeOutCubic(ck)) + Math.sin(gt * 3) * 3);
              ctx.beginPath();
              ctx.moveTo(-70, 30);
              ctx.lineTo(-80, -30);
              ctx.lineTo(-40, 0);
              ctx.lineTo(0, -46);
              ctx.lineTo(40, 0);
              ctx.lineTo(80, -30);
              ctx.lineTo(70, 30);
              ctx.closePath();
              OP.fs(ctx, '#ffd23a', OP.OUT, 6);
              for (const gx of [-40, 0, 40]) {
                OP.ell(ctx, gx, 14, 8, 8);
                OP.fs(ctx, gx ? '#e5534b' : '#4a90d9', OP.OUT, 3);
              }
              ctx.restore();
            }
            titleCard(ctx, iWon ? 'ניצחתם!' : `${name || 'היריב'} ניצח!`, 'star', seg(k, 0.18, 0.32), 110);
            if (st > 1.0) drawConfetti(ctx, confetti, st - 1.0);
          },
        },
      ];
    },

    newspaper(app) {
      const rnd = OP.mulberry32(77);
      const confetti = Array.from({ length: 90 }, () => ({
        x: rnd() * 1280,
        y: -rnd() * 500,
        vy: 140 + rnd() * 220,
        vx: (rnd() - 0.5) * 90,
        spin: (rnd() - 0.5) * 10,
        w: 7 + rnd() * 8,
        c: ['#ff8ad0', '#ffd23a', '#5fd068', '#6fb7e9', '#ff7a2a'][Math.floor(rnd() * 5)],
      }));
      return [
        {
          dur: 5.4,
          fadeIn: 0.25,
          fadeOut: 0.6,
          sub: { text: 'אוסקר בעיתון! כל פריז מדברת על הקרואסונים שלך', at: 1.9 },
          sfx: [[0.1, 'swoosh'], [1.15, 'stamp'], [1.3, 'combo'], [1.5, 'sparkle']],
          draw: (ctx, st, k, gt) => {
            const bg = ctx.createRadialGradient(640, 340, 40, 640, 360, 800);
            bg.addColorStop(0, '#7a3b24');
            bg.addColorStop(1, '#1d0d06');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, 1280, 720);
            ctx.save();
            ctx.translate(640, 340);
            ctx.rotate(gt * 0.15);
            for (let i = 0; i < 14; i++) {
              ctx.rotate((Math.PI * 2) / 14);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(900, -70);
              ctx.lineTo(900, 70);
              ctx.closePath();
              ctx.fillStyle = 'rgba(255,210,140,.07)';
              ctx.fill();
            }
            ctx.restore();
            const sp = OP.clamp(st / 1.1, 0, 1);
            const e = OP.easeOutCubic(sp);
            const land = st > 1.1 ? Math.max(0, 1 - (st - 1.1) * 4) : 0;
            ctx.save();
            ctx.translate(640, 330);
            ctx.rotate((1 - e) * Math.PI * 6 - 0.05);
            const sc = (0.05 + 0.95 * e) * (1 + land * 0.06);
            ctx.scale(sc, sc);
            OP.drawNewspaper(ctx, gt);
            ctx.restore();
            if (st > 1.1) {
              const tt = st - 1.1;
              for (const c of confetti) {
                const cx = c.x + c.vx * tt;
                const cy = c.y + c.vy * tt + 60 * tt * tt;
                if (cy > 760) continue;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(c.spin * tt);
                ctx.scale(1, Math.cos(tt * 6 + c.x));
                ctx.fillStyle = c.c;
                ctx.fillRect(-c.w / 2, -c.w / 4, c.w, c.w / 2);
                ctx.restore();
              }
            }
          },
        },
      ];
    },
  };

  OP.drawNewspaper = (ctx, t) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 14;
    OP.rr(ctx, -330, -230, 660, 460, 6);
    ctx.fillStyle = '#f3ede0';
    ctx.fill();
    ctx.restore();
    OP.rr(ctx, -330, -230, 660, 460, 6);
    OP.fs(ctx, null, OP.OUT, 4);
    OP.text(ctx, 'LE PETIT JOURNAL DE PARIS', 0, -196, { size: 34, color: '#2a2320', dir: 'ltr', weight: 800 });
    ctx.fillStyle = '#2a2320';
    ctx.fillRect(-300, -174, 600, 4);
    ctx.fillRect(-300, -166, 600, 2);
    OP.text(ctx, 'הקרואסון הכי טוב בפריז!', 0, -126, { size: 50, color: '#1d1714', weight: 800 });
    OP.text(ctx, 'הפיטסרי של אוסקר כובש את העיר', 0, -80, { size: 24, color: '#5a4a40', weight: 700 });
    OP.rr(ctx, 30, -56, 270, 250, 4);
    OP.fs(ctx, '#d9cfbf', OP.OUT, 3);
    ctx.save();
    OP.rr(ctx, 30, -56, 270, 250, 4);
    ctx.clip();
    const pg = ctx.createLinearGradient(0, -56, 0, 194);
    pg.addColorStop(0, '#e8d6b8');
    pg.addColorStop(1, '#bda886');
    ctx.fillStyle = pg;
    ctx.fillRect(30, -56, 270, 250);
    OP.drawOscar(ctx, 165, 60, 0.62, t, { mood: 'happy' });
    OP.drawCroissant(ctx, 250, 160, 0.5, { state: 'baked' });
    ctx.fillStyle = 'rgba(120,100,70,.18)';
    ctx.fillRect(30, -56, 270, 250);
    ctx.restore();
    for (let i = 0; i < 5; i++) OP.icon(ctx, 'star', -270 + i * 46, -36, 38);
    ctx.fillStyle = '#9a8f82';
    for (let r = 0; r < 9; r++) {
      const w = r % 3 === 2 ? 180 : 280;
      ctx.fillRect(-10 - w, 6 + r * 22, w, 9);
    }
    ctx.fillStyle = '#2a2320';
    ctx.fillRect(-300, 200, 600, 3);
  };
})();
