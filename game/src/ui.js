// הפיטסרי של אוסקר — in-game overlays: HUD, Oscar's speech, tutorial pointers, banner, prep checklist, effects
var OP = globalThis.OP || (globalThis.OP = {});

OP.OSCAR_POS = { x: 104, y: 356, s: 0.85 };

// The top HUD slides down by OP.hudY when the phone view is zoomed in.
OP.hudY = 0;
OP.hudRect = (r) => ({ x: r.x, y: r.y + (OP.hudY || 0), w: r.w, h: r.h });

OP.drawHUD = (ctx, shop, t, app) => {
  const hov = (id, r) => (app ? app.hover(id, OP.hudRect(r)) : 0);
  ctx.save();
  ctx.translate(0, OP.hudY || 0);
  // day calendar hanging on a nail
  const cx = 24;
  const cy = 16;
  ctx.beginPath();
  ctx.moveTo(cx + 14, cy + 8);
  ctx.lineTo(cx + 32, cy - 6);
  ctx.lineTo(cx + 50, cy + 8);
  ctx.strokeStyle = OP.OUT;
  ctx.lineWidth = 2;
  ctx.stroke();
  OP.ell(ctx, cx + 32, cy - 6, 4, 4);
  OP.fs(ctx, '#aaa', OP.OUT, 2);
  OP.rr(ctx, cx + 3, cy + 11, 64, 70, 8);
  ctx.fillStyle = 'rgba(20,10,4,.3)';
  ctx.fill();
  OP.rr(ctx, cx, cy + 6, 64, 70, 8);
  OP.fs(ctx, '#fffdf6', OP.OUT, 3.5);
  ctx.save();
  OP.rr(ctx, cx, cy + 6, 64, 70, 8);
  ctx.clip();
  const rg = ctx.createLinearGradient(0, cy + 6, 0, cy + 28);
  rg.addColorStop(0, '#f06a5c');
  rg.addColorStop(1, '#d8392d');
  ctx.fillStyle = rg;
  ctx.fillRect(cx, cy + 6, 64, 22);
  ctx.restore();
  OP.rr(ctx, cx, cy + 6, 64, 70, 8);
  OP.fs(ctx, null, OP.OUT, 3.5);
  OP.text(ctx, 'DAY', cx + 32, cy + 18, { size: 16, color: '#fff', dir: 'ltr' });
  OP.text(ctx, String(shop.day), cx + 32, cy + 52, { size: 34, color: OP.OUT, dir: 'ltr' });

  // wooden clock sign + day progress
  const kx = 102;
  const ky = 24;
  OP.rr(ctx, kx + 3, ky + 5, 122, 56, 12);
  ctx.fillStyle = 'rgba(20,10,4,.3)';
  ctx.fill();
  OP.rr(ctx, kx, ky, 122, 56, 12);
  const wg = ctx.createLinearGradient(0, ky, 0, ky + 56);
  wg.addColorStop(0, '#a86c38');
  wg.addColorStop(1, '#7a4a22');
  OP.fs(ctx, wg, OP.OUT, 3.5);
  OP.rr(ctx, kx + 10, ky + 10, 102, 36, 6);
  OP.fs(ctx, '#140c08', null);
  if (shop.phase === 'shift' || shop.phase === 'closing') {
    const s = Math.max(0, Math.ceil(shop.time));
    const low = s <= 15;
    const txt = Math.floor(s / 60) + ':' + OP.pad2(s % 60);
    if (!(low && Math.sin(t * 10) < -0.3)) {
      OP.text(ctx, txt, kx + 61, ky + 29, { size: 28, color: low ? '#ff5040' : '#7dff8a', dir: 'ltr' });
    }
    const prog = 1 - shop.time / shop.dayLength;
    OP.rr(ctx, kx + 6, ky + 62, 110, 10, 5);
    OP.fs(ctx, '#3a2414', OP.OUT, 2);
    OP.rr(ctx, kx + 8, ky + 64, Math.max(4, 106 * OP.clamp(prog, 0, 1)), 6, 3);
    ctx.fillStyle = low ? '#ff6a4a' : '#ffc94a';
    ctx.fill();
  } else {
    OP.text(ctx, 'הכנות', kx + 61, ky + 29, { size: 22, color: '#ffd23a' });
  }

  // coins
  const coins = Math.round(shop.coinShown);
  const incoming = shop.flights.some((f) => f.kind === 'coin' && f.t > f.dur * 0.6);
  const bump = incoming ? 1 + Math.abs(Math.sin(t * 22)) * 0.12 : 1;
  OP.rr(ctx, 1039, 23, 166, 50, 25);
  ctx.fillStyle = 'rgba(20,10,4,.3)';
  ctx.fill();
  OP.rr(ctx, 1036, 18, 166, 50, 25);
  const cg = ctx.createLinearGradient(0, 18, 0, 68);
  cg.addColorStop(0, '#fffdf6');
  cg.addColorStop(1, '#f1e0c4');
  OP.fs(ctx, cg, OP.OUT, 3.5);
  ctx.save();
  ctx.translate(OP.L.coinHud.x, OP.L.coinHud.y);
  ctx.scale(bump, bump);
  OP.coinIcon(ctx, 0, 0, 19);
  ctx.restore();
  OP.text(ctx, String(coins), 1102, 45, { size: 30, color: OP.OUT, dir: 'ltr' });

  // reputation stars
  OP.rr(ctx, 1046, 76, 146, 32, 16);
  OP.fs(ctx, 'rgba(40,22,12,.8)', OP.OUT, 2.5);
  for (let i = 0; i < 5; i++) {
    const sx = 1068 + i * 25;
    const frac = OP.clamp(shop.save.rep - i, 0, 1);
    OP.starPath(ctx, sx, 92, 11, 5);
    OP.fs(ctx, '#6b5a4a', '#1d110a', 2);
    if (frac > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx - 12, 78, 24 * frac, 28);
      ctx.clip();
      OP.starPath(ctx, sx, 92, 11, 5);
      OP.fs(ctx, '#ffd23a', '#1d110a', 2);
      ctx.restore();
    }
  }
  if (shop.combo >= 2) {
    const pop = 1 + Math.sin(t * 6) * 0.04;
    ctx.save();
    ctx.translate(1119, 128);
    ctx.scale(pop, pop);
    OP.rr(ctx, -66, -16, 132, 32, 16);
    const pg = ctx.createLinearGradient(0, -16, 0, 16);
    pg.addColorStop(0, '#ffa6d6');
    pg.addColorStop(1, '#e45fa8');
    OP.fs(ctx, pg, OP.OUT, 3);
    OP.iconText(ctx, 'heart', 'רצף ×' + shop.combo, 0, 1, { size: 20, color: '#fff', stroke: '#8f2e66', lw: 5, iconSize: 22 });
    ctx.restore();
  }

  const pb = OP.L.pauseBtn;
  const mb = OP.L.muteBtn;
  OP.drawRoundButton(ctx, pb.x + 26, pb.y + 26, 24, 'pause', { hover: hov('hudPause', pb) });
  const silent = OP.Audio.muted || OP.Audio.musicVol <= 0;
  OP.drawRoundButton(ctx, mb.x + 26, mb.y + 26, 24, silent ? 'speaker' : 'music', { hover: hov('hudMusic', mb), iconOpts: silent ? { off: true } : {} });
  ctx.restore();
};

