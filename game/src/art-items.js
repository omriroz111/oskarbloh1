// הפיטסרי של אוסקר — croissants, wrapping, drinks, tools, flies, coins
var OP = globalThis.OP || (globalThis.OP = {});

OP.mix = (a, b, t) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (n, sh) => (n >> sh) & 255;
  const m = (sh) => Math.round(ch(pa, sh) + (ch(pb, sh) - ch(pa, sh)) * t);
  return `rgb(${m(16)},${m(8)},${m(0)})`;
};

const LOBES = [
  { x: -52, y: 13, rx: 15, ry: 10, rot: -0.95 },
  { x: 52, y: 13, rx: 15, ry: 10, rot: 0.95 },
  { x: -33, y: 2, rx: 21, ry: 17, rot: -0.5 },
  { x: 33, y: 2, rx: 21, ry: 17, rot: 0.5 },
  { x: 0, y: -4, rx: 28, ry: 24, rot: 0 },
];
const SUGAR_DOTS = [[-8, -20], [6, -24], [16, -14], [-18, -10], [0, -12], [-34, -8], [30, -9], [-44, 4], [42, 3], [10, -2], [-26, -16], [24, -20]];
const ALMONDS = [[-10, -18, 0.4], [12, -20, -0.5], [-30, -6, 1.1], [30, -8, -1], [2, -6, 0.1]];

function croissantColors(o) {
  if (o.state === 'burnt') return { base: '#5b3822', dark: '#2a170b', hi: '#80563a', line: '#1e1008' };
  if (o.state === 'raw') {
    const b = OP.clamp(o.bake || 0, 0, 1);
    return {
      base: OP.mix('#f6e4c0', '#efad49', b),
      dark: OP.mix('#dcbf8e', '#bd6a22', b),
      hi: OP.mix('#fff6e2', '#ffdc90', b),
      line: OP.mix('#c9a877', '#96501a', b),
    };
  }
  return { base: '#efad49', dark: '#bd6a22', hi: '#ffdc90', line: '#96501a' };
}

function drawLobes(ctx, col, lw) {
  for (const L of LOBES) {
    ctx.save();
    ctx.translate(L.x, L.y);
    ctx.rotate(L.rot);
    OP.ell(ctx, 0, 0, L.rx, L.ry);
    ctx.fillStyle = col.base;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.5;
    OP.ell(ctx, 0, L.ry * 0.62, L.rx * 1.15, L.ry * 0.6);
    ctx.fillStyle = col.dark;
    ctx.fill();
    ctx.globalAlpha = 0.85;
    OP.ell(ctx, -L.rx * 0.2, -L.ry * 0.48, L.rx * 0.55, L.ry * 0.26);
    ctx.fillStyle = col.hi;
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = col.line;
    ctx.lineWidth = lw * 0.7;
    for (const k of L.rx > 20 ? [-0.5, 0, 0.5] : [-0.25, 0.35]) {
      ctx.beginPath();
      ctx.moveTo(L.rx * k, -L.ry * 0.95);
      ctx.quadraticCurveTo(L.rx * k + L.rx * 0.28, 0, L.rx * k, L.ry * 0.95);
      ctx.stroke();
    }
    ctx.restore();
    OP.ell(ctx, 0, 0, L.rx, L.ry);
    ctx.strokeStyle = OP.OUT;
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.restore();
  }
}

function bandPath(ctx, top, bottom, half) {
  ctx.beginPath();
  ctx.moveTo(-half, top + 2);
  ctx.quadraticCurveTo(0, top - 4, half, top + 2);
  ctx.lineTo(half, bottom - 2);
  ctx.quadraticCurveTo(0, bottom + 5, -half, bottom - 2);
  ctx.closePath();
}

