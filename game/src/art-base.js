// הפיטסרי של אוסקר — drawing helpers shared by all art
var OP = globalThis.OP || (globalThis.OP = {});

OP.OUT = '#3b2314';
OP.FONT = '"Assistant", "Segoe UI", Arial, sans-serif';

OP.rr = (ctx, x, y, w, h, r) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

OP.ell = (ctx, x, y, rx, ry, rot = 0) => {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
};

OP.fs = (ctx, fill, stroke = OP.OUT, lw = 3) => {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && lw > 0) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
};

OP.shade = (hex, amt) => {
  if (hex.startsWith('rgb')) return hex;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
  const n = parseInt(c, 16);
  let r = n >> 16;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (amt >= 0) {
    r += (255 - r) * amt;
    g += (255 - g) * amt;
    b += (255 - b) * amt;
  } else {
    r *= 1 + amt;
    g *= 1 + amt;
    b *= 1 + amt;
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
};

OP.text = (ctx, s, x, y, o = {}) => {
  const size = o.size || 24;
  ctx.font = `${o.weight || 800} ${size}px ${OP.FONT}`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.baseline || 'middle';
  ctx.direction = o.dir || 'rtl';
  ctx.lineJoin = 'round';
  if (o.stroke) {
    ctx.lineWidth = o.lw || Math.max(3, size * 0.2);
    ctx.strokeStyle = o.stroke;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = o.color || '#fff';
  ctx.fillText(s, x, y);
  ctx.direction = 'inherit';
};

OP.textWidth = (ctx, s, size, weight = 800) => {
  ctx.font = `${weight} ${size}px ${OP.FONT}`;
  return ctx.measureText(s).width;
};

// Text with an icon on its left, centred as one group at x.
OP.iconText = (ctx, icon, s, x, y, o = {}) => {
  const size = o.size || 24;
  const tw = OP.textWidth(ctx, s, size, o.weight || 800);
  const is = icon ? o.iconSize || size * 1.2 : 0;
  const gap = icon ? size * 0.3 : 0;
  const gw = tw + is + gap;
  const left = o.align === 'right' ? x - gw : o.align === 'left' ? x : x - gw / 2;
  if (icon) OP.icon(ctx, icon, left + is / 2, y, is, o.iconOpts || {});
  OP.text(ctx, s, left + is + gap + tw / 2, y, Object.assign({}, o, { align: 'center' }));
  return gw;
};

OP.wrapText = (ctx, s, maxW, size, weight = 700) => {
  ctx.font = `${weight} ${size}px ${OP.FONT}`;
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
};

OP.starPath = (ctx, x, y, r1, r2, n = 5) => {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
};

OP.softShadow = (ctx, x, y, rx, ry, a = 0.28) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(40,20,8,${a})`);
  g.addColorStop(0.6, `rgba(40,20,8,${a * 0.6})`);
  g.addColorStop(1, 'rgba(40,20,8,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Chunky glossy button. o: color, disabled, size, icon, iconSize, hover (0..1), t (for shine sweep)
OP.drawButton = (ctx, r, label, o = {}) => {
  const base = o.disabled ? '#a79c90' : o.color || '#f59a23';
  const hover = o.hover || 0;
  const press = o.pressed ? 4 : 0;
  const rad = Math.min(r.h * 0.36, 26);
  ctx.save();
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  if (hover) {
    const s = 1 + hover * 0.05;
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.translate(-cx, -cy);
  }
  OP.rr(ctx, r.x + 3, r.y + 12, r.w - 6, r.h, rad);
  ctx.fillStyle = 'rgba(20,10,4,.3)';
  ctx.fill();
  OP.rr(ctx, r.x, r.y + 6, r.w, r.h, rad);
  OP.fs(ctx, OP.shade(base, -0.38), OP.OUT, 4);
  OP.rr(ctx, r.x, r.y + press, r.w, r.h - 2, rad);
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  g.addColorStop(0, OP.shade(base, 0.3 + hover * 0.08));
  g.addColorStop(0.55, OP.shade(base, hover * 0.06));
  g.addColorStop(1, OP.shade(base, -0.12));
  OP.fs(ctx, g, OP.OUT, 4);
  ctx.save();
  OP.rr(ctx, r.x, r.y + press, r.w, r.h - 2, rad);
  ctx.clip();
  OP.rr(ctx, r.x + 10, r.y + 5 + press, r.w - 20, r.h * 0.3, r.h * 0.15);
  ctx.fillStyle = 'rgba(255,255,255,.34)';
  ctx.fill();
  if (o.t != null && !o.disabled) {
    const p = (o.t % 3.2) / 3.2;
    if (p < 0.35) {
      const sx = r.x - 70 + (p / 0.35) * (r.w + 140);
      ctx.beginPath();
      ctx.moveTo(sx, r.y - 10);
      ctx.lineTo(sx + 34, r.y - 10);
      ctx.lineTo(sx + 4, r.y + r.h + 10);
      ctx.lineTo(sx - 30, r.y + r.h + 10);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fill();
    }
  }
  ctx.restore();
  const size = o.size || Math.round(r.h * 0.46);
  const tw = label ? OP.textWidth(ctx, label, size) : 0;
  const is = o.icon ? o.iconSize || size * 1.25 : 0;
  const gap = o.icon && label ? size * 0.35 : 0;
  const gw = tw + is + gap;
  const ty = cy + press;
  if (o.icon) OP.icon(ctx, o.icon, cx - gw / 2 + is / 2, ty, is, o.iconOpts || {});
  if (label) {
    OP.text(ctx, label, cx + gw / 2 - tw / 2, ty + 1, {
      size,
      color: o.disabled ? '#f3ece4' : '#fff',
      stroke: OP.shade(base, -0.6),
      lw: o.lw || Math.max(4, size * 0.2),
    });
  }
  ctx.restore();
};

OP.drawRoundButton = (ctx, x, y, r, icon, o = {}) => {
  const s = 1 + (o.hover || 0) * 0.08;
  OP.ell(ctx, x, y + 4, r, r);
  ctx.fillStyle = 'rgba(30,15,5,.45)';
  ctx.fill();
  OP.ell(ctx, x, y, r * s, r * s);
  const g = ctx.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, '#fffdf6');
  g.addColorStop(1, '#ecd8b8');
  OP.fs(ctx, g, OP.OUT, 3.5);
  if (typeof icon === 'function') icon(ctx, x, y, r);
  else OP.icon(ctx, icon, x, y, r * 1.2 * s, o.iconOpts || {});
};

OP.ribbon = (ctx, cx, cy, w, text, icon) => {
  const h = 56;
  for (const k of [-1, 1]) {
    const ex = cx + k * (w / 2 + 30);
    ctx.beginPath();
    ctx.moveTo(cx + k * (w / 2 - 10), cy + 12);
    ctx.lineTo(ex, cy + 12);
    ctx.lineTo(ex - k * 16, cy + 12 + (h - 12) / 2);
    ctx.lineTo(ex, cy + h);
    ctx.lineTo(cx + k * (w / 2 - 10), cy + h);
    ctx.closePath();
    OP.fs(ctx, '#b8435d', OP.OUT, 4);
  }
  OP.rr(ctx, cx - w / 2, cy - 4, w, h, 12);
  const g = ctx.createLinearGradient(0, cy - 4, 0, cy + h);
  g.addColorStop(0, '#ff9fb4');
  g.addColorStop(1, '#e2658a');
  OP.fs(ctx, g, OP.OUT, 4);
  OP.rr(ctx, cx - w / 2 + 10, cy + 1, w - 20, 12, 6);
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  ctx.fill();
  OP.iconText(ctx, icon, text, cx, cy + h / 2 - 3, { size: 32, color: '#fff', stroke: '#8f2e46', lw: 7, iconSize: 40 });
};

OP.panel = (ctx, x, y, w, h, o = {}) => {
  OP.rr(ctx, x + 6, y + 12, w, h, 28);
  ctx.fillStyle = 'rgba(20,10,4,.42)';
  ctx.fill();
  OP.rr(ctx, x, y, w, h, 28);
  const wg = ctx.createLinearGradient(0, y, 0, y + h);
  wg.addColorStop(0, '#b97c47');
  wg.addColorStop(1, '#84502a');
  OP.fs(ctx, wg, OP.OUT, 5);
  ctx.save();
  OP.rr(ctx, x, y, w, h, 28);
  ctx.clip();
  const rnd = OP.mulberry32((w * 7 + h) | 0);
  ctx.fillStyle = 'rgba(60,30,10,.2)';
  for (let k = 0; k < 22; k++) ctx.fillRect(x + rnd() * w, y + rnd() * h, 40 + rnd() * 120, 3);
  ctx.restore();
  OP.rr(ctx, x + 14, y + 14, w - 28, h - 28, 20);
  const pg = ctx.createLinearGradient(0, y, 0, y + h);
  pg.addColorStop(0, '#fffaf0');
  pg.addColorStop(1, '#f5e6cc');
  OP.fs(ctx, pg, OP.OUT, 3);
  OP.rr(ctx, x + 24, y + 24, w - 48, h - 48, 14);
  ctx.strokeStyle = 'rgba(190,140,90,.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 7]);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const [nx, ny] of [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9]]) {
    OP.ell(ctx, nx, ny, 4.5, 4.5);
    OP.fs(ctx, '#eadcbc', OP.OUT, 2);
  }
  if (o.title) OP.ribbon(ctx, x + w / 2, y - 18, o.titleW || Math.min(w - 80, 380), o.title, o.icon);
};

// Volume-style slider; value 0..1 grows left to right.
OP.drawSlider = (ctx, r, v, o = {}) => {
  const cy = r.y + r.h / 2;
  OP.rr(ctx, r.x, cy - 11, r.w, 22, 11);
  OP.fs(ctx, '#5a3a24', OP.OUT, 3);
  const fw = Math.max(22, r.w * v);
  OP.rr(ctx, r.x + 2, cy - 9, fw - 4, 18, 9);
  const g = ctx.createLinearGradient(r.x, 0, r.x + r.w, 0);
  g.addColorStop(0, o.c0 || '#ffd66b');
  g.addColorStop(1, o.c1 || '#f5862a');
  ctx.fillStyle = g;
  ctx.fill();
  OP.rr(ctx, r.x + 7, cy - 6, Math.max(0, fw - 16), 5, 3);
  ctx.fillStyle = 'rgba(255,255,255,.38)';
  ctx.fill();
  const kx = r.x + r.w * v;
  OP.ell(ctx, kx, cy + 4, 20, 20);
  ctx.fillStyle = 'rgba(30,15,5,.35)';
  ctx.fill();
  OP.ell(ctx, kx, cy, 20 * (1 + (o.active ? 0.12 : 0)), 20 * (1 + (o.active ? 0.12 : 0)));
  const kg = ctx.createLinearGradient(0, cy - 20, 0, cy + 20);
  kg.addColorStop(0, '#fffdf6');
  kg.addColorStop(1, '#e6cfa8');
  OP.fs(ctx, kg, OP.OUT, 3.5);
  OP.ell(ctx, kx, cy, 7, 7);
  ctx.fillStyle = o.c1 || '#f5862a';
  ctx.fill();
};

OP.coinIcon = (ctx, x, y, r) => {
  OP.ell(ctx, x, y, r, r);
  const g = ctx.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, '#ffe27a');
  g.addColorStop(1, '#f0a818');
  OP.fs(ctx, g, OP.OUT, Math.max(2, r * 0.16));
  OP.ell(ctx, x, y, r * 0.64, r * 0.64);
  ctx.strokeStyle = '#d98f0f';
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.stroke();
  OP.starPath(ctx, x, y + r * 0.02, r * 0.34, r * 0.15);
  ctx.fillStyle = '#e39a12';
  ctx.fill();
  OP.ell(ctx, x - r * 0.32, y - r * 0.38, r * 0.22, r * 0.13, -0.6);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.fill();
};

OP.progressRing = (ctx, x, y, r, p, color = '#4cc25a', lw = 6) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(40,20,10,.38)';
  ctx.lineWidth = lw + 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * OP.clamp(p, 0, 1));
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();
};

OP.refillIcon = (ctx, x, y, r, spin = 0) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, -Math.PI * 0.15, Math.PI * 1.35);
  ctx.strokeStyle = '#2f8f4e';
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = 'round';
  ctx.stroke();
  const a = Math.PI * 1.35;
  const ex = Math.cos(a) * r * 0.5;
  const ey = Math.sin(a) * r * 0.5;
  ctx.beginPath();
  ctx.moveTo(ex - r * 0.28, ey - r * 0.02);
  ctx.lineTo(ex + r * 0.12, ey - r * 0.3);
  ctx.lineTo(ex + r * 0.16, ey + r * 0.16);
  ctx.closePath();
  ctx.fillStyle = '#2f8f4e';
  ctx.fill();
  ctx.restore();
};

OP.wrenchBadge = (ctx, x, y, t, progress) => {
  const pulse = 1 + Math.sin(t * 8) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  OP.ell(ctx, 0, 3, 25, 25);
  ctx.fillStyle = 'rgba(30,15,5,.35)';
  ctx.fill();
  OP.ell(ctx, 0, 0, 25, 25);
  OP.fs(ctx, '#ffd23a', OP.OUT, 3);
  OP.icon(ctx, 'wrench', 0, 0, 34);
  ctx.restore();
  if (progress > 0) OP.progressRing(ctx, x, y, 32, progress, '#4cc25a', 6);
};