OP.drawSpeech = (ctx, shop, t) => {
  const sp = shop.speech;
  if (!sp) return;
  const pop = OP.easeOutBack(Math.min(1, sp.t * 4));
  const lines = OP.wrapText(ctx, sp.text, 282, 21, 700);
  const w = 312;
  const h = lines.length * 26 + 30;
  const x = 16;
  // stay below the HUD, which slides down in the zoomed phone view
  const y = Math.max(96 + (OP.hudY || 0), 232 - h);
  ctx.save();
  ctx.translate(x + 90, y + h);
  ctx.scale(pop, pop);
  ctx.translate(-(x + 90), -(y + h));
  OP.rr(ctx, x + 4, y + 7, w, h, 18);
  ctx.fillStyle = 'rgba(20,10,4,.3)';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 70, y + h - 3);
  ctx.lineTo(x + 112, y + h - 3);
  ctx.lineTo(x + 92, y + h + 22);
  ctx.closePath();
  OP.fs(ctx, '#fffdf6', OP.OUT, 4);
  OP.rr(ctx, x, y, w, h, 18);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#f7ecd8');
  OP.fs(ctx, g, OP.OUT, 4);
  ctx.fillStyle = '#f9f0de';
  ctx.fillRect(x + 72, y + h - 6, 38, 6);
  OP.rr(ctx, x + w - 96, y - 14, 84, 26, 13);
  OP.fs(ctx, '#ee7b95', OP.OUT, 3);
  OP.iconText(ctx, 'chefHat', 'אוסקר', x + w - 54, y - 1, { size: 16, color: '#fff', stroke: '#8f2e46', lw: 4, iconSize: 18 });
  lines.forEach((ln, i) => OP.text(ctx, ln, x + w - 16, y + 30 + i * 26, { size: 21, weight: 700, color: OP.OUT, align: 'right' }));
  ctx.restore();
};