// o: { state:'raw'|'baked'|'burnt', bake, sliced, filling, spread, toppings, rot }
OP.drawCroissant = (ctx, x, y, s, o = {}) => {
  const col = croissantColors(o);
  const lw = Math.max(3, 2 / s);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (o.rot) ctx.rotate(o.rot);
  if (!o.noShadow) {
    OP.ell(ctx, 0, 26, 62, 9);
    ctx.fillStyle = 'rgba(40,20,10,.18)';
    ctx.fill();
  }
  if (o.sliced) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-90, 4, 180, 60);
    ctx.clip();
    ctx.translate(0, 5);
    drawLobes(ctx, col, lw);
    ctx.restore();
    bandPath(ctx, -2, 12, 60);
    OP.fs(ctx, '#fbe7c0', OP.OUT, lw * 0.8);
    if (o.filling && o.spread > 0) {
      const F = OP.FILLINGS[o.filling];
      const sp = OP.clamp(o.spread, 0, 1);
      ctx.save();
      ctx.beginPath();
      ctx.rect(-64 * sp, -20, 128 * sp, 50);
      ctx.clip();
      bandPath(ctx, -3, 14, 58);
      OP.fs(ctx, F.color, OP.OUT, lw * 0.8);
      for (const [dx, r] of [[-30, 5], [-8, 7], [18, 6], [40, 4]]) {
        OP.ell(ctx, dx, 15, r, r * 1.1);
        OP.fs(ctx, F.color, OP.OUT, lw * 0.6);
      }
      OP.ell(ctx, -14, 2, 18, 2.5);
      ctx.fillStyle = F.light;
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(-90, -70, 180, 74);
    ctx.clip();
    ctx.translate(0, -7);
    drawLobes(ctx, col, lw);
    ctx.restore();
  } else {
    drawLobes(ctx, col, lw);
  }
  const tops = o.toppings || [];
  const dy = o.sliced ? -7 : 0;
  if (tops.includes('almond')) {
    for (const [ax, ay, ar] of ALMONDS) {
      OP.ell(ctx, ax, ay + dy, 7, 4, ar);
      OP.fs(ctx, '#f3d8ab', '#9c6431', lw * 0.6);
    }
  }
  if (tops.includes('sugar')) {
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    OP.ell(ctx, 0, -16 + dy, 46, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    for (const [sx, sy] of SUGAR_DOTS) {
      OP.ell(ctx, sx, sy + dy, 2.6, 2.6);
      ctx.fill();
    }
  }
  if (o.state === 'burnt') {
    ctx.fillStyle = 'rgba(20,10,5,.35)';
    for (const [sx, sy] of SUGAR_DOTS) {
      OP.ell(ctx, sx * 1.2, sy + 10, 3.5, 3);
      ctx.fill();
    }
  }
  ctx.restore();
};

// Paper parcel shaped around the whole croissant (it spans about ±67 wide).
function parcelBody(ctx) {
  ctx.beginPath();
  ctx.moveTo(-60, 22);
  ctx.quadraticCurveTo(-76, 8, -63, -8);
  ctx.quadraticCurveTo(-46, -42, 0, -44);
  ctx.quadraticCurveTo(46, -42, 63, -8);
  ctx.quadraticCurveTo(76, 8, 60, 22);
  ctx.quadraticCurveTo(0, 36, -60, 22);
  ctx.closePath();
}

function drawParcel(ctx) {
  // twisted paper ends
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(k * 62, -8);
    ctx.lineTo(k * 84, -22);
    ctx.quadraticCurveTo(k * 77, 2, k * 86, 22);
    ctx.lineTo(k * 60, 12);
    ctx.closePath();
    OP.fs(ctx, '#c99a60', OP.OUT, 3);
    ctx.beginPath();
    ctx.moveTo(k * 66, -5);
    ctx.lineTo(k * 79, -14);
    ctx.moveTo(k * 66, 8);
    ctx.lineTo(k * 81, 16);
    ctx.strokeStyle = 'rgba(90,50,20,.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  parcelBody(ctx);
  const g = ctx.createLinearGradient(0, -44, 0, 34);
  g.addColorStop(0, '#efcd99');
  g.addColorStop(1, '#c99a60');
  OP.fs(ctx, g, OP.OUT, 3.5);
  ctx.beginPath();
  ctx.moveTo(-40, -32);
  ctx.quadraticCurveTo(-30, 0, -44, 26);
  ctx.moveTo(36, -35);
  ctx.quadraticCurveTo(26, -4, 40, 27);
  ctx.strokeStyle = 'rgba(120,70,30,.28)';
  ctx.lineWidth = 2;
  ctx.stroke();
  OP.ell(ctx, -16, -30, 26, 6, -0.1);
  ctx.fillStyle = 'rgba(255,246,222,.5)';
  ctx.fill();
}

