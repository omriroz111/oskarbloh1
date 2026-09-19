// הפיטסרי של אוסקר — kitchen stations drawn every frame from shop state
var OP = globalThis.OP || (globalThis.OP = {});

OP.drawOven = (ctx, shop, t) => {
  const r = OP.L.oven;
  const o = shop.oven;
  OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h + 6, 120, 18, 0.35);
  OP.rr(ctx, r.x + 14, r.y + r.h - 10, 26, 20, 4);
  OP.fs(ctx, '#3a3f45', OP.OUT, 3);
  OP.rr(ctx, r.x + r.w - 40, r.y + r.h - 10, 26, 20, 4);
  OP.fs(ctx, '#3a3f45', OP.OUT, 3);
  OP.rr(ctx, r.x, r.y, r.w, r.h - 4, 18);
  const g = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
  g.addColorStop(0, '#5f6b76');
  g.addColorStop(0.35, '#9aa7b1');
  g.addColorStop(0.6, '#8391a0');
  g.addColorStop(1, '#4f5a64');
  OP.fs(ctx, g, OP.OUT, 4);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.fillRect(r.x + 60, r.y + 6, 10, r.h - 20);
  // brass crest
  OP.rr(ctx, r.x + r.w / 2 - 36, r.y - 12, 72, 20, 8);
  OP.fs(ctx, '#d6a84a', OP.OUT, 3);
  OP.text(ctx, 'OSCAR', r.x + r.w / 2, r.y - 2, { size: 14, color: '#5a2e12', dir: 'ltr' });
  // control strip
  OP.rr(ctx, r.x + 10, r.y + 12, r.w - 20, 36, 8);
  OP.fs(ctx, '#39424a', OP.OUT, 3);
  OP.rr(ctx, r.x + 20, r.y + 19, 74, 22, 4);
  OP.fs(ctx, '#140c08', null);
  const baking = o.slots.find((s) => s.state === 'baking');
  const disp = o.fault ? (Math.sin(t * 10) > 0 ? 'ERR' : '') : baking ? Math.ceil(shop.bakeTime - baking.t) + 's' : 'OK';
  OP.text(ctx, disp, r.x + 57, r.y + 31, { size: 18, color: o.fault ? '#ff4a3a' : '#ffa240', dir: 'ltr' });
  for (const k of [0, 1]) {
    OP.ell(ctx, r.x + 122 + k * 34, r.y + 30, 11, 11);
    OP.fs(ctx, '#d7dde2', OP.OUT, 3);
    ctx.save();
    ctx.translate(r.x + 122 + k * 34, r.y + 30);
    ctx.rotate(k ? 0.8 : -0.4 + (baking ? Math.sin(t * 2) * 0.1 : 0));
    ctx.fillStyle = OP.OUT;
    ctx.fillRect(-1.5, -9, 3, 8);
    ctx.restore();
  }
  const wx = r.x + 16;
  const wy = r.y + 58;
  const ww = r.w - 32;
  const wh = 148;
  OP.rr(ctx, wx, wy, ww, wh, 12);
  if (o.fault) {
    OP.fs(ctx, Math.sin(t * 13) > 0.6 ? '#3b2a20' : '#231a15', OP.OUT, 4);
  } else {
    const wg = ctx.createLinearGradient(0, wy, 0, wy + wh);
    const flick = Math.sin(t * 7) * 0.04 + Math.sin(t * 17) * 0.02;
    wg.addColorStop(0, OP.shade('#ffc15a', flick));
    wg.addColorStop(0.6, '#f07c2a');
    wg.addColorStop(1, '#b53f18');
    OP.fs(ctx, wg, OP.OUT, 4);
  }
  ctx.save();
  OP.rr(ctx, wx, wy, ww, wh, 12);
  ctx.clip();
  for (const ry of [wy + 60, wy + 132]) {
    ctx.fillStyle = 'rgba(60,30,15,.55)';
    ctx.fillRect(wx, ry, ww, 5);
  }
  if (!o.fault) {
    for (let k = 0; k < 7; k++) {
      const fx = wx + 8 + k * 24;
      const fh = 9 + Math.sin(t * 9 + k * 2) * 4;
      OP.ell(ctx, fx, wy + wh - 3, 8, fh);
      ctx.fillStyle = k % 2 ? 'rgba(255,200,80,.6)' : 'rgba(255,90,20,.55)';
      ctx.fill();
    }
  }
  o.slots.forEach((s, i) => {
    if (s.state === 'empty' || shop.inFlight('slot' + i)) return;
    const p = OP.ovenSlotPos(shop, i);
    const bake = s.state === 'baking' ? s.t / shop.bakeTime : 1;
    let sc = p.s;
    if (s.state === 'ready') {
      const glow = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 46);
      glow.addColorStop(0, `rgba(255,244,160,${0.6 + Math.sin(t * 8) * 0.2})`);
      glow.addColorStop(1, 'rgba(255,240,150,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - 46, p.y - 46, 92, 92);
      sc *= 1 + Math.abs(Math.sin(t * 6)) * 0.05;
    }
    OP.drawCroissant(ctx, p.x, p.y, sc, { state: s.state === 'burnt' ? 'burnt' : 'raw', bake, noShadow: true });
    if (s.state === 'ready') {
      const sp = (t * 1.5 + i * 0.3) % 1;
      OP.icon(ctx, 'sparkle', p.x + 24, p.y - 18 - sp * 10, 16 * (1 - sp) + 4, { color: '#fffbe0' });
    }
  });
  ctx.fillStyle = 'rgba(255,255,255,.15)';
  ctx.beginPath();
  ctx.moveTo(wx + 22, wy);
  ctx.lineTo(wx + 64, wy);
  ctx.lineTo(wx + 22, wy + wh);
  ctx.lineTo(wx - 20, wy + wh);
  ctx.fill();
  ctx.restore();
  o.slots.forEach((s, i) => {
    if (s.state === 'empty' || s.state === 'burnt' || shop.inFlight('slot' + i)) return;
    const p = OP.ovenSlotPos(shop, i);
    const bw = 46;
    OP.rr(ctx, p.x - bw / 2, p.y + 20, bw, 10, 5);
    OP.fs(ctx, '#2a1a10', OP.OUT, 2);
    let frac;
    let color;
    if (s.state === 'baking') {
      frac = s.t / shop.bakeTime;
      color = '#5fd068';
    } else if (shop.noBurn) {
      frac = 1;
      color = '#ffd23a';
    } else {
      frac = 1 - s.t / shop.burnGrace;
      color = frac > 0.4 ? '#ffd23a' : Math.sin(t * 20) > 0 ? '#ff4a3a' : '#ff9a3a';
    }
    OP.rr(ctx, p.x - bw / 2 + 2, p.y + 22, (bw - 4) * OP.clamp(frac, 0, 1), 6, 3);
    ctx.fillStyle = color;
    ctx.fill();
  });
  OP.rr(ctx, r.x + 26, r.y + 214, r.w - 52, 12, 6);
  const hg = ctx.createLinearGradient(0, r.y + 214, 0, r.y + 226);
  hg.addColorStop(0, '#f4f6f8');
  hg.addColorStop(1, '#aab4ba');
  OP.fs(ctx, hg, OP.OUT, 3);
  if (!o.fault && baking) {
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.8 + k / 3) % 1;
      ctx.globalAlpha = 1 - ph;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) ctx[i ? 'lineTo' : 'moveTo'](r.x + 60 + k * 40 + Math.sin(t * 5 + i + k) * 5, r.y - 14 - ph * 40 - i * 6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (o.smoke) {
    for (let k = 0; k < 6; k++) {
      const ph = (t * 0.6 + k / 6) % 1;
      OP.ell(ctx, r.x + 50 + k * 20 + Math.sin(t * 2 + k) * 12, r.y - ph * 100, 16 + ph * 26, 14 + ph * 22);
      ctx.fillStyle = `rgba(70,66,64,${0.55 * (1 - ph)})`;
      ctx.fill();
    }
  }
  if (o.fault) OP.wrenchBadge(ctx, OP.L.ovenWrench.x, OP.L.ovenWrench.y, t, shop.fix.oven / shop.fixTime);
};