OP.tutorialTarget = (shop) => {
  if (shop.tutorial < 0) return null;
  const step = OP.TUTORIAL[shop.tutorial];
  if (!step || step.phase !== shop.phase || !step.target) return null;
  const L = OP.L;
  switch (step.target) {
    case 'fix_oven':
      return { x: L.ovenWrench.x - 32, y: L.ovenWrench.y - 32, w: 64, h: 64 };
    case 'dough':
      return L.dough;
    case 'oven':
      return L.oven;
    case 'refill_choc': {
      const p = OP.refillPos('choc');
      return { x: p.x - 22, y: p.y - 22, w: 44, h: 44 };
    }
    case 'openBtn':
      return L.openBtn;
    case 'basket':
      return L.basket;
    case 'board': {
      const i = shop.boards.findIndex((b) => b);
      return L.boards[i < 0 ? 0 : i];
    }
    case 'choc':
      return L.trays.choc;
    case 'bags':
      return L.bags;
    case 'customer': {
      const c = shop.tutCustomer;
      return c && c.state === 'waiting' ? { x: c.x - 55, y: 230, w: 110, h: 170 } : null;
    }
    case 'coins': {
      const cn = shop.coins[0];
      return cn ? { x: cn.x - 32, y: cn.y - 48, w: 64, h: 58 } : null;
    }
  }
  return null;
};

const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

OP.drawTutorial = (ctx, shop, t) => {
  const r = OP.tutorialTarget(shop);
  if (!r) return;
  const p = (Math.sin(t * 6) + 1) / 2;
  ctx.save();
  OP.rr(ctx, r.x - 8 - p * 4, r.y - 8 - p * 4, r.w + 16 + p * 8, r.h + 16 + p * 8, 16);
  ctx.strokeStyle = 'rgba(40,20,10,.6)';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.strokeStyle = '#ffe14d';
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 10]);
  ctx.lineDashOffset = -t * 40;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const step = OP.TUTORIAL[shop.tutorial];
  const L = OP.L;
  const board = shop.boards.findIndex((b) => b);
  const bc = shop.boardCenter(board < 0 ? 0 : board);
  const ph = (t % 1.8) / 1.8;
  let hx = null;
  let hy = null;
  let press = false;
  const along = (a, b) => {
    const e = OP.clamp(ph * 1.4 - 0.2, 0, 1);
    hx = OP.lerp(a.x, b.x, e);
    hy = OP.lerp(a.y, b.y, e);
    press = e > 0 && e < 1;
  };
  switch (step.target) {
    case 'dough':
      hx = L.dough.x + 40 + Math.abs(Math.sin(t * 3)) * 120;
      hy = L.dough.y + 50;
      press = true;
      break;
    case 'basket':
      along(center(L.basket), bc);
      break;
    case 'choc':
      if (ph < 0.5) along(center(L.trays.choc), bc);
      else {
        hx = bc.x + Math.sin(t * 12) * 40;
        hy = bc.y;
        press = true;
      }
      break;
    case 'bags':
      along(center(L.bags), bc);
      break;
    case 'board':
      press = true;
      if (shop.tutorial === 6) {
        hx = bc.x - 60 + ph * 120;
        hy = bc.y;
      } else {
        hx = bc.x + Math.cos(t * 5) * 50;
        hy = bc.y + Math.sin(t * 5) * 34;
      }
      break;
    case 'customer':
      if (shop.tutCustomer) along(bc, { x: shop.tutCustomer.x, y: 330 });
      break;
    default: {
      const c = center(r);
      hx = c.x;
      hy = c.y - 6 * Math.abs(Math.sin(t * 6));
    }
  }
  if (hx != null) {
    if (press) {
      OP.ell(ctx, hx - 4, hy - 4, 14, 14);
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.fill();
    }
    OP.icon(ctx, 'hand', hx + 8, hy + 34, 62, { rot: -0.2 });
  }
};