// Paper wrap around the croissant. p: 0..1 wrap progress; flaps close in from both ends.
OP.drawSleeve = (ctx, x, y, s, p, wobble = 0) => {
  if (p <= 0) return;
  p = OP.clamp(p, 0, 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(wobble);
  if (p >= 1) {
    drawParcel(ctx);
    ctx.save();
    parcelBody(ctx);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.fillRect(-9, -50, 18, 90);
    ctx.restore();
    OP.ell(ctx, 0, 2, 14, 14);
    OP.fs(ctx, '#ee7b95', OP.OUT, 2.5);
    OP.text(ctx, 'O', 0, 3, { size: 17, color: '#fff', dir: 'ltr' });
  } else {
    const reach = 90 * p;
    for (const k of [-1, 1]) {
      const edge = k * (90 - reach);
      ctx.save();
      ctx.beginPath();
      if (k < 0) ctx.rect(-92, -60, 2 + reach, 110);
      else ctx.rect(edge, -60, reach + 2, 110);
      ctx.clip();
      drawParcel(ctx);
      ctx.save();
      parcelBody(ctx);
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(edge, -46);
      ctx.quadraticCurveTo(edge - k * 7, -4, edge, 36);
      ctx.strokeStyle = OP.OUT;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }
  }
  ctx.restore();
};

// A croissant on a board or being dragged, with its wrap state.
OP.drawBuilt = (ctx, x, y, s, c, t) => {
  const fell = c.fellT != null && t - c.fellT < 0.5 ? Math.sin((t - c.fellT) * 50) * 0.08 : 0;
  if (c.bagged && !c.wrapped) {
    ctx.save();
    ctx.translate(x, y + 18 * s);
    ctx.rotate(-0.04);
    OP.rr(ctx, -84 * s, -16 * s, 168 * s, 34 * s, 4);
    OP.fs(ctx, '#e2bf8a', OP.OUT, 2.5);
    ctx.restore();
  }
  // once wrapped the parcel hides the croissant completely
  if (!c.wrapped) OP.drawCroissant(ctx, x, y, s, { state: 'baked', sliced: c.sliced, filling: c.filling, spread: c.spread, toppings: c.toppings, rot: fell });
  if (c.bagged) OP.drawSleeve(ctx, x, y, s, c.wrapped ? 1 : c.wrap, fell);
  if (c.flyDirty) {
    ctx.save();
    ctx.strokeStyle = 'rgba(95,160,60,.8)';
    ctx.lineWidth = 3;
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const py = y - 30 * s - i * 5;
        const px = x + k * 22 * s + Math.sin(t * 5 + i + k) * 4;
        ctx[i ? 'lineTo' : 'moveTo'](px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
};

OP.drawCandy = (ctx, x, y, s, kind, color, rot) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(rot);
  if (kind === 'lolly') {
    OP.rr(ctx, -2, 6, 4, 22, 2);
    OP.fs(ctx, '#fffdf6', OP.OUT, 2);
    OP.ell(ctx, 0, 0, 11, 11);
    OP.fs(ctx, color, OP.OUT, 2.5);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.3) {
      const r = 1 + a * 0.7;
      ctx[a ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (kind === 'wrap') {
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(k * 9, 0);
      ctx.lineTo(k * 19, -8);
      ctx.lineTo(k * 19, 8);
      ctx.closePath();
      OP.fs(ctx, OP.shade(color, 0.25), OP.OUT, 2);
    }
    OP.ell(ctx, 0, 0, 11, 8);
    OP.fs(ctx, color, OP.OUT, 2.5);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fillRect(-3, -7, 3, 14);
  } else {
    OP.ell(ctx, 0, 0, 8, 8);
    OP.fs(ctx, color, OP.OUT, 2.5);
    OP.ell(ctx, -2.5, -3, 3, 2);
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.fill();
  }
  ctx.restore();
};

// Candy in the air and scattered over the counter; it never blocks a tap.
OP.drawCandies = (ctx, shop, t) => {
  for (const d of shop.candies || []) {
    const k = Math.min(1, d.t / d.dur);
    let x = OP.lerp(d.x0, d.x1, k);
    let y = OP.lerp(d.y0, d.y1, k) - Math.sin(k * Math.PI) * 130;
    let rot = d.rot + d.spin * Math.min(d.t, d.dur);
    if (k >= 1) {
      const after = d.t - d.dur;
      y -= after < 0.25 ? Math.sin((after / 0.25) * Math.PI) * 10 : 0;
    }
    const a = OP.clamp((d.life - d.t) / 0.6, 0, 1);
    if (a <= 0) continue;
    ctx.save();
    ctx.globalAlpha = a;
    if (k >= 1) {
      OP.ell(ctx, x + 2, y + 9, 10, 3.5);
      ctx.fillStyle = 'rgba(40,20,10,.22)';
      ctx.fill();
    }
    OP.drawCandy(ctx, x, y, 1.45, d.kind, d.color, rot);
    ctx.restore();
  }
};

OP.drawFillingBlob = (ctx, x, y, r, fid) => {
  const F = OP.FILLINGS[fid];
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const rr = r * (i % 2 ? 0.86 : 1);
    ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  OP.fs(ctx, F.color, OP.OUT, 2);
  OP.ell(ctx, x - r * 0.3, y - r * 0.35, r * 0.3, r * 0.18, -0.5);
  ctx.fillStyle = F.light;
  ctx.fill();
};

OP.drawToppingIcon = (ctx, x, y, s, tid) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (tid === 'sugar') {
    ctx.beginPath();
    ctx.moveTo(-14, 8);
    ctx.quadraticCurveTo(-8, -12, 0, -12);
    ctx.quadraticCurveTo(8, -12, 14, 8);
    ctx.closePath();
    OP.fs(ctx, '#ffffff', OP.OUT, 2.5);
    OP.starPath(ctx, 8, -12, 5, 2, 4);
    ctx.fillStyle = '#9fd8ff';
    ctx.fill();
  } else {
    for (const [ax, ay, ar] of [[-6, 2, 0.6], [6, 0, -0.5], [0, -8, 0.1]]) {
      OP.ell(ctx, ax, ay, 8, 5, ar);
      OP.fs(ctx, '#f3d8ab', '#7a4a22', 2);
    }
  }
  ctx.restore();
};

OP.drawJuiceBox = (ctx, x, y, s) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(8, -26);
  ctx.lineTo(12, -42);
  ctx.strokeStyle = '#ff5c8a';
  ctx.lineWidth = 4;
  ctx.stroke();
  OP.rr(ctx, -15, -24, 30, 46, 4);
  OP.fs(ctx, '#ff9a24', OP.OUT, 3);
  ctx.beginPath();
  ctx.moveTo(-15, -20);
  ctx.lineTo(0, -30);
  ctx.lineTo(15, -20);
  ctx.closePath();
  OP.fs(ctx, '#ffc15a', OP.OUT, 3);
  OP.rr(ctx, -11, -10, 22, 22, 4);
  OP.fs(ctx, '#fff7e8', null);
  OP.ell(ctx, 0, 1, 8, 8);
  OP.fs(ctx, '#ff8a1f', '#c75a00', 2);
  ctx.strokeStyle = '#ffd28a';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < 6; a++) {
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(Math.cos((a * Math.PI) / 3) * 7, 1 + Math.sin((a * Math.PI) / 3) * 7);
    ctx.stroke();
  }
  ctx.restore();
};

