// הפיטסרי של אוסקר — the world outside: sky by time of day, the live view through the shop
// window, the street facade used by cutscenes, passers-by and a full-body walking Oscar.
var OP = globalThis.OP || (globalThis.OP = {});

OP.WINDOW = { x: 452, y: 92, w: 376, h: 206, archH: 64 };

// time of day: 0 dawn, .35 day, .68 sunset, 1 night
OP.nightness = (tod) => OP.clamp((tod - 0.72) / 0.22, 0, 1);
OP.duskness = (tod) => OP.clamp(1 - Math.abs(tod - 0.64) / 0.16, 0, 1);
OP.dawnness = (tod) => OP.clamp(1 - tod / 0.18, 0, 1);

OP.shopTod = (shop) => {
  if (shop.phase === 'demo') return 0.62;
  if (shop.phase === 'banner' || shop.phase === 'prep') return 0.06;
  if (shop.phase === 'closing' || shop.phase === 'done') return 0.9;
  return 0.1 + 0.74 * (1 - shop.time / shop.dayLength);
};

OP.drawGrade = (ctx, tod, weather) => {
  const dawn = OP.dawnness(tod);
  const dusk = OP.duskness(tod);
  const night = OP.nightness(tod);
  if (dawn > 0) {
    ctx.fillStyle = `rgba(255,185,170,${0.07 * dawn})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
  if (dusk > 0) {
    ctx.fillStyle = `rgba(255,130,50,${0.08 * dusk})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
  if (night > 0) {
    ctx.fillStyle = `rgba(25,30,85,${0.2 * night})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
  if (weather === 'rain') {
    ctx.fillStyle = 'rgba(55,75,110,.08)';
    ctx.fillRect(0, 0, 1280, 720);
  }
};

(function () {
  const O = () => OP.OUT;
  const SKY = [
    { k: 0, top: '#5667c4', mid: '#f29fb6', low: '#ffd4a0' },
    { k: 0.35, top: '#63b6e6', mid: '#a8ddf6', low: '#e6f6ff' },
    { k: 0.66, top: '#74539e', mid: '#ee7c8c', low: '#ffbd6c' },
    { k: 1, top: '#0b1030', mid: '#1f2556', low: '#3a3c74' },
  ];
  OP.skyAt = (tod, rain) => {
    tod = OP.clamp(tod, 0, 1);
    let i = 0;
    while (i < SKY.length - 2 && tod > SKY[i + 1].k) i++;
    const a = SKY[i];
    const b = SKY[i + 1];
    const f = (tod - a.k) / (b.k - a.k);
    const pick = (key) => {
      const m = OP.mix(a[key], b[key], f);
      if (!rain) return m;
      const hex = '#' + m.match(/\d+/g).map((n) => (+n).toString(16).padStart(2, '0')).join('');
      return OP.mix(hex, '#8a93a6', 0.55);
    };
    return { top: pick('top'), mid: pick('mid'), low: pick('low') };
  };
  const nm = (hex, night, amt = 0.78) => OP.mix(hex, '#20244a', night * amt);

  const rnd = OP.mulberry32(404);
  const CITY = [];
  for (let x = -20; x < 1400;) {
    const w = 44 + rnd() * 52;
    CITY.push({ x, w, h: 40 + rnd() * 62, pink: rnd() > 0.5, lit: Array.from({ length: 16 }, () => rnd() < 0.5) });
    x += w + 2;
  }
  const STARS = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), s: rnd(), p: rnd() * 6 }));

  function puff(ctx, x, y, s, col) {
    ctx.fillStyle = col;
    OP.ell(ctx, x, y, 40 * s, 12 * s);
    ctx.fill();
    OP.ell(ctx, x + 18 * s, y - 9 * s, 24 * s, 14 * s);
    ctx.fill();
    OP.ell(ctx, x - 16 * s, y - 5 * s, 18 * s, 10 * s);
    ctx.fill();
  }

  function eiffel(ctx, cx, base, hgt, color, night, t) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - hgt * 0.23, base);
    ctx.quadraticCurveTo(cx - hgt * 0.07, base - hgt * 0.35, cx - 3, base - hgt);
    ctx.lineTo(cx + 3, base - hgt);
    ctx.quadraticCurveTo(cx + hgt * 0.07, base - hgt * 0.35, cx + hgt * 0.23, base);
    ctx.lineTo(cx + hgt * 0.12, base);
    ctx.quadraticCurveTo(cx, base - hgt * 0.2, cx - hgt * 0.12, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - hgt * 0.14, base - hgt * 0.3, hgt * 0.28, hgt * 0.035);
    ctx.fillRect(cx - hgt * 0.075, base - hgt * 0.58, hgt * 0.15, hgt * 0.025);
    ctx.fillRect(cx - 1, base - hgt - hgt * 0.08, 2, hgt * 0.08);
    if (night > 0.3) {
      for (let i = 0; i < 24; i++) {
        const v = i / 24;
        const w = hgt * 0.2 * (1 - v) + 2;
        const px = cx + Math.sin(i * 12.9) * w;
        const py = base - v * hgt;
        const on = Math.sin(t * 9 + i * 3.1) > 0.4;
        if (!on) continue;
        OP.ell(ctx, px, py, 1.6, 1.6);
        ctx.fillStyle = `rgba(255,236,170,${night})`;
        ctx.fill();
      }
    }
  }

  function cityRow(ctx, x0, x1, base, sc, tod) {
    const night = OP.nightness(tod);
    for (const b of CITY) {
      const bx = x0 + b.x * sc;
      if (bx > x1) break;
      const bw = b.w * sc;
      const bh = b.h * sc;
      const top = base - bh;
      ctx.fillStyle = nm(b.pink ? '#dca8b9' : '#d6bda5', night, 0.85);
      ctx.fillRect(bx, top, bw, bh);
      ctx.fillStyle = nm('#8f7a9a', night, 0.85);
      ctx.beginPath();
      ctx.moveTo(bx - 3 * sc, top);
      ctx.lineTo(bx + 7 * sc, top - 15 * sc);
      ctx.lineTo(bx + bw - 7 * sc, top - 15 * sc);
      ctx.lineTo(bx + bw + 3 * sc, top);
      ctx.closePath();
      ctx.fill();
      let n = 0;
      for (let wy = top + 10 * sc; wy < base - 12 * sc; wy += 18 * sc) {
        for (let wx = bx + 8 * sc; wx < bx + bw - 10 * sc; wx += 14 * sc) {
          const lit = b.lit[n++ % 16];
          ctx.fillStyle = night > 0.3 ? (lit ? `rgba(255,214,130,${0.5 + night * 0.5})` : 'rgba(20,24,50,.8)') : 'rgba(255,240,205,.9)';
          ctx.fillRect(wx, wy, 6 * sc, 9 * sc);
        }
      }
    }
  }

  const PALS = [['#e5534b', '#2a1b12'], ['#4a90d9', '#7a4a24'], ['#58b368', '#c98a3b'], ['#9b6bd3', '#1d1d24'], ['#f2b134', '#a23b1d'], ['#3fb6b0', '#4f3321']];
  OP.drawPasserby = (ctx, x, footY, s, t, o = {}) => {
    const seed = o.seed || 0;
    const [coat, hair] = PALS[seed % PALS.length];
    const walk = t * 6 + seed;
    const night = o.night || 0;
    const sh = (c) => nm(c, night, 0.55);
    ctx.save();
    ctx.translate(x, footY);
    ctx.scale(s * (o.dir < 0 ? -1 : 1), s);
    const bob = -Math.abs(Math.sin(walk)) * 4;
    const lw = 4;
    for (const k of [-1, 1]) {
      ctx.save();
      ctx.translate(k * 8, -62 + bob);
      ctx.rotate(Math.sin(walk) * 0.45 * k);
      OP.rr(ctx, -6, 0, 12, 58, 5);
      OP.fs(ctx, sh('#3a3f4b'), O(), lw);
      OP.rr(ctx, -8, 50, 22, 10, 4);
      OP.fs(ctx, sh('#2a1a10'), O(), lw);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(-12, -118 + bob);
    ctx.rotate(Math.sin(walk) * 0.4);
    OP.rr(ctx, -6, 0, 12, 46, 6);
    OP.fs(ctx, sh(OP.shade(coat, -0.2).startsWith('rgb') ? coat : coat), O(), lw);
    ctx.restore();
    OP.rr(ctx, -24, -130 + bob, 48, 78, 16);
    OP.fs(ctx, sh(coat), O(), lw);
    ctx.save();
    ctx.translate(14, -120 + bob);
    ctx.rotate(-Math.sin(walk) * 0.4);
    OP.rr(ctx, -6, 0, 12, 46, 6);
    OP.fs(ctx, sh(coat), O(), lw);
    if (o.baguette) {
      OP.rr(ctx, -4, 26, 10, 60, 5);
      OP.fs(ctx, sh('#e0a458'), O(), 3);
    }
    ctx.restore();
    OP.ell(ctx, 0, -152 + bob, 20, 22);
    OP.fs(ctx, sh('#f2c6a0'), O(), lw);
    ctx.beginPath();
    ctx.arc(0, -157 + bob, 21, Math.PI, 0);
    ctx.closePath();
    OP.fs(ctx, sh(hair), O(), lw);
    OP.ell(ctx, 9, -150 + bob, 2.5, 3);
    ctx.fillStyle = O();
    ctx.fill();
    if (o.umbrella) {
      ctx.beginPath();
      ctx.moveTo(6, -122 + bob);
      ctx.lineTo(6, -212 + bob);
      ctx.strokeStyle = O();
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, -206 + bob, 50, Math.PI, 0);
      for (let i = 4; i >= 0; i--) ctx.quadraticCurveTo(6 - 50 + (i + 0.5) * 20, -198 + bob, 6 - 50 + i * 20, -206 + bob);
      ctx.closePath();
      OP.fs(ctx, sh(PALS[(seed + 2) % PALS.length][0]), O(), lw);
    } else if (o.hat) {
      OP.rr(ctx, -16, -186 + bob, 32, 18, 6);
      OP.fs(ctx, sh('#3a3f4b'), O(), lw);
      OP.rr(ctx, -26, -172 + bob, 52, 7, 3);
      OP.fs(ctx, sh('#3a3f4b'), O(), lw);
    }
    ctx.restore();
  };

  // Oscar with legs, for the street. footY = where his shoes touch the pavement.
  OP.drawOscarFull = (ctx, x, footY, s, t, o = {}) => {
    const walk = t * 7;
    const lift = o.walking ? Math.abs(Math.sin(walk)) * 8 * s : 0;
    const headY = footY - 530 * s - lift;
    const face = o.facing < 0 ? -1 : 1;
    OP.softShadow(ctx, x, footY + 4, 90 * s, 18 * s, 0.35);
    ctx.save();
    ctx.translate(x, 0);
    ctx.scale(face, 1);
    ctx.translate(-x, 0);
    for (const k of [-1, 1]) {
      ctx.save();
      ctx.translate(x + k * 26 * s, headY + 350 * s);
      ctx.rotate(o.walking ? Math.sin(walk) * 0.42 * k : 0);
      OP.rr(ctx, -21 * s, 0, 42 * s, 170 * s, 16 * s);
      OP.fs(ctx, '#34384a', O(), 10 * s);
      OP.rr(ctx, -24 * s, 160 * s, 62 * s, 26 * s, 12 * s);
      OP.fs(ctx, '#2a1a10', O(), 10 * s);
      ctx.restore();
    }
    OP.drawOscar(ctx, x, headY, s, t, o);
    ctx.restore();
    if (o.sack) {
      const sx = x + face * 70 * s;
      const sy = headY + 250 * s;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(face * 0.15 + (o.walking ? Math.sin(walk) * 0.05 : 0));
      ctx.beginPath();
      ctx.moveTo(-56 * s, -60 * s);
      ctx.quadraticCurveTo(0, -80 * s, 56 * s, -60 * s);
      ctx.quadraticCurveTo(72 * s, 40 * s, 50 * s, 80 * s);
      ctx.quadraticCurveTo(0, 96 * s, -50 * s, 80 * s);
      ctx.quadraticCurveTo(-72 * s, 40 * s, -56 * s, -60 * s);
      OP.fs(ctx, '#e3cfa2', O(), 10 * s);
      OP.text(ctx, 'FARINE', 0, 12 * s, { size: 30 * s, color: '#8a5a2a', dir: 'ltr' });
      ctx.restore();
    }
  };

  function facade(ctx, x, top, w, bottom, night, seed, awning) {
    const r = OP.mulberry32(seed);
    OP.rr(ctx, x, top, w, bottom - top, 4);
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, nm('#f0dfc6', night));
    g.addColorStop(1, nm('#dcc4a4', night));
    OP.fs(ctx, g, O(), 4);
    ctx.strokeStyle = 'rgba(120,90,60,.22)';
    ctx.lineWidth = 2;
    for (let y = top + 40; y < bottom; y += 40) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(x - 10, top);
    ctx.lineTo(x + 18, top - 58);
    ctx.lineTo(x + w - 18, top - 58);
    ctx.lineTo(x + w + 10, top);
    ctx.closePath();
    OP.fs(ctx, nm('#6d7f9c', night), O(), 4);
    for (let wx = x + 40; wx < x + w - 50; wx += 110) {
      OP.rr(ctx, wx, top - 48, 36, 38, 8);
      OP.fs(ctx, night > 0.3 && r() < 0.6 ? '#ffd27a' : nm('#9fc1d6', night), O(), 3);
    }
    for (let fy = top + 40; fy < bottom - 190; fy += 118) {
      for (let wx = x + 34; wx < x + w - 60; wx += 96) {
        const lit = night > 0.3 && r() < 0.5;
        OP.rr(ctx, wx - 6, fy - 6, 58, 96, 6);
        OP.fs(ctx, nm('#f7ecda', night), O(), 3);
        OP.rr(ctx, wx, fy, 46, 84, 4);
        OP.fs(ctx, lit ? '#ffcf73' : nm('#86aec8', night), O(), 3);
        ctx.fillStyle = 'rgba(255,255,255,.25)';
        ctx.fillRect(wx + 6, fy + 6, 8, 60);
        ctx.strokeStyle = O();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(wx - 8, fy + 92);
        ctx.lineTo(wx + 54, fy + 92);
        for (let bx = wx - 4; bx < wx + 54; bx += 8) {
          ctx.moveTo(bx, fy + 92);
          ctx.lineTo(bx, fy + 108);
        }
        ctx.moveTo(wx - 8, fy + 108);
        ctx.lineTo(wx + 54, fy + 108);
        ctx.stroke();
      }
    }
    const sy = bottom - 150;
    OP.rr(ctx, x + 10, sy, w - 20, 150, 4);
    OP.fs(ctx, nm(awning[1], night), O(), 4);
    for (let wx = x + 30; wx < x + w - 90; wx += 120) {
      OP.rr(ctx, wx, sy + 40, 90, 100, 6);
      OP.fs(ctx, night > 0.2 ? `rgba(255,200,120,${0.4 + night * 0.5})` : nm('#7aa0b8', night), O(), 3);
    }
    const aw = w - 20;
    const n = Math.floor(aw / 36);
    for (let i = 0; i < n; i++) {
      const ax = x + 10 + i * (aw / n);
      ctx.beginPath();
      ctx.moveTo(ax, sy - 30);
      ctx.lineTo(ax + aw / n, sy - 30);
      ctx.lineTo(ax + aw / n, sy + 8);
      ctx.arc(ax + aw / n / 2, sy + 8, aw / n / 2, 0, Math.PI);
      ctx.closePath();
      ctx.fillStyle = nm(i % 2 ? '#fff3e0' : awning[0], night);
      ctx.fill();
    }
    ctx.strokeStyle = O();
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 10, sy - 30, aw, 38);
  }

  function shopFacade(ctx, t, o, night) {
    const x0 = 392;
    const x1 = 888;
    const top = 132;
    const ground = 642;
    const dusty = o.dusty ? 1 : 0;
    const lights = o.lights || 0;
    // wall + roof + chimney
    OP.rr(ctx, 560, 20, 40, 70, 4);
    OP.fs(ctx, nm('#b8735a', night), O(), 4);
    ctx.beginPath();
    ctx.moveTo(x0 - 14, top);
    ctx.lineTo(x0 + 22, top - 70);
    ctx.lineTo(x1 - 22, top - 70);
    ctx.lineTo(x1 + 14, top);
    ctx.closePath();
    OP.fs(ctx, nm('#5d6f8d', night), O(), 4);
    for (let wx = x0 + 70; wx < x1 - 60; wx += 150) {
      ctx.beginPath();
      ctx.moveTo(wx, top - 10);
      ctx.lineTo(wx, top - 46);
      ctx.arc(wx + 22, top - 46, 22, Math.PI, 0);
      ctx.lineTo(wx + 44, top - 10);
      ctx.closePath();
      OP.fs(ctx, night > 0.3 ? '#ffd27a' : nm('#a9c6da', night), O(), 3);
    }
    OP.rr(ctx, x0, top, x1 - x0, ground - top, 2);
    const wg = ctx.createLinearGradient(0, top, 0, ground);
    wg.addColorStop(0, nm('#f6dcc9', night));
    wg.addColorStop(1, nm('#e9c7ae', night));
    OP.fs(ctx, wg, O(), 4);
    for (const wx of [440, 604, 768]) {
      OP.rr(ctx, wx - 6, 152, 84, 104, 8);
      OP.fs(ctx, nm('#fff6ea', night), O(), 3);
      OP.rr(ctx, wx, 158, 72, 92, 6);
      OP.fs(ctx, night > 0.3 && wx !== 604 ? '#ffcf73' : nm('#8db3cb', night), O(), 3);
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.fillRect(wx + 8, 164, 10, 70);
      OP.rr(ctx, wx - 10, 252, 92, 16, 4);
      OP.fs(ctx, nm('#c86a3a', night), O(), 3);
      for (let k = 0; k < 5; k++) {
        OP.ell(ctx, wx + 4 + k * 16, 246 - (k % 2) * 4, 8, 7);
        OP.fs(ctx, nm(k % 2 ? '#ff8fb1' : '#6fae4f', night), O(), 2);
      }
    }
    // sign board
    const signOn = o.signOn || 0;
    OP.rr(ctx, 424, 276, 432, 58, 12);
    const sg = ctx.createLinearGradient(0, 276, 0, 334);
    sg.addColorStop(0, nm('#9a5f30', night * 0.6));
    sg.addColorStop(1, nm('#6e3f1c', night * 0.6));
    OP.fs(ctx, sg, O(), 4);
    const txtCol = dusty ? '#8d7a66' : signOn > 0.5 ? '#fff1b0' : nm('#e9b758', night);
    OP.text(ctx, OP.TITLE, 640, 306, { size: 38, color: txtCol, stroke: '#3a1a08', lw: 7 });
    // awning
    const n = 12;
    const aw = 476;
    for (let i = 0; i < n; i++) {
      const ax = 402 + (i * aw) / n;
      ctx.beginPath();
      ctx.moveTo(ax, 340);
      ctx.lineTo(ax + aw / n, 340);
      ctx.lineTo(ax + aw / n, 374);
      ctx.arc(ax + aw / n / 2, 374, aw / n / 2, 0, Math.PI);
      ctx.closePath();
      const base = i % 2 ? '#fff3e0' : dusty ? '#b58c96' : '#ee7b95';
      ctx.fillStyle = nm(base, night);
      ctx.fill();
    }
    ctx.beginPath();
    for (let i = 0; i < n; i++) ctx.arc(402 + ((i + 0.5) * aw) / n, 374, aw / n / 2, Math.PI, 0, true);
    ctx.strokeStyle = O();
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeRect(402, 340, aw, 34);
    // storefront
    OP.rr(ctx, 410, 392, 460, ground - 392, 4);
    OP.fs(ctx, nm('#2f5d50', night * 0.7), O(), 4);
    const winPath = () => {
      ctx.beginPath();
      ctx.moveTo(432, 606);
      ctx.lineTo(432, 450);
      ctx.ellipse(566, 450, 134, 44, 0, Math.PI, 0);
      ctx.lineTo(700, 606);
      ctx.closePath();
    };
    winPath();
    const inside = ctx.createLinearGradient(0, 406, 0, 606);
    if (lights > 0) {
      inside.addColorStop(0, '#ffd28a');
      inside.addColorStop(1, '#e08a3c');
    } else {
      inside.addColorStop(0, nm('#4a3a38', night * 0.5));
      inside.addColorStop(1, nm('#2a1e1c', night * 0.5));
    }
    OP.fs(ctx, inside, O(), 4);
    ctx.save();
    winPath();
    ctx.clip();
    ctx.fillStyle = lights ? 'rgba(90,50,25,.55)' : 'rgba(0,0,0,.35)';
    ctx.fillRect(432, 540, 268, 70);
    for (const lx of [500, 632]) {
      ctx.strokeStyle = 'rgba(40,20,10,.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, 400);
      ctx.lineTo(lx, 452);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lx, 466, 16, Math.PI, 0);
      ctx.fillStyle = '#2f5d50';
      ctx.fill();
      if (lights) {
        OP.ell(ctx, lx, 468, 7, 5);
        ctx.fillStyle = '#fff6c8';
        ctx.fill();
      }
    }
    for (let k = 0; k < 4; k++) OP.drawCroissant(ctx, 470 + k * 58, 530, 0.36, { state: 'baked', noShadow: true });
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath();
    ctx.moveTo(470, 406);
    ctx.lineTo(520, 406);
    ctx.lineTo(450, 606);
    ctx.lineTo(400, 606);
    ctx.fill();
    ctx.restore();
    winPath();
    ctx.strokeStyle = nm('#d6a84a', night * 0.6);
    ctx.lineWidth = 3;
    ctx.stroke();
    // door
    OP.rr(ctx, 728, 400, 118, ground - 400, 6);
    OP.fs(ctx, nm('#244a40', night * 0.7), O(), 4);
    OP.rr(ctx, 744, 416, 86, 96, 6);
    OP.fs(ctx, lights ? '#ffd28a' : nm('#3a3230', night * 0.5), O(), 3);
    OP.rr(ctx, 744, 528, 86, 90, 6);
    OP.fs(ctx, nm('#2f5d50', night * 0.7), O(), 3);
    OP.ell(ctx, 818, 540, 6, 6);
    OP.fs(ctx, '#d6a84a', O(), 2);
    const open = lights > 0;
    ctx.save();
    ctx.translate(787, 440);
    ctx.rotate(Math.sin(t * 2) * 0.05);
    OP.rr(ctx, -34, 0, 68, 26, 6);
    OP.fs(ctx, open ? '#fff3e0' : '#d9d2c8', O(), 2.5);
    OP.text(ctx, open ? 'פתוח' : 'סגור', 0, 13, { size: 16, color: open ? '#2f7d3a' : '#b0392e' });
    ctx.restore();
    // roller shutter
    const shut = 1 - OP.clamp(o.shutter == null ? 1 : o.shutter, 0, 1);
    if (shut > 0.001) {
      const sh = (ground - 386) * shut;
      ctx.save();
      ctx.beginPath();
      ctx.rect(416, 386, 448, sh);
      ctx.clip();
      const mg = ctx.createLinearGradient(416, 0, 864, 0);
      mg.addColorStop(0, nm('#8c969e', night * 0.6));
      mg.addColorStop(0.5, nm('#b9c2c8', night * 0.6));
      mg.addColorStop(1, nm('#7e8890', night * 0.6));
      ctx.fillStyle = mg;
      ctx.fillRect(416, 386, 448, sh);
      for (let y = 386 + sh; y > 386; y -= 12) {
        ctx.fillStyle = 'rgba(40,45,50,.35)';
        ctx.fillRect(416, y - 3, 448, 3);
        ctx.fillStyle = 'rgba(255,255,255,.25)';
        ctx.fillRect(416, y - 10, 448, 2);
      }
      if (dusty) {
        ctx.fillStyle = 'rgba(120,100,80,.25)';
        ctx.fillRect(416, 386, 448, sh);
        OP.text(ctx, 'OSCAR', 640, 386 + sh - 70, { size: 46, color: 'rgba(90,70,60,.35)', dir: 'ltr' });
      }
      ctx.restore();
      OP.rr(ctx, 416, 386 + sh - 12, 448, 14, 4);
      OP.fs(ctx, nm('#6e7880', night * 0.6), O(), 3);
      OP.rr(ctx, 620, 386 + sh - 6, 40, 10, 4);
      OP.fs(ctx, '#3a3f45', O(), 2);
    }
    OP.rr(ctx, 402, 380, 476, 12, 4);
    OP.fs(ctx, nm('#244a40', night * 0.7), O(), 3);
    if (dusty) {
      ctx.fillStyle = 'rgba(110,100,95,.22)';
      ctx.fillRect(x0, top - 70, x1 - x0, ground - top + 70);
      ctx.strokeStyle = 'rgba(240,240,240,.5)';
      ctx.lineWidth = 1.2;
      for (const [cx, cy] of [[412, 392], [868, 392]]) {
        for (let a = 0; a < 5; a++) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a * 0.4) * 30 * (cx < 640 ? 1 : -1), cy + Math.sin(a * 0.4) * 30);
          ctx.stroke();
        }
        for (const rr of [10, 20]) {
          ctx.beginPath();
          ctx.arc(cx, cy, rr, cx < 640 ? 0 : Math.PI * 0.5, cx < 640 ? Math.PI * 0.5 : Math.PI);
          ctx.stroke();
        }
      }
    }
    // planters
    for (const px of [398, 866]) {
      for (let k = 0; k < 5; k++) {
        OP.ell(ctx, px - 16 + k * 8, 600 - (k % 2) * 10, 10, 14);
        OP.fs(ctx, nm('#5f9e4a', night), O(), 2);
      }
      for (let k = 0; k < 3; k++) {
        OP.ell(ctx, px - 10 + k * 10, 590 - k * 4, 5, 5);
        OP.fs(ctx, nm('#ff8fb1', night), O(), 2);
      }
      ctx.beginPath();
      ctx.moveTo(px - 22, 610);
      ctx.lineTo(px + 22, 610);
      ctx.lineTo(px + 16, 646);
      ctx.lineTo(px - 16, 646);
      ctx.closePath();
      OP.fs(ctx, nm('#c86a3a', night), O(), 3);
    }
  }

  function lampPost(ctx, x, night, on) {
    OP.rr(ctx, x - 6, 330, 12, 330, 5);
    OP.fs(ctx, '#2a2e38', O(), 3);
    OP.rr(ctx, x - 18, 646, 36, 16, 5);
    OP.fs(ctx, '#2a2e38', O(), 3);
    ctx.beginPath();
    ctx.moveTo(x - 22, 330);
    ctx.lineTo(x + 22, 330);
    ctx.lineTo(x + 14, 286);
    ctx.lineTo(x - 14, 286);
    ctx.closePath();
    OP.fs(ctx, on ? '#fff0b8' : nm('#c9d6de', night), O(), 3);
    ctx.beginPath();
    ctx.moveTo(x - 24, 288);
    ctx.lineTo(x, 266);
    ctx.lineTo(x + 24, 288);
    ctx.closePath();
    OP.fs(ctx, '#2a2e38', O(), 3);
  }

  OP.drawStreet = (ctx, t, o = {}) => {
    const tod = o.tod == null ? 0.3 : o.tod;
    const night = OP.nightness(tod);
    const rain = o.weather === 'rain';
    const sky = OP.skyAt(tod, rain);
    const g = ctx.createLinearGradient(0, 0, 0, 480);
    g.addColorStop(0, sky.top);
    g.addColorStop(0.6, sky.mid);
    g.addColorStop(1, sky.low);
    ctx.fillStyle = g;
    ctx.fillRect(-400, -300, 2080, 800);
    if (night > 0) {
      for (const s of STARS) {
        OP.ell(ctx, s.x * 1280, s.y * 330, 1 + s.s * 1.4, 1 + s.s * 1.4);
        ctx.fillStyle = `rgba(255,250,230,${night * (0.5 + 0.5 * Math.sin(t * 2 + s.p))})`;
        ctx.fill();
      }
      const mg = ctx.createRadialGradient(1100, 110, 10, 1100, 110, 110);
      mg.addColorStop(0, `rgba(255,250,220,${0.45 * night})`);
      mg.addColorStop(1, 'rgba(255,250,220,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(990, 0, 220, 220);
      OP.ell(ctx, 1100, 110, 34, 34);
      ctx.fillStyle = `rgba(255,248,220,${night})`;
      ctx.fill();
    }
    if (night < 1 && !rain) {
      const sx = 200 + tod * 1100;
      const sy = 420 - Math.sin(OP.clamp(tod / 0.85, 0, 1) * Math.PI) * 300;
      const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 220);
      sg.addColorStop(0, `rgba(255,248,210,${1 - night})`);
      sg.addColorStop(0.15, `rgba(255,228,160,${0.6 * (1 - night)})`);
      sg.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(sx - 220, sy - 220, 440, 440);
    }
    const cloudCol = rain ? 'rgba(110,116,132,.9)' : night > 0.5 ? 'rgba(90,95,150,.4)' : 'rgba(255,246,238,.8)';
    for (let i = 0; i < (rain ? 9 : 5); i++) {
      const cx = -120 + ((i * 263 + t * (10 + i * 3)) % 1520);
      puff(ctx, cx, 60 + ((i * 47) % 150), (rain ? 2.4 : 1.6) * (0.7 + (i % 3) * 0.2), cloudCol);
    }
    eiffel(ctx, 1000, 474, 440, nm('#b48aa0', night, 0.9), night, t);
    cityRow(ctx, -30, 1320, 480, 1.5, tod);
    ctx.fillStyle = rain ? 'rgba(140,150,170,.35)' : `rgba(255,215,190,${0.18 * (1 - night)})`;
    ctx.fillRect(-400, 380, 2080, 110);

    facade(ctx, -40, 176, 432, 646, night, 11, ['#4a90d9', '#1f3f5c']);
    facade(ctx, 888, 196, 432, 646, night, 29, ['#58b368', '#2f4a2a']);
    shopFacade(ctx, t, o, night);
    lampPost(ctx, 320, night, (o.lampOn || 0) > 0.5);

    // pavement and street
    ctx.fillStyle = nm('#cdbfae', night);
    ctx.fillRect(-400, 642, 2080, 50);
    ctx.strokeStyle = 'rgba(90,70,50,.35)';
    ctx.lineWidth = 2;
    for (let x = -40; x < 1320; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 642);
      ctx.lineTo(x - 10, 692);
      ctx.stroke();
    }
    ctx.fillStyle = nm('#9a8c7e', night);
    ctx.fillRect(-400, 690, 2080, 10);
    ctx.fillStyle = nm('#5a5560', night);
    ctx.fillRect(-400, 700, 2080, 120);
    for (let y = 706; y < 760; y += 14) {
      for (let x = ((y / 14) % 2) * 14 - 40; x < 1320; x += 28) {
        OP.rr(ctx, x, y, 24, 11, 4);
        ctx.fillStyle = nm('#6d6874', night);
        ctx.fill();
      }
    }
    if (rain) {
      for (let k = 0; k < 6; k++) {
        OP.ell(ctx, 120 + k * 220, 668, 60, 7);
        ctx.fillStyle = `rgba(190,210,240,${0.25 + 0.1 * Math.sin(t * 2 + k)})`;
        ctx.fill();
      }
    }
    // chalkboard A-frame
    ctx.save();
    ctx.translate(960, 648);
    ctx.beginPath();
    ctx.moveTo(-34, 0);
    ctx.lineTo(-24, -86);
    ctx.lineTo(24, -86);
    ctx.lineTo(34, 0);
    ctx.closePath();
    OP.fs(ctx, '#8b5a2b', O(), 3);
    OP.rr(ctx, -22, -78, 44, 64, 4);
    OP.fs(ctx, '#2f3b36', null);
    OP.drawCroissant(ctx, 0, -58, 0.22, { state: 'baked', noShadow: true });
    OP.text(ctx, 'חם!', 0, -30, { size: 14, color: '#f7b3c2' });
    ctx.restore();

    // friend bakers in multiplayer scenes, drawn behind Oscar
    if (o.friends) for (const f of o.friends) OP.drawOscarFull(ctx, f.x, 664, 0.4, t + f.x * 0.01, f);
    if (o.oscar) OP.drawOscarFull(ctx, o.oscar.x, 668, 0.42, t, o.oscar);
    const people = o.people || 0;
    for (let i = 0; i < people; i++) {
      const dir = i % 2 ? -1 : 1;
      const span = 1600;
      const px = dir > 0 ? -160 + ((t * (48 + i * 9) + i * 430) % span) : 1440 - ((t * (44 + i * 7) + i * 610) % span);
      OP.drawPasserby(ctx, px, 704, 0.62, t + i * 0.7, { seed: i + 1, dir, umbrella: rain, hat: i === 2, baguette: i === 1, night: night * 0.8 });
    }

    if (rain) {
      ctx.strokeStyle = 'rgba(200,215,245,.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 180; i++) {
        const rx = ((i * 97.3 + t * 140) % 1500) - 110;
        const ry = ((i * 61.7 + t * 760) % 820) - 60;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 6, ry + 20);
      }
      ctx.stroke();
    }

    OP.drawGrade(ctx, tod, o.weather);
    if (night > 0.35) {
      ctx.fillStyle = `rgba(10,12,40,${0.25 * night})`;
      ctx.fillRect(-400, -300, 2080, 1100);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = (x, y, r, col, a) => {
      if (a <= 0) return;
      const gg = ctx.createRadialGradient(x, y, 2, x, y, r);
      gg.addColorStop(0, `rgba(${col},${a})`);
      gg.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = gg;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const lampA = (o.lampOn || 0) * (0.35 + night * 0.4);
    glow(320, 310, 170, '255,220,150', lampA);
    if (lampA > 0) {
      ctx.fillStyle = `rgba(255,220,150,${lampA * 0.25})`;
      ctx.beginPath();
      ctx.moveTo(300, 330);
      ctx.lineTo(340, 330);
      ctx.lineTo(430, 700);
      ctx.lineTo(210, 700);
      ctx.closePath();
      ctx.fill();
    }
    const la = (o.lights || 0) * (0.3 + night * 0.35);
    glow(566, 520, 230, '255,180,90', la);
    glow(787, 470, 120, '255,190,110', la * 0.8);
    if (la > 0) {
      ctx.fillStyle = `rgba(255,190,110,${la * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(432, 642);
      ctx.lineTo(700, 642);
      ctx.lineTo(780, 700);
      ctx.lineTo(360, 700);
      ctx.closePath();
      ctx.fill();
    }
    const sa = (o.signOn || 0) * (0.35 + night * 0.3) * (0.92 + Math.sin(t * 20) * 0.08);
    glow(640, 306, 260, '255,225,140', sa);
    ctx.restore();

    if (o.sparkles) {
      for (let i = 0; i < 16; i++) {
        const ph = (o.sparkles * 1.6 + i / 16) % 1;
        const a = i * 2.4;
        const r0 = 60 + ph * 220;
        OP.icon(ctx, 'sparkle', 640 + Math.cos(a) * r0 * 1.4, 306 + Math.sin(a) * r0 * 0.5, 26 * (1 - ph) + 6, { color: '#fff6b0', alpha: (1 - ph) * Math.min(1, o.sparkles * 4) });
      }
    }
  };

  // The live view through the shop's back window (drawn under the pre-rendered wall).
  OP.drawWindowView = (ctx, t, tod, weather) => {
    const { x, y, w, h, archH } = OP.WINDOW;
    const rain = weather === 'rain';
    const night = OP.nightness(tod);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - 2, y + h + 2);
    ctx.lineTo(x - 2, y + archH);
    ctx.ellipse(x + w / 2, y + archH, w / 2 + 2, archH + 2, 0, Math.PI, 0);
    ctx.lineTo(x + w + 2, y + h + 2);
    ctx.closePath();
    ctx.clip();
    const sky = OP.skyAt(tod, rain);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, sky.top);
    g.addColorStop(0.55, sky.mid);
    g.addColorStop(1, sky.low);
    ctx.fillStyle = g;
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    if (night > 0) {
      for (const s of STARS) {
        if (s.y > 0.6) continue;
        OP.ell(ctx, x + s.x * w, y + s.y * h, 0.8 + s.s, 0.8 + s.s);
        ctx.fillStyle = `rgba(255,250,230,${night * (0.5 + 0.5 * Math.sin(t * 2 + s.p))})`;
        ctx.fill();
      }
      OP.ell(ctx, x + w * 0.8, y + 44, 13, 13);
      ctx.fillStyle = `rgba(255,248,220,${night})`;
      ctx.fill();
    }
    if (night < 1 && !rain) {
      const sp = OP.clamp(tod / 0.82, 0, 1);
      const sx = x + w * (0.12 + 0.8 * sp);
      const sy = y + h * 0.9 - Math.sin(sp * Math.PI) * h * 0.66;
      const sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, 120);
      sg.addColorStop(0, `rgba(255,252,220,${1 - night})`);
      sg.addColorStop(0.18, `rgba(255,236,170,${0.7 * (1 - night)})`);
      sg.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(x, y, w, h);
    }
    const cloudCol = rain ? 'rgba(112,118,134,.9)' : night > 0.5 ? 'rgba(100,100,160,.35)' : 'rgba(255,246,238,.78)';
    for (let i = 0; i < (rain ? 7 : 4); i++) {
      const cx = x - 70 + ((i * 131 + t * (6 + i * 2)) % (w + 140));
      puff(ctx, cx, y + 30 + ((i * 29) % 64), (rain ? 1.3 : 0.9) * (0.7 + (i % 3) * 0.2), cloudCol);
    }
    if (!rain && night < 0.6) {
      ctx.strokeStyle = 'rgba(50,35,45,.65)';
      ctx.lineWidth = 1.8;
      for (let k = 0; k < 3; k++) {
        const bx = x - 30 + ((t * (34 + k * 6) + k * 120) % (w + 60));
        const by = y + 44 + k * 16 + Math.sin(t * 2 + k) * 8;
        const f = Math.sin(t * 14 + k * 2) * 3;
        ctx.beginPath();
        ctx.moveTo(bx - 7, by - f);
        ctx.quadraticCurveTo(bx - 3, by - 4, bx, by);
        ctx.quadraticCurveTo(bx + 3, by - 4, bx + 7, by - f);
        ctx.stroke();
      }
    }
    eiffel(ctx, x + w * 0.28, y + h - 36, 150, nm('#b88ba2', night, 0.9), night, t);
    cityRow(ctx, x - 12, x + w + 12, y + h, 1, tod);
    ctx.fillStyle = nm('#86b27f', night, 0.85);
    for (let tx = x + 18; tx < x + w; tx += 72) {
      OP.ell(ctx, tx + ((tx * 7) % 20), y + h - 10, 28, 20);
      ctx.fill();
    }
    for (let i = 0; i < 4; i++) {
      const dir = i % 2 ? -1 : 1;
      const span = w + 120;
      const px = dir > 0 ? x - 60 + ((t * (18 + i * 4) + i * 97) % span) : x + w + 60 - ((t * (16 + i * 3) + i * 151) % span);
      OP.drawPasserby(ctx, px, y + h + 6, 0.3, t + i, { seed: i, dir, umbrella: rain, night, baguette: i === 1 });
    }
    ctx.fillStyle = rain ? 'rgba(90,100,125,.22)' : `rgba(255,220,190,${0.08 * (1 - night)})`;
    ctx.fillRect(x, y, w, h);
    if (rain) {
      ctx.strokeStyle = 'rgba(225,236,255,.75)';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (let i = 0; i < 70; i++) {
        const rx = x + ((i * 53.7 + t * 60) % (w + 40)) - 20;
        const ry = y + ((i * 91.3 + t * 480) % (h + 40)) - 40;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 14);
      }
      ctx.stroke();
      for (let i = 0; i < 22; i++) {
        const dx = x + ((i * 71) % w);
        const dy = y + ((i * 43 + t * (10 + (i % 5) * 7)) % h);
        ctx.fillStyle = 'rgba(235,242,255,.22)';
        ctx.fillRect(dx - 1, dy - 16, 2, 14);
        OP.ell(ctx, dx, dy, 2.6, 3.3);
        ctx.fillStyle = 'rgba(240,246,255,.6)';
        ctx.fill();
      }
    }
    ctx.fillStyle = `rgba(255,255,255,${0.14 + 0.05 * (1 - night)})`;
    ctx.beginPath();
    ctx.moveTo(x + 40, y);
    ctx.lineTo(x + 116, y);
    ctx.lineTo(x + 10, y + h);
    ctx.lineTo(x - 66, y + h);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 146, y);
    ctx.lineTo(x + 166, y);
    ctx.lineTo(x + 60, y + h);
    ctx.lineTo(x + 40, y + h);
    ctx.fill();
    ctx.restore();
  };
})();