OP.drawRefillButton = (ctx, shop, id, t) => {
  const p = OP.refillPos(id);
  const tr = id === 'dough' ? shop.dough : shop.trays[id];
  if (tr.refillT > 0) {
    OP.ell(ctx, p.x, p.y, 19, 19);
    OP.fs(ctx, '#fffaf0', OP.OUT, 3);
    OP.progressRing(ctx, p.x, p.y, 12, 1 - tr.refillT / shop.refillTime, '#4cc25a', 5);
    return;
  }
  const low = tr.amount <= Math.max(1, tr.max * 0.25) || tr.dirty;
  const pulse = low ? 1 + Math.sin(t * 9) * 0.14 : 1;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(pulse, pulse);
  OP.ell(ctx, 0, 3, 18, 18);
  ctx.fillStyle = 'rgba(30,15,5,.35)';
  ctx.fill();
  OP.ell(ctx, 0, 0, 18, 18);
  OP.fs(ctx, low ? '#fff08a' : '#fffaf0', OP.OUT, 3);
  OP.refillIcon(ctx, 0, 0, 26, low ? Math.sin(t * 9) * 0.3 : 0);
  ctx.restore();
};

function lockedLid(ctx, r) {
  OP.rr(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 12);
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, '#b8c0c6');
  g.addColorStop(1, '#8e979e');
  OP.fs(ctx, g, OP.OUT, 3);
  OP.rr(ctx, r.x + r.w / 2 - 16, r.y + 10, 32, 8, 4);
  OP.fs(ctx, '#d3d9dd', OP.OUT, 2);
  OP.icon(ctx, 'lock', r.x + r.w / 2, r.y + r.h / 2 + 6, 34);
}