// fill: 0..1, ready adds foam art + steam
OP.drawCup = (ctx, x, y, s, fill, ready, t) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (ready) {
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.lineWidth = 3;
    for (let k = -1; k <= 1; k += 2) {
      ctx.beginPath();
      for (let i = 0; i < 7; i++) ctx[i ? 'lineTo' : 'moveTo'](k * 6 + Math.sin(t * 4 + i * 0.9 + k) * 4, -24 - i * 5);
      ctx.stroke();
    }
  }
  ctx.beginPath();
  ctx.arc(17, -2, 8, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = OP.OUT;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-17, -16);
  ctx.lineTo(17, -16);
  ctx.lineTo(12, 16);
  ctx.quadraticCurveTo(0, 20, -12, 16);
  ctx.closePath();
  OP.fs(ctx, '#ffffff', OP.OUT, 3);
  ctx.fillStyle = '#ee7b95';
  ctx.fillRect(-15, -4, 29, 6);
  OP.ell(ctx, 0, -16, 17, 5);
  OP.fs(ctx, fill > 0 ? OP.mix('#e9dccb', '#c98a52', OP.clamp(fill, 0, 1)) : '#e9e2da', OP.OUT, 2.5);
  if (ready) {
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.bezierCurveTo(-7, -19, -4, -23, 0, -19);
    ctx.bezierCurveTo(4, -23, 7, -19, 0, -14);
    ctx.fillStyle = '#fff3e2';
    ctx.fill();
  }
  ctx.restore();
};

