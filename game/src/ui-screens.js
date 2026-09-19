// הפיטסרי של אוסקר — full screens: title, settings, pause, end-of-day summary, upgrade shop
var OP = globalThis.OP || (globalThis.OP = {});

OP.TITLE_START = { x: 490, y: 462, w: 300, h: 104 };
OP.TITLE_NEW = { x: 392, y: 600, w: 236, h: 58 };
OP.TITLE_MP = { x: 652, y: 600, w: 236, h: 58 };
OP.TITLE_GEAR = { x: 1214, y: 16, w: 52, h: 52 };

OP.drawTitle = (ctx, app, t) => {
  OP.renderScene(ctx, app.demo, t, app, { title: true });
  const g = ctx.createLinearGradient(0, 380, 0, 720);
  g.addColorStop(0, 'rgba(25,12,5,0)');
  g.addColorStop(1, 'rgba(25,12,5,.66)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 380, 1280, 340);

  const sy = 86 + Math.sin(t * 1.5) * 4;
  ctx.strokeStyle = '#3a2210';
  ctx.lineWidth = 5;
  for (const [ax, bx] of [[430, 450], [850, 830]]) {
    ctx.beginPath();
    ctx.moveTo(ax, -10);
    ctx.lineTo(bx, sy + 14);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(640, sy + 80);
  ctx.rotate(Math.sin(t * 1.2) * 0.012);
  ctx.translate(-640, -(sy + 80));
  OP.rr(ctx, 276, sy + 14, 740, 158, 28);
  ctx.fillStyle = 'rgba(20,10,5,.45)';
  ctx.fill();
  OP.rr(ctx, 270, sy, 740, 158, 28);
  const wg = ctx.createLinearGradient(0, sy, 0, sy + 158);
  wg.addColorStop(0, '#c7864a');
  wg.addColorStop(1, '#83491f');
  OP.fs(ctx, wg, OP.OUT, 6);
  ctx.save();
  OP.rr(ctx, 270, sy, 740, 158, 28);
  ctx.clip();
  const rnd = OP.mulberry32(5);
  ctx.fillStyle = 'rgba(70,35,12,.35)';
  for (let k = 0; k < 9; k++) ctx.fillRect(300 + rnd() * 600, sy + 18 + k * 15, 60 + rnd() * 120, 4);
  const p = (t % 4) / 4;
  if (p < 0.3) {
    const gx = 200 + (p / 0.3) * 900;
    const sh = ctx.createLinearGradient(gx - 60, 0, gx + 60, 0);
    sh.addColorStop(0, 'rgba(255,240,200,0)');
    sh.addColorStop(0.5, 'rgba(255,240,200,.35)');
    sh.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(gx - 60, sy, 120, 158);
  }
  ctx.restore();
  OP.rr(ctx, 286, sy + 14, 708, 130, 20);
  ctx.strokeStyle = '#f3cf8f';
  ctx.lineWidth = 3;
  ctx.stroke();
  for (const [nx, ny] of [[298, sy + 24], [982, sy + 24], [298, sy + 134], [982, sy + 134]]) {
    OP.ell(ctx, nx, ny, 5, 5);
    OP.fs(ctx, '#e8dcc4', OP.OUT, 2);
  }
  OP.text(ctx, OP.TITLE, 640, sy + 80, { size: 76, color: '#5a2a0c', dir: 'rtl' });
  OP.text(ctx, OP.TITLE, 640, sy + 76, { size: 76, color: '#fff1d6', stroke: '#4a220c', lw: 14 });
  ctx.restore();
  OP.drawCroissant(ctx, 262, sy + 118, 0.8, { state: 'baked', rot: -0.45 });
  OP.drawCroissant(ctx, 1018, sy + 118, 0.8, { state: 'baked', rot: 0.45 });

  const ry = sy + 150;
  ctx.beginPath();
  ctx.moveTo(446, ry);
  ctx.lineTo(834, ry);
  ctx.lineTo(814, ry + 23);
  ctx.lineTo(834, ry + 46);
  ctx.lineTo(446, ry + 46);
  ctx.lineTo(466, ry + 23);
  ctx.closePath();
  const rg = ctx.createLinearGradient(0, ry, 0, ry + 46);
  rg.addColorStop(0, '#ff9fb4');
  rg.addColorStop(1, '#e2658a');
  OP.fs(ctx, rg, OP.OUT, 4);
  OP.text(ctx, 'קרואסונים חמים ישר מהתנור', 640, ry + 24, { size: 24, color: '#fff', stroke: '#9c3551', lw: 5 });

  for (let k = 0; k < 14; k++) {
    const ph = (t * 0.22 + k / 14) % 1;
    const x = 120 + ((k * 97) % 1040) + Math.sin(t + k) * 10;
    const y = 720 - ph * 540;
    OP.icon(ctx, 'sparkle', x, y, 18 * (1 - ph) + 6, { color: '#ffe9a8', alpha: 0.9 * (1 - ph) });
  }

  const b = OP.TITLE_START;
  const pulse = 1 + Math.sin(t * 4) * 0.035;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
  const hasSave = !!app.save;
  OP.drawButton(ctx, b, hasSave ? 'המשך' : 'START', { size: hasSave ? 56 : 62, color: '#f59a23', lw: 10, icon: 'play', iconSize: 56, t, hover: app.hover('start', b) });
  ctx.restore();
  app.ui.add(b, () => app.start());

  if (hasSave) {
    const info = `יום ${app.save.day}  ·  ${app.save.coins}`;
    const gw = OP.textWidth(ctx, info, 22) + 34;
    OP.rr(ctx, 640 - gw / 2 - 14, 418, gw + 28, 34, 17);
    OP.fs(ctx, 'rgba(30,15,6,.62)', null);
    OP.iconText(ctx, 'coin', info, 640, 435, { size: 22, color: '#fff', iconSize: 24 });
    const nb = OP.TITLE_NEW;
    OP.drawButton(ctx, nb, 'משחק חדש', { size: 22, color: '#8d7f71', icon: 'refresh', iconSize: 26, hover: app.hover('new', nb) });
    app.ui.add(nb, () => app.askNewGame());
  }
  const mb = hasSave ? OP.TITLE_MP : { x: 522, y: 600, w: 236, h: 58 };
  OP.drawButton(ctx, mb, 'משחק עם חבר', { size: 22, color: '#4a90d9', icon: 'players', iconSize: 30, hover: app.hover('mp', mb) });
  app.ui.add(mb, () => app.openMp());
  if (app.musicBlocked) {
    OP.rr(ctx, 470, 404, 340, 44, 22);
    OP.fs(ctx, 'rgba(255,253,246,.95)', OP.OUT, 3);
    OP.iconText(ctx, 'speaker', 'לחצו בכל מקום להפעלת המוזיקה', 640, 426, { size: 20, color: OP.OUT, weight: 700, iconSize: 26 });
  }
  const gb = OP.TITLE_GEAR;
  OP.drawRoundButton(ctx, gb.x + 26, gb.y + 26, 24, 'gear', { hover: app.hover('gear', gb), iconOpts: { hole: '#f6e9d2' } });
  app.ui.add(gb, () => app.openSettings());
};

OP.drawSettings = (ctx, app, t) => {
  ctx.fillStyle = 'rgba(20,10,5,.62)';
  ctx.fillRect(0, 0, 1280, 720);
  app.ui.add({ x: 0, y: 0, w: 1280, h: 720 }, () => app.closeSettings());
  const P = { x: 380, y: 128, w: 520, h: 484 };
  app.ui.add(P, () => {});
  OP.panel(ctx, P.x, P.y, P.w, P.h, { title: 'הגדרות', icon: 'gear', titleW: 260 });
  const rows = [
    ['music', 'מוזיקה', 'music', OP.Audio.musicVol, '#d7c0ff', '#8b64e0'],
    ['sfx', 'צלילים', 'speaker', OP.Audio.sfxVol, '#ffd66b', '#f5862a'],
  ];
  rows.forEach(([kind, label, icon, v, c0, c1], i) => {
    const y = P.y + 112 + i * 96;
    OP.rr(ctx, P.x + 40, y - 38, P.w - 80, 76, 16);
    ctx.fillStyle = 'rgba(200,150,90,.14)';
    ctx.fill();
    OP.iconText(ctx, icon, label, P.x + P.w - 112, y, { size: 28, color: OP.OUT, iconSize: 40, iconOpts: kind === 'sfx' ? { level: v } : {} });
    const track = { x: P.x + 110, y: y - 20, w: 220, h: 40 };
    const active = !!(app.sliderDrag && app.sliderDrag.b.id === kind);
    OP.drawSlider(ctx, track, OP.Audio.muted ? 0 : v, { c0, c1, active });
    OP.text(ctx, (OP.Audio.muted ? 0 : Math.round(v * 100)) + '%', P.x + 70, y, { size: 22, color: OP.OUT, dir: 'ltr' });
    app.ui.slider(track, (nv) => OP.Audio.setVolume(kind, nv), kind);
  });
  {
    const y = P.y + 112 + 2 * 96;
    OP.rr(ctx, P.x + 40, y - 38, P.w - 80, 76, 16);
    ctx.fillStyle = 'rgba(200,150,90,.14)';
    ctx.fill();
    OP.iconText(ctx, 'film', 'סרטונים', P.x + P.w - 112, y, { size: 28, color: OP.OUT, iconSize: 40 });
    const on = app.cinematics;
    const sw = { x: P.x + 110, y: y - 22, w: 96, h: 44 };
    OP.rr(ctx, sw.x, sw.y, sw.w, sw.h, 22);
    OP.fs(ctx, on ? '#5fd068' : '#b9ad9f', OP.OUT, 3);
    OP.ell(ctx, on ? sw.x + sw.w - 22 : sw.x + 22, y, 17, 17);
    OP.fs(ctx, '#fffdf6', OP.OUT, 3);
    OP.text(ctx, on ? 'פועלים' : 'כבויים', P.x + 262, y, { size: 22, color: OP.OUT });
    app.ui.add({ x: sw.x - 10, y: sw.y - 10, w: 220, h: sw.h + 20 }, () => app.toggleCinematics());
  }
  const mb = { x: P.x + 56, y: P.y + P.h - 104, w: 200, h: 58 };
  const cb = { x: P.x + P.w - 256, y: P.y + P.h - 104, w: 200, h: 58 };
  OP.drawButton(ctx, mb, OP.Audio.muted ? 'בטל השתקה' : 'השתק הכל', {
    color: '#4a90d9',
    size: 22,
    icon: 'speaker',
    iconOpts: { off: !OP.Audio.muted, color: '#fff3d8' },
    hover: app.hover('mute', mb),
  });
  app.ui.add(mb, () => app.toggleMute());
  OP.drawButton(ctx, cb, 'סגירה', { color: '#4cb050', size: 24, icon: 'check', iconOpts: { color: '#ffffff' }, hover: app.hover('closeSet', cb) });
  app.ui.add(cb, () => app.closeSettings());
};

OP.PAUSE_BTNS = {
  resume: { x: 500, y: 250, w: 280, h: 70 },
  settings: { x: 500, y: 346, w: 280, h: 60 },
  home: { x: 500, y: 432, w: 280, h: 60 },
};

OP.drawPause = (ctx, app, t) => {
  ctx.fillStyle = 'rgba(20,10,5,.6)';
  ctx.fillRect(0, 0, 1280, 720);
  OP.panel(ctx, 440, 170, 400, 370, { title: 'הפסקה', icon: 'cup', titleW: 240 });
  const B = OP.PAUSE_BTNS;
  OP.drawButton(ctx, B.resume, 'המשך', { color: '#4cb050', size: 32, icon: 'play', t, hover: app.hover('resume', B.resume) });
  OP.drawButton(ctx, B.settings, 'הגדרות שמע', { color: '#4a90d9', size: 24, icon: 'music', iconOpts: { color: '#ffe38a' }, hover: app.hover('psettings', B.settings) });
  OP.drawButton(ctx, B.home, 'למסך הפתיחה', { color: '#d9483b', size: 24, icon: 'home', hover: app.hover('phome', B.home) });
  app.ui.add(B.resume, () => app.play.resume());
  app.ui.add(B.settings, () => app.openSettings());
  app.ui.add(B.home, () => app.toTitle());
};

OP.drawSummary = (ctx, app, t) => {
  const shop = app.play.shop;
  const st = shop.stats;
  const at = app.play.viewT;
  ctx.fillStyle = 'rgba(20,10,5,.62)';
  ctx.fillRect(0, 0, 1280, 720);
  const pop = OP.easeOutBack(Math.min(1, at * 3));
  ctx.save();
  ctx.translate(640, 360);
  ctx.scale(pop, pop);
  ctx.translate(-640, -360);
  OP.panel(ctx, 370, 70, 540, 590, { title: `סוף יום ${shop.day}`, icon: 'moon', titleW: 300 });
  const rows = [
    ['smile', 'לקוחות מרוצים', st.served],
    ['frown', 'לקוחות שעזבו', st.lost],
    ['coin', 'הכנסות', st.earned],
    ['heart', 'טיפים', st.tips],
  ];
  if (st.bonus) rows.push(['check', 'בונוס מהמפקח', st.bonus]);
  if (st.fines) rows.push(['receipt', 'קנסות', -st.fines]);
  if (st.uncollected) rows.push(['coin', 'מטבעות שנשכחו על הדלפק', -st.uncollected]);
  if (st.caught || st.escaped) rows.push(['badge', 'גנבים שנתפסו / ברחו', `${st.caught} / ${st.escaped}`]);
  rows.forEach(([icon, label, val], i) => {
    const y = 150 + i * 40;
    const k = OP.clamp((at - 0.3 - i * 0.1) * 5, 0, 1);
    if (!k) return;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate((1 - k) * 40, 0);
    OP.rr(ctx, 402, y - 18, 476, 36, 10);
    ctx.fillStyle = i % 2 ? 'rgba(200,150,90,.12)' : 'rgba(200,150,90,.24)';
    ctx.fill();
    OP.icon(ctx, icon, 850, y, 28);
    OP.text(ctx, label, 828, y + 1, { size: 22, weight: 700, color: OP.OUT, align: 'right' });
    const neg = typeof val === 'number' && val < 0;
    const shown = typeof val === 'number' ? Math.round(val * OP.clamp((at - 0.3 - i * 0.1) * 2, 0, 1)) : val;
    OP.text(ctx, String(shown), 424, y, { size: 24, color: neg ? '#d9483b' : '#2f7d3a', align: 'left', dir: 'ltr' });
    ctx.restore();
  });
  const total = st.earned + st.tips + st.bonus - st.fines;
  const ty = 150 + rows.length * 40 + 26;
  const tk = OP.clamp((at - 0.5 - rows.length * 0.1) * 4, 0, 1);
  if (tk > 0) {
    ctx.save();
    ctx.globalAlpha = tk;
    OP.text(ctx, 'רווח היום', 800, ty, { size: 30, color: '#8a3d17' });
    OP.coinIcon(ctx, 624, ty, 18);
    OP.text(ctx, String(Math.round(total * tk)), 548, ty, { size: 40, color: '#f2a20c', stroke: OP.OUT, lw: 7, dir: 'ltr' });
    const dRep = shop.save.rep - st.repStart;
    const sy = ty + 54;
    for (let i = 0; i < 5; i++) {
      const frac = OP.clamp(shop.save.rep - i, 0, 1);
      const sx = 560 + i * 40;
      OP.starPath(ctx, sx, sy, 17, 8);
      OP.fs(ctx, '#d8c8b4', OP.OUT, 2.5);
      if (frac > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(sx - 18, sy - 18, 36 * frac, 36);
        ctx.clip();
        OP.starPath(ctx, sx, sy, 17, 8);
        OP.fs(ctx, '#ffd23a', OP.OUT, 2.5);
        ctx.restore();
      }
    }
    OP.text(ctx, 'מוניטין', 812, sy, { size: 22, color: OP.OUT });
    if (Math.abs(dRep) > 0.01) OP.icon(ctx, dRep > 0 ? 'arrowUp' : 'arrowDown', 864, sy, 24);
    ctx.restore();
  }
  ctx.restore();
  const b = { x: 490, y: 574, w: 300, h: 68 };
  if (at > 0.9) {
    OP.drawButton(ctx, b, 'לחנות השדרוגים', { color: '#f59a23', size: 26, icon: 'cart', t, hover: app.hover('toShop', b) });
    app.ui.add(b, () => app.play.openShopScreen());
  }
};

OP.drawShop = (ctx, app, t) => {
  const play = app.play;
  const save = play.save;
  const mp = play.mp;
  ctx.fillStyle = 'rgba(20,10,5,.7)';
  ctx.fillRect(0, 0, 1280, 720);
  OP.panel(ctx, 36, 36, 1208, 662, { title: mp && mp.mode === 'coop' ? 'שדרוגים משותפים' : 'שדרוגים', icon: 'cart', titleW: mp && mp.mode === 'coop' ? 360 : 280 });
  OP.rr(ctx, 70, 56, 180, 52, 26);
  const cg = ctx.createLinearGradient(0, 56, 0, 108);
  cg.addColorStop(0, '#fffdf6');
  cg.addColorStop(1, '#f1e0c4');
  OP.fs(ctx, cg, OP.OUT, 3.5);
  OP.coinIcon(ctx, 224, 82, 19);
  OP.text(ctx, String(save.coins), 146, 84, { size: 30, color: OP.OUT, dir: 'ltr' });
  if (mp && mp.mode === 'coop') OP.text(ctx, 'קופה משותפת', 160, 124, { size: 16, weight: 700, color: '#6b4a32' });
  const nb = { x: 1000, y: 54, w: 210, h: 58 };
  if (mp && mp.mode === 'coop' && mp.role !== 'host') {
    OP.rr(ctx, nb.x - 20, nb.y + 6, nb.w + 20, 46, 23);
    OP.fs(ctx, 'rgba(255,253,246,.9)', OP.OUT, 3);
    OP.text(ctx, 'המארח יתחיל את היום', nb.x + nb.w / 2 - 10, nb.y + 30, { size: 20, color: '#6b4a32' });
  } else if (mp && mp.mode === 'versus') {
    const net = OP.Net;
    const active = play.activePlayers();
    const waiting = active.filter((p) => !play.ready[p]).length;
    if (play.ready[net.pid]) {
      OP.rr(ctx, nb.x - 40, nb.y + 6, nb.w + 40, 46, 23);
      OP.fs(ctx, '#e3f5de', '#2f7d3a', 3);
      OP.text(ctx, waiting ? `מחכים ל-${waiting} שחקנים` : 'מתחילים!', nb.x + nb.w / 2 - 20, nb.y + 30, { size: 20, color: '#2f7d3a' });
    } else {
      OP.drawButton(ctx, nb, 'מוכן!', { color: '#4cb050', size: 28, icon: 'check', iconOpts: { color: '#fff' }, t, hover: app.hover('nextDay', nb) });
      app.ui.add(nb, () => play.nextDay());
    }
  } else {
    OP.drawButton(ctx, nb, `יום ${save.day}`, { color: '#4cb050', size: 28, icon: 'play', t, hover: app.hover('nextDay', nb) });
    app.ui.add(nb, () => play.nextDay());
  }

  OP.CATS.forEach((cat, i) => {
    const r = { x: 1196 - (i + 1) * 214 + 8, y: 122, w: 204, h: 50 };
    const active = app.play.shopTab === cat.id;
    const h = app.hover('tab' + cat.id, r);
    OP.rr(ctx, r.x, r.y + (active ? 0 : 4), r.w, r.h, 16);
    const tg = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    tg.addColorStop(0, active ? '#ffe08a' : OP.shade('#ead9bd', h * 0.2));
    tg.addColorStop(1, active ? '#f5b94a' : '#d9c29c');
    OP.fs(ctx, tg, OP.OUT, active ? 4 : 3);
    OP.iconText(ctx, cat.icon, cat.name, r.x + r.w / 2, r.y + 26 + (active ? 0 : 4), { size: 24, color: active ? OP.OUT : '#6b4a32', iconSize: 30 });
    app.ui.add(r, () => {
      app.play.shopTab = cat.id;
    });
  });

  const list = OP.UPGRADES.filter((u) => u.cat === app.play.shopTab);
  const cw = 280;
  const ch = 116;
  list.forEach((u, k) => {
    const col = k % 4;
    const row = Math.floor(k / 4);
    const x = 1196 - cw - col * (cw + 12);
    const y = 188 + row * (ch + 10);
    const lvl = save.upgrades[u.id] || 0;
    const maxed = lvl >= u.levels.length;
    const next = u.levels[Math.min(lvl, u.levels.length - 1)];
    const afford = !maxed && save.coins >= next.price;
    const rect = { x, y, w: cw, h: ch };
    const h = maxed ? 0 : app.hover('card' + u.id, rect);
    const flash = app.play.bought === u.id ? Math.max(0, 1 - (t - app.play.boughtT) * 2) : 0;
    ctx.save();
    ctx.translate(x + cw / 2, y + ch / 2);
    const sc = 1 + h * 0.025 + flash * 0.06;
    ctx.scale(sc, sc);
    ctx.translate(-(x + cw / 2), -(y + ch / 2));
    OP.rr(ctx, x + 3, y + 6, cw, ch, 16);
    ctx.fillStyle = 'rgba(40,20,8,.18)';
    ctx.fill();
    OP.rr(ctx, x, y, cw, ch, 16);
    const bg = ctx.createLinearGradient(0, y, 0, y + ch);
    bg.addColorStop(0, maxed ? '#eaf8e4' : '#fffdf6');
    bg.addColorStop(1, maxed ? '#cfeac5' : '#f4e6ce');
    OP.fs(ctx, bg, afford && h ? '#e89a0c' : OP.OUT, afford && h ? 4 : 3);
    if (flash > 0) {
      OP.rr(ctx, x, y, cw, ch, 16);
      ctx.fillStyle = `rgba(255,220,80,${flash * 0.6})`;
      ctx.fill();
    }
    OP.ell(ctx, x + cw - 42, y + 44, 31, 31);
    const ig = ctx.createRadialGradient(x + cw - 50, y + 34, 4, x + cw - 42, y + 44, 32);
    ig.addColorStop(0, '#fff6dc');
    ig.addColorStop(1, '#ffd79a');
    OP.fs(ctx, ig, OP.OUT, 3);
    OP.icon(ctx, u.icon, x + cw - 42, y + 44, 44);
    for (let i = 0; i < u.levels.length; i++) {
      OP.ell(ctx, x + cw - 42 + (i - (u.levels.length - 1) / 2) * 16, y + 94, 6, 6);
      OP.fs(ctx, i < lvl ? '#4cc25a' : '#fff', OP.OUT, 2);
    }
    OP.text(ctx, u.name, x + cw - 84, y + 26, { size: 22, color: OP.OUT, align: 'right' });
    const lines = OP.wrapText(ctx, maxed ? u.levels[u.levels.length - 1].desc : next.desc, 176, 16, 600);
    lines.slice(0, 2).forEach((ln, i) => OP.text(ctx, ln, x + cw - 84, y + 52 + i * 20, { size: 16, weight: 600, color: '#6b4a32', align: 'right' }));
    if (maxed) {
      OP.iconText(ctx, 'check', 'נקנה', x + 62, y + 92, { size: 20, color: '#2f7d3a', iconSize: 22 });
    } else {
      const b = { x: x + 12, y: y + 76, w: 112, h: 32 };
      OP.rr(ctx, b.x, b.y + 3, b.w, b.h, 12);
      ctx.fillStyle = OP.OUT;
      ctx.fill();
      OP.rr(ctx, b.x, b.y, b.w, b.h, 12);
      const pg = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
      pg.addColorStop(0, afford ? '#ffe07a' : '#dcd2c6');
      pg.addColorStop(1, afford ? '#f5a91c' : '#b9ad9f');
      OP.fs(ctx, pg, OP.OUT, 3);
      OP.text(ctx, String(next.price), b.x + 44, b.y + 17, { size: 20, color: afford ? OP.OUT : '#6e6258', dir: 'ltr' });
      OP.coinIcon(ctx, b.x + 92, b.y + 16, 10);
      app.ui.add(rect, () => app.play.buy(u.id));
    }
    ctx.restore();
  });
  // purchases by other players, drawn over the cards
  if (play.toasts) OP.drawToasts(ctx, play, t, 640, -42);
};