OP.drawDough = (ctx, shop, t) => {
  const r = OP.L.dough;
  const d = shop.dough;
  OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h + 2, 110, 14, 0.3);
  OP.rr(ctx, r.x, r.y, r.w, r.h, 14);
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, '#dca56b');
  g.addColorStop(1, '#b77c45');
  OP.fs(ctx, g, OP.OUT, 4);
  ctx.fillStyle = 'rgba(120,70,30,.3)';
  for (let k = 0; k < 7; k++) ctx.fillRect(r.x + 12, r.y + 12 + k * 15, r.w - 24, 2);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  for (let k = 0; k < 18; k++) ctx.fillRect(r.x + 10 + ((k * 53) % (r.w - 20)), r.y + 8 + ((k * 29) % (r.h - 16)), 4, 4);
  const frac = d.amount / d.max;
  if (d.amount > 0) {
    const sw = (r.w - 34) * frac;
    const sx = r.x + 17;
    const sy = r.y + 18;
    const sh = r.h - 44;
    OP.rr(ctx, sx, sy + 3, sw, sh, 12);
    ctx.fillStyle = 'rgba(100,60,20,.25)';
    ctx.fill();
    OP.rr(ctx, sx, sy, sw, sh, 12);
    const dg = ctx.createLinearGradient(0, sy, 0, sy + sh);
    dg.addColorStop(0, '#fff1d2');
    dg.addColorStop(1, '#efd29d');
    OP.fs(ctx, dg, '#a9793f', 3);
    ctx.save();
    OP.rr(ctx, sx, sy, sw, sh, 12);
    ctx.clip();
    ctx.strokeStyle = 'rgba(160,110,60,.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= d.amount; k++) {
      const x = sx + (k * sw) / Math.max(1, d.amount);
      ctx.moveTo(x, sy);
      ctx.lineTo(x + (k % 2 ? 1 : -1) * 16, sy + sh);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.fillRect(sx + 8, sy + 5, Math.max(0, sw - 16), 4);
    ctx.restore();
    if (d.cuts > 0) {
      ctx.beginPath();
      ctx.moveTo(sx + sw - 30, sy + 4);
      ctx.lineTo(sx + sw - 8, sy + sh - 4);
      ctx.strokeStyle = OP.OUT;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  } else if (d.refillT <= 0) {
    OP.text(ctx, 'אין בצק', r.x + r.w / 2 + 10, r.y + 50, { size: 22, color: '#fff', stroke: OP.OUT });
  }
  if (d.refillT > 0) {
    const roll = ((t * 60) % (r.w - 70)) + 36;
    OP.rr(ctx, r.x + roll - 44, r.y + 36, 88, 24, 12);
    OP.fs(ctx, '#e8bb82', OP.OUT, 3);
    for (const k of [-1, 1]) {
      OP.rr(ctx, r.x + roll + k * 50 - 7, r.y + 42, 14, 12, 5);
      OP.fs(ctx, '#9a6538', OP.OUT, 2.5);
    }
  }
  OP.rr(ctx, r.x + 36, r.y + r.h - 22, 56, 10, 5);
  OP.fs(ctx, '#7a4520', OP.OUT, 2.5);
  OP.ell(ctx, r.x + 102, r.y + r.h - 17, 12, 12);
  OP.fs(ctx, '#e3e8eb', OP.OUT, 2.5);
  OP.rr(ctx, r.x + r.w - 76, r.y + r.h - 28, 64, 22, 11);
  OP.fs(ctx, 'rgba(59,35,20,.8)', null);
  OP.text(ctx, `בצק ${d.amount}`, r.x + r.w - 44, r.y + r.h - 16, { size: 16, color: '#fff' });
  OP.drawRefillButton(ctx, shop, 'dough', t);
};