OP.drawBanner = (ctx, shop, t) => {
  if (shop.phase !== 'banner') return;
  const pt = shop.phaseT;
  const inS = OP.easeOutBack(Math.min(1, pt * 3));
  const alpha = pt > 1.9 ? Math.max(0, 1 - (pt - 1.9) * 3) : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(20,10,5,.3)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.translate(640, 250);
  ctx.scale(inS, inS);
  ctx.rotate(Math.sin(pt * 3) * 0.01);
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.fillRect(-292, -80, 600, 190);
  ctx.fillStyle = '#000';
  ctx.fillRect(-300, -95, 600, 190);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-286, -81, 572, 162);
  ctx.font = `900 130px "Arial Black", ${OP.FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.fillStyle = '#000';
  ctx.fillText('DAY ' + OP.pad2(shop.day), 0, 8);
  ctx.restore();
};

OP.drawPrepPanel = (ctx, shop, t, app) => {
  if (shop.phase !== 'prep') return;
  const r = OP.L.prepPanel;
  OP.panel(ctx, r.x, r.y, r.w, r.h, { title: 'הכנות לפני פתיחה', icon: 'clipboard', titleW: 330 });
  const ch = shop.prepChecks();
  const rows = [
    ['wrench', 'בדיקת ציוד', ch.equip],
    ['croissant', 'אפייה ראשונה: 3 קרואסונים', ch.bake],
    ['refresh', 'מילוי המגשים (חצי לפחות)', ch.trays],
  ];
  rows.forEach(([icon, label, ok], i) => {
    const y = r.y + 58 + i * 33;
    const bx = r.x + r.w - 58;
    OP.rr(ctx, bx, y - 13, 26, 26, 7);
    OP.fs(ctx, ok ? '#4cc25a' : '#fff', OP.OUT, 3);
    if (ok) OP.icon(ctx, 'check', bx + 13, y, 24, { color: '#ffffff' });
    OP.icon(ctx, icon, bx - 20, y, 24);
    OP.text(ctx, label, bx - 40, y + 1, { size: 20, weight: 700, color: ok ? '#2f7d3a' : OP.OUT, align: 'right' });
  });
  const all = ch.equip && ch.bake && ch.trays;
  const b = OP.L.openBtn;
  const pulse = all ? 1 + Math.sin(t * 6) * 0.04 : 1;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
  OP.drawButton(ctx, b, 'פתיחה!', { color: all ? '#4cb050' : '#e58c2f', size: 26, icon: 'play', t, hover: app ? app.hover('open', b) : 0 });
  ctx.restore();
};

OP.drawFx = (ctx, shop) => {
  for (const e of shop.fx) {
    if (e.type !== 'p') continue;
    OP.ell(ctx, e.x, e.y, e.size, e.size);
    ctx.fillStyle = e.color;
    ctx.globalAlpha = Math.max(0, 1 - e.t / e.life);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const e of shop.fx) {
    if (e.type !== 'text') continue;
    const k = e.t / e.life;
    const a = k > 0.65 ? 1 - (k - 0.65) / 0.35 : 1;
    const s = OP.easeOutBack(Math.min(1, e.t * 7));
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.translate(e.x, e.y - e.t * 40);
    ctx.scale(s, s);
    OP.iconText(ctx, e.icon, e.text, 0, 0, {
      size: e.size,
      color: e.color,
      stroke: OP.OUT,
      lw: 6,
      dir: /^[+\-]?\d/.test(e.text) ? 'ltr' : 'rtl',
    });
    ctx.restore();
  }
};