OP.drawBagFlat = (ctx, x, y, s, rot = 0) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(rot);
  OP.rr(ctx, -32, -22, 64, 44, 4);
  OP.fs(ctx, '#d9b27a', OP.OUT, 3);
  ctx.beginPath();
  ctx.moveTo(-32, -8);
  for (let i = 0; i <= 8; i++) ctx.lineTo(-32 + i * 8, -8 + (i % 2 ? -5 : 0));
  ctx.strokeStyle = 'rgba(90,50,20,.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  OP.ell(ctx, 0, 8, 9, 9);
  OP.fs(ctx, '#ee7b95', OP.OUT, 2);
  ctx.restore();
};

OP.drawSpatula = (ctx, x, y, fid, t) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.5 + Math.sin(t * 20) * 0.05);
  OP.rr(ctx, 14, -60, 12, 46, 5);
  OP.fs(ctx, '#b0723c', OP.OUT, 3);
  OP.rr(ctx, 4, -18, 32, 30, 10);
  OP.fs(ctx, '#d5dce0', OP.OUT, 3);
  if (fid) {
    OP.ell(ctx, 20, 2, 13, 8);
    OP.fs(ctx, OP.FILLINGS[fid].color, OP.OUT, 2);
  }
  ctx.restore();
};

OP.drawKnife = (ctx, x, y, t) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.7);
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(46, -4);
  ctx.quadraticCurveTo(58, 4, 46, 10);
  ctx.lineTo(-6, 10);
  ctx.closePath();
  OP.fs(ctx, '#e3e8eb', OP.OUT, 3);
  OP.rr(ctx, -40, -5, 36, 16, 5);
  OP.fs(ctx, '#7a4520', OP.OUT, 3);
  ctx.restore();
};

OP.drawSponge = (ctx, x, y) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.15);
  OP.rr(ctx, -26, -12, 52, 24, 7);
  OP.fs(ctx, '#ffd84a', OP.OUT, 3);
  OP.rr(ctx, -26, -12, 52, 9, 5);
  OP.fs(ctx, '#56b86a', OP.OUT, 3);
  ctx.restore();
};

OP.drawFly = (ctx, f, t) => {
  const landed = f.state === 'landed';
  ctx.save();
  ctx.translate(f.x, f.y);
  if (f.state === 'dead') ctx.rotate(Math.PI);
  if (!landed) {
    OP.ell(ctx, 0, 30, 10, 3);
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.fill();
  }
  const flap = landed ? 0.2 : Math.sin(t * 90) * 0.6;
  ctx.fillStyle = 'rgba(210,235,255,.75)';
  ctx.strokeStyle = 'rgba(40,40,60,.7)';
  ctx.lineWidth = 1.5;
  for (const k of [-1, 1]) {
    ctx.save();
    ctx.rotate(k * (0.6 + flap));
    OP.ell(ctx, k * 9, -8, 8, 13, k * 0.3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  OP.ell(ctx, 0, 2, 7, 10);
  OP.fs(ctx, '#2b2d33', '#111', 2);
  OP.ell(ctx, 0, -8, 6, 5);
  OP.fs(ctx, '#2b2d33', '#111', 2);
  for (const k of [-1, 1]) {
    OP.ell(ctx, k * 3.5, -9, 3, 3);
    ctx.fillStyle = '#d63a2f';
    ctx.fill();
  }
  ctx.restore();
};

OP.drawCoinStack = (ctx, x, y, amount, t) => {
  const n = OP.clamp(Math.ceil(amount / 5), 1, 6);
  for (let i = 0; i < n; i++) {
    const cx = x + ((i % 2) * 2 - 1) * 2 + (i >= 3 ? 14 : -6);
    const cy = y - (i >= 3 ? i - 3 : i) * 6;
    OP.ell(ctx, cx, cy, 13, 6);
    OP.fs(ctx, '#e8a317', OP.OUT, 2.5);
    OP.ell(ctx, cx, cy - 3, 13, 6);
    OP.fs(ctx, '#ffc93d', OP.OUT, 2.5);
  }
  const sp = (Math.sin(t * 6) + 1) / 2;
  OP.starPath(ctx, x + 10, y - 22, 5 + sp * 3, 2, 4);
  ctx.fillStyle = '#fff';
  ctx.fill();
};