OP.drawBasket = (ctx, shop, t, reserved = 0) => {
  const r = OP.L.basket;
  const cx = r.x + r.w / 2;
  const n = Math.max(0, shop.basket - reserved - shop.inFlight('basket'));
  OP.softShadow(ctx, cx, r.y + r.h + 2, 72, 14, 0.35);
  OP.ell(ctx, cx, r.y + 34, 58, 18);
  OP.fs(ctx, '#7a4520', OP.OUT, 3);
  const spots = [[-28, 34, -0.3], [26, 34, 0.3], [0, 30, 0], [-16, 18, -0.2], [16, 18, 0.25], [0, 8, 0.05], [-30, 8, -0.4], [30, 8, 0.4]];
  for (let i = 0; i < Math.min(n, spots.length); i++) {
    const [dx, dy, rot] = spots[i];
    OP.drawCroissant(ctx, cx + dx, r.y + dy, 0.36, { state: 'baked', rot, noShadow: true });
  }
  ctx.beginPath();
  ctx.moveTo(r.x + 2, r.y + 36);
  ctx.quadraticCurveTo(cx, r.y + 58, r.x + r.w - 2, r.y + 36);
  ctx.lineTo(r.x + r.w - 14, r.y + r.h - 6);
  ctx.quadraticCurveTo(cx, r.y + r.h + 6, r.x + 14, r.y + r.h - 6);
  ctx.closePath();
  const bg = ctx.createLinearGradient(0, r.y + 36, 0, r.y + r.h);
  bg.addColorStop(0, '#d89a58');
  bg.addColorStop(1, '#a86a32');
  OP.fs(ctx, bg, OP.OUT, 4);
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#7a4520';
  ctx.lineWidth = 3;
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + 52 + k * 14);
    for (let x = r.x; x <= r.x + r.w; x += 12) ctx.lineTo(x, r.y + 52 + k * 14 + ((x / 12) % 2 ? 4 : -4));
    ctx.stroke();
  }
  ctx.restore();
  OP.ell(ctx, cx, r.y + 36, 60, 10);
  ctx.strokeStyle = OP.OUT;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.strokeStyle = '#c88a4a';
  ctx.lineWidth = 3;
  ctx.stroke();
  const empty = n === 0;
  const bump = empty ? 1 + Math.sin(t * 8) * 0.08 : 1;
  ctx.save();
  ctx.translate(r.x + r.w - 6, r.y + 12);
  ctx.scale(bump, bump);
  OP.ell(ctx, 0, 0, 17, 17);
  OP.fs(ctx, empty ? '#ff5a3c' : '#fffaf0', OP.OUT, 3);
  OP.text(ctx, String(n), 0, 1, { size: 20, color: empty ? '#fff' : OP.OUT, dir: 'ltr' });
  ctx.restore();
};

OP.drawTray = (ctx, shop, id, t) => {
  const r = OP.L.trays[id];
  const tr = shop.trays[id];
  const isBowl = id === 'sugar' || id === 'almond';
  OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h, r.w * 0.55, 10, 0.28);
  if (!shop.unlocked(id)) {
    lockedLid(ctx, r);
    return;
  }
  if (isBowl) {
    const cx = r.x + r.w / 2;
    OP.ell(ctx, cx, r.y + 30, 36, 13);
    OP.fs(ctx, '#2f5d80', OP.OUT, 3);
    const frac = tr.amount / tr.max;
    if (tr.amount > 0) {
      const mh = 6 + frac * 16;
      ctx.beginPath();
      ctx.moveTo(cx - 30, r.y + 32);
      ctx.quadraticCurveTo(cx, r.y + 30 - mh * 2, cx + 30, r.y + 32);
      ctx.closePath();
      if (id === 'sugar') {
        OP.fs(ctx, '#ffffff', OP.OUT, 2.5);
        const sp = (t * 0.7) % 1;
        OP.icon(ctx, 'sparkle', cx + 10, r.y + 18 - frac * 10, 12 * (1 - sp) + 4, { color: '#dff4ff' });
      } else {
        OP.fs(ctx, '#e6c08e', OP.OUT, 2.5);
        for (let k = 0; k < Math.ceil(frac * 7); k++) {
          OP.ell(ctx, cx - 18 + ((k * 13) % 36), r.y + 26 - ((k * 7) % 12) * frac, 6, 3.5, k);
          OP.fs(ctx, '#f3d8ab', '#7a4a22', 1.5);
        }
      }
    }
    ctx.beginPath();
    ctx.moveTo(cx - 37, r.y + 30);
    ctx.quadraticCurveTo(cx - 36, r.y + 70, cx, r.y + 70);
    ctx.quadraticCurveTo(cx + 36, r.y + 70, cx + 37, r.y + 30);
    ctx.quadraticCurveTo(cx, r.y + 44, cx - 37, r.y + 30);
    const bg = ctx.createLinearGradient(0, r.y + 30, 0, r.y + 70);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(1, '#dfe7ef');
    OP.fs(ctx, bg, OP.OUT, 3);
    ctx.strokeStyle = '#4c86c6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 32, r.y + 50);
    ctx.quadraticCurveTo(cx, r.y + 60, cx + 32, r.y + 50);
    ctx.stroke();
    OP.rr(ctx, cx - 30, r.y + r.h - 6, 60, 18, 9);
    OP.fs(ctx, 'rgba(59,35,20,.82)', null);
    OP.text(ctx, OP.TOPPINGS[id].name, cx, r.y + r.h + 3, { size: 12, color: '#fff' });
  } else {
    OP.rr(ctx, r.x, r.y, r.w, r.h, 10);
    const sg = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    sg.addColorStop(0, '#e4e9ec');
    sg.addColorStop(1, '#a8b1b8');
    OP.fs(ctx, sg, OP.OUT, 4);
    OP.rr(ctx, r.x + 8, r.y + 8, r.w - 16, r.h - 16, 7);
    OP.fs(ctx, '#7c858c', OP.OUT, 2.5);
    if (tr.amount > 0) {
      const F = OP.FILLINGS[id];
      const frac = tr.amount / tr.max;
      const ih = (r.h - 20) * (0.25 + 0.75 * frac);
      ctx.save();
      OP.rr(ctx, r.x + 10, r.y + 10, r.w - 20, r.h - 20, 6);
      ctx.clip();
      ctx.beginPath();
      const top = r.y + r.h - 10 - ih;
      ctx.moveTo(r.x + 8, r.y + r.h);
      ctx.lineTo(r.x + 8, top + 4);
      for (let x = r.x + 8; x <= r.x + r.w - 8; x += 10) ctx.quadraticCurveTo(x + 5, top - 4 + Math.sin(t * 2 + x) * 1.2, x + 10, top + 3);
      ctx.lineTo(r.x + r.w, r.y + r.h);
      ctx.closePath();
      const fg = ctx.createLinearGradient(0, top, 0, r.y + r.h);
      fg.addColorStop(0, F.light);
      fg.addColorStop(0.3, F.color);
      fg.addColorStop(1, OP.shade(F.color, -0.25));
      OP.fs(ctx, fg, OP.OUT, 2.5);
      for (let k = 0; k < 3; k++) {
        OP.ell(ctx, r.x + 24 + k * 22, top + 10 + (k % 2) * 8, 7, 3, -0.3);
        ctx.fillStyle = 'rgba(255,255,255,.45)';
        ctx.fill();
      }
      ctx.restore();
    }
    OP.rr(ctx, r.x + r.w / 2 - 34, r.y + r.h - 10, 68, 20, 10);
    OP.fs(ctx, 'rgba(59,35,20,.9)', null);
    OP.text(ctx, OP.FILLINGS[id].name, r.x + r.w / 2, r.y + r.h, { size: 15, color: '#fff' });
  }
  if (tr.dirty) {
    ctx.save();
    ctx.strokeStyle = 'rgba(95,160,60,.85)';
    ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let i = 0; i < 7; i++) ctx[i ? 'lineTo' : 'moveTo'](r.x + 24 + k * 22 + Math.sin(t * 5 + i + k) * 4, r.y + 30 - i * 6);
      ctx.stroke();
    }
    ctx.restore();
  }
  OP.drawRefillButton(ctx, shop, id, t);
};

OP.drawJuiceCrate = (ctx, shop, t, reserved = 0) => {
  const r = OP.L.juice;
  const tr = shop.trays.juice;
  OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h, 66, 12, 0.3);
  OP.rr(ctx, r.x, r.y + 30, r.w, r.h - 30, 8);
  OP.fs(ctx, '#9a6538', OP.OUT, 4);
  const n = Math.max(0, tr.amount - reserved);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    OP.drawJuiceBox(ctx, r.x + 22 + col * 33, r.y + 62 - row * 22, 0.72);
  }
  OP.rr(ctx, r.x, r.y + 68, r.w, r.h - 68, 8);
  const cg = ctx.createLinearGradient(0, r.y + 68, 0, r.y + r.h);
  cg.addColorStop(0, '#d49a60');
  cg.addColorStop(1, '#a86a32');
  OP.fs(ctx, cg, OP.OUT, 4);
  ctx.fillStyle = 'rgba(90,50,20,.4)';
  ctx.fillRect(r.x + 8, r.y + 88, r.w - 16, 3);
  OP.iconText(ctx, 'orange', 'מיץ', r.x + r.w / 2, r.y + 100, { size: 17, color: '#fff', stroke: '#5a2e12', lw: 4, iconSize: 20 });
  OP.drawRefillButton(ctx, shop, 'juice', t);
};

OP.drawCoffeeMachine = (ctx, shop, t, draggingCup = -1) => {
  const r = OP.L.coffee;
  OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h - 4, 90, 14, 0.35);
  if (!shop.unlocked('coffee')) {
    ctx.beginPath();
    ctx.moveTo(r.x + 16, r.y + r.h);
    ctx.quadraticCurveTo(r.x + 10, r.y + 40, r.x + 70, r.y + 30);
    ctx.quadraticCurveTo(r.x + 160, r.y + 20, r.x + r.w - 10, r.y + r.h);
    ctx.closePath();
    const g = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
    g.addColorStop(0, '#e6d8c2');
    g.addColorStop(1, '#bfae93');
    OP.fs(ctx, g, OP.OUT, 4);
    ctx.strokeStyle = 'rgba(120,90,60,.4)';
    ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(r.x + 50 + k * 34, r.y + 60);
      ctx.quadraticCurveTo(r.x + 40 + k * 34, r.y + 130, r.x + 50 + k * 34, r.y + r.h - 8);
      ctx.stroke();
    }
    OP.icon(ctx, 'lock', r.x + r.w / 2, r.y + 120, 44);
    return;
  }
  OP.rr(ctx, r.x + 8, r.y + 14, r.w - 16, 152, 20);
  const g = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
  g.addColorStop(0, '#ea6a55');
  g.addColorStop(0.4, '#d04b38');
  g.addColorStop(1, '#a8382a');
  OP.fs(ctx, g, OP.OUT, 4);
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ctx.fillRect(r.x + 26, r.y + 20, 10, 140);
  OP.rr(ctx, r.x + 20, r.y + 2, r.w - 40, 24, 10);
  const cg = ctx.createLinearGradient(0, r.y + 2, 0, r.y + 26);
  cg.addColorStop(0, '#f6f8fa');
  cg.addColorStop(1, '#b3bdc4');
  OP.fs(ctx, cg, OP.OUT, 3);
  OP.ell(ctx, r.x + 46, r.y + 64, 22, 22);
  OP.fs(ctx, '#fdf8ef', OP.OUT, 3);
  ctx.save();
  ctx.translate(r.x + 46, r.y + 64);
  ctx.rotate(-0.8 + Math.sin(t * 2) * 0.2);
  ctx.fillStyle = '#d63a2f';
  ctx.fillRect(-1.5, -16, 3, 16);
  ctx.restore();
  OP.text(ctx, 'CAFÉ', r.x + 122, r.y + 62, { size: 22, color: '#fff3e0', stroke: '#7a2418', lw: 5, dir: 'ltr' });
  OP.rr(ctx, r.x + 30, r.y + 104, r.w - 60, 24, 8);
  OP.fs(ctx, '#3a3f45', OP.OUT, 3);
  for (const x of OP.L.cupX) {
    OP.rr(ctx, x - 8, r.y + 126, 16, 16, 4);
    OP.fs(ctx, '#9aa3aa', OP.OUT, 2.5);
  }
  OP.rr(ctx, r.x + 12, r.y + 172, r.w - 24, 20, 6);
  const tg = ctx.createLinearGradient(0, r.y + 172, 0, r.y + 192);
  tg.addColorStop(0, '#e6ebee');
  tg.addColorStop(1, '#a6b0b7');
  OP.fs(ctx, tg, OP.OUT, 3);
  shop.coffee.cups.forEach((cup, i) => {
    if (i === draggingCup || shop.inFlight('cup' + i)) return;
    const x = OP.L.cupX[i];
    if (!cup.ready) {
      const wob = Math.sin(t * 30) * 1;
      ctx.fillStyle = '#5a2e12';
      ctx.fillRect(x - 2 + wob, r.y + 142, 4, OP.L.cupY - r.y - 150);
    }
    OP.drawCup(ctx, x, OP.L.cupY - 6, 0.78, cup.ready ? 1 : cup.t / shop.cupTime, cup.ready, t);
  });
  if (shop.coffee.cups.some((c) => !c.ready)) {
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.9 + k / 3) % 1;
      OP.ell(ctx, r.x + 140 + Math.sin(t * 3 + k) * 6, r.y + 6 - ph * 50, 8 + ph * 12, 7 + ph * 10);
      ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`;
      ctx.fill();
    }
  }
  if (shop.coffee.fault) OP.wrenchBadge(ctx, OP.L.coffeeWrench.x, OP.L.coffeeWrench.y, t, shop.fix.coffee / shop.fixTime);
};

OP.drawBoards = (ctx, shop, t, hideBoard = -1, hover = -1) => {
  OP.L.boards.forEach((r, i) => {
    const sel = shop.selectedBoard === i && shop.boards[i] && !shop.boards[i].wrapped;
    OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h + 4, r.w * 0.55, 12, 0.3);
    if (sel || hover === i) {
      OP.rr(ctx, r.x - 7, r.y - 7, r.w + 14, r.h + 14, 18);
      ctx.fillStyle = hover === i ? `rgba(120,230,120,${0.45 + Math.sin(t * 10) * 0.12})` : 'rgba(255,225,90,.35)';
      ctx.fill();
    }
    OP.rr(ctx, r.x, r.y + 6, r.w, r.h, 14);
    ctx.fillStyle = '#6b3d1c';
    ctx.fill();
    OP.rr(ctx, r.x, r.y, r.w, r.h, 14);
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, '#e6b27a');
    g.addColorStop(1, '#c78d55');
    OP.fs(ctx, g, OP.OUT, 4);
    OP.rr(ctx, r.x + r.w - 20, r.y + r.h / 2 - 10, 12, 20, 6);
    OP.fs(ctx, '#7a4a22', OP.OUT, 2);
    ctx.fillStyle = 'rgba(140,85,40,.3)';
    for (let k = 0; k < 4; k++) ctx.fillRect(r.x + 14, r.y + 16 + k * 16, r.w - 44, 2);
    const c = shop.boards[i];
    if (!c || i === hideBoard || shop.inFlight('board' + i)) return;
    const p = shop.boardCenter(i);
    ctx.save();
    const age = c.born != null ? shop.t - c.born : 9;
    const wage = c.wrappedT != null ? shop.t - c.wrappedT : 9;
    let sx = 1;
    let sy = 1;
    if (age >= 0 && age < 0.35) {
      const k = Math.sin((age / 0.35) * Math.PI) * (1 - age / 0.35);
      sx = 1 + k * 0.28;
      sy = 1 - k * 0.22;
    }
    if (wage >= 0 && wage < 0.4) {
      const k = Math.sin((wage / 0.4) * Math.PI * 2) * (1 - wage / 0.4);
      sx *= 1 - k * 0.12;
      sy *= 1 + k * 0.16;
    }
    ctx.translate(p.x, p.y + 24);
    ctx.scale(sx, sy);
    ctx.translate(-p.x, -(p.y + 24));
    OP.drawBuilt(ctx, p.x, p.y, 0.95, c, t);
    ctx.restore();
    const sage = c.slicedT != null ? shop.t - c.slicedT : 9;
    if (sage >= 0 && sage < 0.3) {
      const k = sage / 0.3;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.beginPath();
      ctx.moveTo(p.x - 80, p.y + 2);
      ctx.quadraticCurveTo(p.x, p.y - 10, p.x + 80 * (0.4 + k), p.y + 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8 * (1 - k) + 2;
      ctx.stroke();
      ctx.restore();
    }
    if (c.bagged && !c.wrapped) {
      OP.progressRing(ctx, p.x, p.y, 58, c.wrap, '#ee7b95', 7);
      if (c.wrap < 0.05) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(t * 3);
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, 58, 0, Math.PI * 1.6);
        ctx.strokeStyle = 'rgba(255,255,255,.95)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(58, 0);
        ctx.lineTo(50, -10);
        ctx.lineTo(66, -10);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
      }
    }
    if (c.bagged) OP.drawContentsTag(ctx, r.x + 12, r.y - 8, c);
  });
};

OP.drawContentsTag = (ctx, x, y, c) => {
  const icons = [];
  if (c.filling && c.spread >= 1) icons.push(['f', c.filling]);
  for (const tp of c.toppings) icons.push(['t', tp]);
  const w = Math.max(40, icons.length * 24 + 12);
  OP.rr(ctx, x, y - 13, w, 26, 13);
  OP.fs(ctx, '#fffaf0', OP.OUT, 2.5);
  if (!icons.length) OP.text(ctx, 'רגיל', x + w / 2, y, { size: 14, color: OP.OUT });
  icons.forEach(([k, id], i) => {
    const ix = x + 18 + i * 24;
    if (k === 'f') OP.drawFillingBlob(ctx, ix, y, 8, id);
    else OP.drawToppingIcon(ctx, ix, y + 1, 0.62, id);
  });
};

OP.drawBagStack = (ctx, t) => {
  const r = OP.L.bags;
  OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h, 54, 10, 0.3);
  for (let k = 0; k < 4; k++) OP.drawBagFlat(ctx, r.x + r.w / 2 + (k % 2) * 3, r.y + r.h - 20 - k * 8, 1.1, k % 2 ? 0.05 : -0.04);
  OP.rr(ctx, r.x + r.w / 2 - 32, r.y + r.h - 8, 64, 20, 10);
  OP.fs(ctx, 'rgba(59,35,20,.85)', null);
  OP.text(ctx, 'שקיות', r.x + r.w / 2, r.y + r.h + 2, { size: 14, color: '#fff' });
};

OP.drawTrash = (ctx, open, t) => {
  const r = OP.L.trash;
  OP.softShadow(ctx, r.x + r.w / 2, r.y + r.h, 50, 10, 0.35);
  OP.rr(ctx, r.x + 8, r.y + 22, r.w - 16, r.h - 22, 8);
  const g = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
  g.addColorStop(0, '#8e989f');
  g.addColorStop(0.4, '#d3dade');
  g.addColorStop(1, '#8a949b');
  OP.fs(ctx, g, OP.OUT, 4);
  ctx.strokeStyle = 'rgba(60,70,80,.35)';
  ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(r.x + 26 + k * 20, r.y + 36);
    ctx.lineTo(r.x + 26 + k * 20, r.y + r.h - 12);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(r.x + 6, r.y + 22);
  ctx.rotate(open ? -0.6 - Math.sin((t || 0) * 16) * 0.05 : 0);
  OP.rr(ctx, 0, -12, r.w - 12, 14, 6);
  OP.fs(ctx, '#c9d0d5', OP.OUT, 3.5);
  OP.rr(ctx, (r.w - 12) / 2 - 12, -20, 24, 9, 4);
  OP.fs(ctx, '#8a9298', OP.OUT, 2.5);
  ctx.restore();
  OP.icon(ctx, 'trash', r.x + r.w / 2, r.y + 68, 30);
};

OP.drawCrumbs = (ctx, shop) => {
  for (const c of shop.crumbs) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.beginPath();
    ctx.moveTo(-c.r, 0);
    ctx.lineTo(0, -c.r * 0.8);
    ctx.lineTo(c.r, 0.2);
    ctx.lineTo(0.2, c.r * 0.7);
    ctx.closePath();
    OP.fs(ctx, c.shade > 0.5 ? '#e8a54c' : '#c9782c', '#6b3a14', 1.5);
    ctx.restore();
  }
};

OP.drawLedgeCoins = (ctx, shop, t) => {
  for (const cn of shop.coins) {
    const pop = OP.easeOutBack(Math.min(1, cn.t * 4));
    OP.softShadow(ctx, cn.x + 4, cn.y + 4, 26, 6, 0.3);
    ctx.save();
    ctx.translate(cn.x, cn.y - 2 - Math.abs(Math.sin(t * 4 + cn.x)) * 2);
    ctx.scale(pop, pop);
    OP.drawCoinStack(ctx, 0, 0, cn.amount + cn.tip, t);
    ctx.restore();
    OP.text(ctx, '+' + (cn.amount + cn.tip), cn.x, cn.y - 46, { size: 20, color: '#ffd23a', stroke: OP.OUT, lw: 5, dir: 'ltr' });
  }
};

// Items in the air: croissants to the basket, coins to the counter, orders to customers.
OP.drawFlights = (ctx, shop, t, onlyCoins) => {
  for (const f of shop.flights) {
    if (f.t < 0 || (f.kind === 'coin') !== !!onlyCoins) continue;
    const p = OP.clamp(f.t / f.dur, 0, 1);
    const e = f.kind === 'coin' ? p * p * (3 - 2 * p) : OP.easeOutCubic(p);
    const x = OP.lerp(f.x0, f.x1, e);
    const y = OP.lerp(f.y0, f.y1, e) - f.arc * 4 * p * (1 - p);
    const s = OP.lerp(f.s0, f.s1, p);
    switch (f.kind) {
      case 'croissant':
        OP.drawCroissant(ctx, x, y, s, { state: 'baked', rot: (1 - p) * 0.8, noShadow: true });
        break;
      case 'raw':
        OP.drawCroissant(ctx, x, y, s, { state: 'raw', bake: 0, rot: p * 6.28, noShadow: true });
        break;
      case 'burnt':
        OP.drawCroissant(ctx, x, y, s, { state: 'burnt', rot: p * 9, noShadow: true });
        break;
      case 'coin':
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(Math.abs(Math.cos(t * 12 + f.x0)) * 0.7 + 0.3, 1);
        OP.coinIcon(ctx, 0, 0, 13 * s);
        ctx.restore();
        break;
      case 'wrapped':
        if (f.data) OP.drawBuilt(ctx, x, y, 0.9 * s, f.data, t);
        break;
      case 'juice':
        OP.drawJuiceBox(ctx, x, y, 1.2 * s);
        break;
      case 'coffee':
        OP.drawCup(ctx, x, y, 1.1 * s, 1, true, t);
        break;
      case 'bag':
        OP.drawBagFlat(ctx, x, y, 1.2 * s, p * 3);
        break;
      case 'topping':
        OP.drawToppingIcon(ctx, x, y, 1.5 * s, f.data);
        break;
    }
  }
};

OP.drawStamps = (ctx, shop) => {
  for (const st of shop.stamps) {
    const inP = Math.min(1, st.t / 0.18);
    const s = 2.2 - 1.2 * OP.easeOutCubic(inP);
    const a = st.t > 1.1 ? Math.max(0, 1 - (st.t - 1.1) / 0.4) : Math.min(1, inP * 2);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(st.x, st.y - Math.max(0, st.t - 1.1) * 30);
    ctx.rotate(-0.14);
    ctx.scale(s, s);
    const tw = OP.textWidth(ctx, st.text, 26) + (st.icon ? 34 : 0) + 28;
    OP.rr(ctx, -tw / 2, -21, tw, 42, 12);
    OP.fs(ctx, 'rgba(255,253,246,.96)', st.color, 5);
    OP.rr(ctx, -tw / 2 + 5, -16, tw - 10, 32, 8);
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    OP.iconText(ctx, st.icon, st.text, 0, 1, { size: 26, color: st.color, iconSize: 28 });
    ctx.restore();
  }
};
