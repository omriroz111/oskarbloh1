// הפיטסרי של אוסקר — pre-rendered scenery: tiled wall + shop window, stone walls, marble counter, light layers
var OP = globalThis.OP || (globalThis.OP = {});

OP.LAMPS = [372, 904];

(function () {
  const OUT = () => OP.OUT;

  // ---------- back wall ----------
  function subwayTiles(ctx, rnd, x0, y0, x1, y1) {
    ctx.fillStyle = '#e6efe8';
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    const tw = 56;
    const th = 28;
    for (let row = 0, y = y0; y < y1; row++, y += th) {
      for (let x = x0 - (row % 2) * (tw / 2); x < x1; x += tw) {
        const v = (rnd() - 0.5) * 0.1;
        OP.rr(ctx, x + 1.5, y + 1.5, tw - 3, th - 3, 5);
        const g = ctx.createLinearGradient(0, y, 0, y + th);
        g.addColorStop(0, OP.shade('#93d3c5', v + 0.06));
        g.addColorStop(1, OP.shade('#6cb5a7', v));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(40,90,80,.32)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.38)';
        ctx.fillRect(x + 7, y + 5, tw - 24, 3);
        if (rnd() < 0.04) {
          ctx.beginPath();
          let cx = x + 10 + rnd() * 30;
          let cy = y + 3;
          ctx.moveTo(cx, cy);
          for (let k = 0; k < 3; k++) {
            cx += (rnd() - 0.3) * 10;
            cy += 7;
            ctx.lineTo(cx, cy);
          }
          ctx.strokeStyle = 'rgba(30,60,55,.45)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }
    }
  }

  function eiffel(ctx, cx, base, hgt, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 34, base);
    ctx.quadraticCurveTo(cx - 10, base - hgt * 0.35, cx - 3, base - hgt);
    ctx.lineTo(cx + 3, base - hgt);
    ctx.quadraticCurveTo(cx + 10, base - hgt * 0.35, cx + 34, base);
    ctx.lineTo(cx + 18, base);
    ctx.quadraticCurveTo(cx, base - 30, cx - 18, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 21, base - hgt * 0.3, 42, 5);
    ctx.fillRect(cx - 11, base - hgt * 0.58, 22, 4);
    ctx.fillRect(cx - 1, base - hgt - 12, 2, 12);
  }

  function shopWindow(ctx, rnd, x, y, w, h) {
    const archH = 64;
    const path = (grow) => {
      ctx.beginPath();
      ctx.moveTo(x - grow, y + h + grow);
      ctx.lineTo(x - grow, y + archH);
      ctx.ellipse(x + w / 2, y + archH, w / 2 + grow, archH + grow, 0, Math.PI, 0);
      ctx.lineTo(x + w + grow, y + h + grow);
      ctx.closePath();
    };
    ctx.save();
    ctx.shadowColor = 'rgba(20,40,30,.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    path(20);
    OP.fs(ctx, '#2f5d50', OUT(), 4);
    ctx.restore();
    path(20);
    ctx.strokeStyle = OUT();
    ctx.lineWidth = 4;
    ctx.stroke();
    path(10);
    ctx.strokeStyle = '#4c8a78';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    path(0);
    ctx.clip();
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#f39a86');
    sky.addColorStop(0.45, '#ffc59a');
    sky.addColorStop(1, '#ffe6bd');
    ctx.fillStyle = sky;
    ctx.fillRect(x - 20, y - 20, w + 40, h + 40);
    const sx = x + w * 0.72;
    const sy = y + h * 0.6;
    const sg = ctx.createRadialGradient(sx, sy, 8, sx, sy, 130);
    sg.addColorStop(0, 'rgba(255,252,220,1)');
    sg.addColorStop(0.18, 'rgba(255,236,170,.75)');
    sg.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,244,236,.75)';
    for (const [cx, cy, s] of [[x + 80, y + 56, 1], [x + 262, y + 34, 0.75], [x + 330, y + 92, 0.6]]) {
      OP.ell(ctx, cx, cy, 38 * s, 11 * s);
      ctx.fill();
      OP.ell(ctx, cx + 20 * s, cy - 8 * s, 22 * s, 12 * s);
      ctx.fill();
    }
    eiffel(ctx, x + w * 0.28, y + h - 36, 150, '#b88ba2');
    let bx = x - 10;
    while (bx < x + w + 10) {
      const bw = 44 + rnd() * 40;
      const bh = 38 + rnd() * 46;
      const top = y + h - bh;
      ctx.fillStyle = OP.shade('#d9a6b6', (rnd() - 0.5) * 0.16);
      ctx.fillRect(bx, top, bw, bh);
      ctx.fillStyle = '#8f7a9a';
      ctx.beginPath();
      ctx.moveTo(bx - 3, top);
      ctx.lineTo(bx + 7, top - 16);
      ctx.lineTo(bx + bw - 7, top - 16);
      ctx.lineTo(bx + bw + 3, top);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,238,190,.95)';
      for (let wy = top + 10; wy < y + h - 12; wy += 18) {
        for (let wx = bx + 8; wx < bx + bw - 10; wx += 14) ctx.fillRect(wx, wy, 6, 9);
      }
      bx += bw + 2;
    }
    ctx.fillStyle = '#86b27f';
    for (let tx = x + 18; tx < x + w; tx += 72) {
      OP.ell(ctx, tx + rnd() * 20, y + h - 12, 28, 20);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.2)';
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

    // the glass is painted live every frame (OP.drawWindowView), so punch it out of this layer
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    path(0);
    ctx.fill();
    ctx.restore();

    const bar = (x0, y0, x1, y1) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineCap = 'butt';
      ctx.strokeStyle = OUT();
      ctx.lineWidth = 13;
      ctx.stroke();
      ctx.strokeStyle = '#2f5d50';
      ctx.lineWidth = 7;
      ctx.stroke();
    };
    bar(x + w / 2, y + archH - 60, x + w / 2, y + h);
    bar(x, y + archH + 22, x + w, y + archH + 22);
    for (const a of [-0.6, 0.6]) bar(x + w / 2, y + archH + 22, x + w / 2 + Math.sin(a) * (w / 2), y + archH - Math.cos(a) * archH);
    path(0);
    ctx.strokeStyle = OUT();
    ctx.lineWidth = 4;
    ctx.stroke();

    // gold leaf lettering on the glass
    const word = 'PATISSERIE';
    for (let i = 0; i < word.length; i++) {
      const a = -0.95 + (i / (word.length - 1)) * 1.9;
      const px = x + w / 2 + Math.sin(a) * (w / 2 - 44);
      const py = y + archH + 34 - Math.cos(a) * (archH + 4);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a * 0.75);
      OP.text(ctx, word[i], 0, 0, { size: 19, color: '#f6cf6a', stroke: '#6b3d12', lw: 4, dir: 'ltr' });
      ctx.restore();
    }

    OP.rr(ctx, x - 34, y + h + 12, w + 68, 16, 4);
    OP.fs(ctx, '#9a6538', OUT(), 3);
    for (const fx of [x - 10, x + w - 50]) flowerBox(ctx, fx, y + h + 12);
  }

  function flowerBox(ctx, x, y) {
    for (let k = 0; k < 5; k++) {
      OP.ell(ctx, x + 8 + k * 10, y - 10 - (k % 2) * 6, 9, 7, k * 0.6);
      OP.fs(ctx, '#5f9e4a', OUT(), 2);
    }
    for (let k = 0; k < 4; k++) {
      OP.ell(ctx, x + 12 + k * 11, y - 16 - (k % 2) * 8, 5, 5);
      OP.fs(ctx, k % 2 ? '#ff8fb1' : '#fff0a0', OUT(), 2);
    }
    OP.rr(ctx, x, y - 8, 60, 16, 3);
    OP.fs(ctx, '#c86a3a', OUT(), 3);
  }

  function shelf(ctx, x, y, w) {
    for (const bx of [x + 14, x + w - 24]) {
      ctx.beginPath();
      ctx.moveTo(bx, y + 10);
      ctx.lineTo(bx + 10, y + 10);
      ctx.lineTo(bx + 10, y + 34);
      ctx.closePath();
      OP.fs(ctx, '#6b4127', OUT(), 2.5);
    }
    OP.rr(ctx, x, y, w, 12, 3);
    OP.fs(ctx, '#9a6538', OUT(), 3);
    ctx.fillStyle = 'rgba(255,220,170,.4)';
    ctx.fillRect(x + 4, y + 2, w - 8, 3);
  }
  function jar(ctx, x, y, w, h, fill, lid) {
    OP.rr(ctx, x - w / 2, y - h, w, h, 8);
    OP.fs(ctx, 'rgba(228,244,248,.9)', OUT(), 2.5);
    OP.rr(ctx, x - w / 2 + 4, y - h * 0.64, w - 8, h * 0.6, 5);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let k = 0; k < 4; k++) {
      OP.ell(ctx, x - w / 2 + 8 + ((k * 9) % (w - 14)), y - h * 0.44 + (k % 2) * 8, 3, 3);
      ctx.fill();
    }
    OP.rr(ctx, x - w / 2 - 2, y - h - 6, w + 4, 9, 3);
    OP.fs(ctx, lid, OUT(), 2.5);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillRect(x - w / 2 + 4, y - h + 6, 3, h - 14);
  }
  function loaf(ctx, x, y, s) {
    OP.ell(ctx, x, y - 13 * s, 30 * s, 14 * s);
    OP.fs(ctx, '#d9913f', OUT(), 2.5);
    ctx.strokeStyle = '#8c5427';
    ctx.lineWidth = 2.5;
    for (const k of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.moveTo(x + (k - 5) * s, y - 20 * s);
      ctx.quadraticCurveTo(x + k * s, y - 14 * s, x + (k + 5) * s, y - 8 * s);
      ctx.stroke();
    }
    OP.ell(ctx, x - 10 * s, y - 20 * s, 10 * s, 3 * s, -0.2);
    ctx.fillStyle = 'rgba(255,230,170,.6)';
    ctx.fill();
  }
  function baguette(ctx, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    OP.rr(ctx, -8, -64, 16, 64, 8);
    OP.fs(ctx, '#e0a458', OUT(), 2.5);
    ctx.strokeStyle = '#8c5427';
    ctx.lineWidth = 2;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(-4, -54 + k * 13);
      ctx.lineTo(4, -48 + k * 13);
      ctx.stroke();
    }
    ctx.restore();
  }
  function plant(ctx, x, y) {
    for (let k = 0; k < 6; k++) {
      ctx.save();
      ctx.translate(x, y - 20);
      ctx.rotate(-1.2 + k * 0.48);
      OP.ell(ctx, 0, -16, 7, 17);
      OP.fs(ctx, k % 2 ? '#6fa94f' : '#5a9440', OUT(), 2);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 22);
    ctx.lineTo(x + 14, y - 22);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x - 10, y);
    ctx.closePath();
    OP.fs(ctx, '#c86a3a', OUT(), 2.5);
  }

  function lamp(ctx, x) {
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, 110);
    ctx.stroke();
    OP.rr(ctx, x - 6, 102, 12, 9, 3);
    OP.fs(ctx, '#d6a84a', OUT(), 2);
    ctx.beginPath();
    ctx.moveTo(x - 32, 142);
    ctx.quadraticCurveTo(x - 30, 110, x, 108);
    ctx.quadraticCurveTo(x + 30, 110, x + 32, 142);
    ctx.closePath();
    const g = ctx.createLinearGradient(x - 32, 0, x + 32, 0);
    g.addColorStop(0, '#2a5247');
    g.addColorStop(0.4, '#3f7a69');
    g.addColorStop(1, '#244439');
    OP.fs(ctx, g, OUT(), 3);
    OP.ell(ctx, x - 12, 122, 5, 9, 0.5);
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.fill();
    OP.ell(ctx, x, 142, 32, 6);
    OP.fs(ctx, '#d6a84a', OUT(), 2.5);
    OP.ell(ctx, x, 146, 11, 7);
    ctx.fillStyle = '#fff7cf';
    ctx.fill();
  }

  function awning(ctx) {
    const ax0 = 220;
    const sw = 44;
    const n = 20;
    ctx.save();
    ctx.fillStyle = 'rgba(40,20,10,.28)';
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(ax0 + i * sw + sw / 2, 64, sw / 2, 0, Math.PI);
      ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < n; i++) {
      const x = ax0 + i * sw;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + sw, 0);
      ctx.lineTo(x + sw, 52);
      ctx.arc(x + sw / 2, 52, sw / 2, 0, Math.PI);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, 74);
      const c = i % 2 ? '#fff3e0' : '#ee7b95';
      g.addColorStop(0, OP.shade(c, -0.18));
      g.addColorStop(1, c);
      ctx.fillStyle = g;
      ctx.fill();
      const fold = ctx.createLinearGradient(x, 0, x + sw, 0);
      fold.addColorStop(0, 'rgba(60,20,20,.16)');
      fold.addColorStop(0.5, 'rgba(255,255,255,.1)');
      fold.addColorStop(1, 'rgba(60,20,20,.08)');
      ctx.fillStyle = fold;
      ctx.fill();
    }
    ctx.beginPath();
    for (let i = 0; i < n; i++) ctx.arc(ax0 + i * sw + sw / 2, 52, sw / 2, Math.PI, 0, true);
    ctx.strokeStyle = OUT();
    ctx.lineWidth = 4;
    ctx.stroke();
    // string lights
    ctx.beginPath();
    ctx.moveTo(ax0, 60);
    for (let i = 0; i < n; i++) ctx.quadraticCurveTo(ax0 + i * sw + sw / 2, 88, ax0 + (i + 1) * sw, 60);
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      const bx = ax0 + i * sw + sw / 2;
      OP.rr(ctx, bx - 3, 70, 6, 5, 1);
      ctx.fillStyle = '#2a1a10';
      ctx.fill();
      OP.ell(ctx, bx, 80, 5, 7);
      OP.fs(ctx, i % 3 === 1 ? '#ffd27a' : '#fff4c4', OUT(), 1.5);
    }
    // hanging wooden sign with gold lettering
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 2;
    OP.rr(ctx, 446, 6, 388, 56, 14);
    const wg = ctx.createLinearGradient(0, 6, 0, 62);
    wg.addColorStop(0, '#9a5f30');
    wg.addColorStop(1, '#6e3f1c');
    OP.fs(ctx, wg, OUT(), 4);
    OP.rr(ctx, 455, 13, 370, 42, 10);
    ctx.strokeStyle = '#e9b758';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    OP.text(ctx, OP.TITLE, 640, 35, { size: 34, color: '#ffd77a', stroke: '#4a220c', lw: 6 });
    OP.drawCroissant(ctx, 482, 36, 0.3, { state: 'baked', noShadow: true });
    OP.drawCroissant(ctx, 798, 36, 0.3, { state: 'baked', noShadow: true });
  }

  function wainscot(ctx, rnd) {
    const y0 = 300;
    const g = ctx.createLinearGradient(0, y0, 0, 440);
    g.addColorStop(0, '#6b4127');
    g.addColorStop(1, '#3f2414');
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, 1280, 140);
    for (let x = 240; x < 1100; x += 142) {
      OP.rr(ctx, x + 12, y0 + 24, 118, 80, 6);
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,160,.2)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(40,20,8,.25)';
      for (let k = 0; k < 4; k++) ctx.fillRect(x + 20 + rnd() * 70, y0 + 34 + rnd() * 60, 30 + rnd() * 30, 2);
    }
    OP.rr(ctx, -10, y0 - 10, 1300, 18, 4);
    OP.fs(ctx, '#8b5a34', OUT(), 3);
    ctx.fillStyle = 'rgba(255,220,170,.35)';
    ctx.fillRect(0, y0 - 7, 1280, 3);
  }

  OP.drawBackLayer = (ctx) => {
    const rnd = OP.mulberry32(7);
    subwayTiles(ctx, rnd, 0, 60, 1280, 300);
    // rose accent band under the awning
    for (let x = 0; x < 1280; x += 28) {
      OP.rr(ctx, x + 1, 62, 26, 18, 3);
      ctx.fillStyle = (x / 28) % 2 ? '#f6b7c6' : '#fde6ec';
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(80,30,40,.25)';
    ctx.fillRect(0, 80, 1280, 3);
    shopWindow(ctx, rnd, 452, 92, 376, 206);
    wainscot(ctx, rnd);

    shelf(ctx, 300, 164, 142);
    jar(ctx, 326, 164, 30, 44, '#f5a3c0', '#ee7b95');
    jar(ctx, 364, 164, 26, 36, '#ffd36b', '#6fb7a8');
    plant(ctx, 410, 164);
    shelf(ctx, 846, 164, 196);
    loaf(ctx, 884, 164, 1);
    baguette(ctx, 930, 164, -0.25);
    baguette(ctx, 944, 164, -0.12);
    jar(ctx, 986, 164, 30, 46, '#8a5a3a', '#d6a84a');
    jar(ctx, 1020, 164, 22, 32, '#b7dc78', '#ee7b95');

    for (const x of OP.LAMPS) lamp(ctx, x);
    awning(ctx);

    const sh = ctx.createLinearGradient(0, 360, 0, 440);
    sh.addColorStop(0, 'rgba(25,12,5,0)');
    sh.addColorStop(1, 'rgba(25,12,5,.35)');
    ctx.fillStyle = sh;
    ctx.fillRect(0, 360, 1280, 80);
  };

  // ---------- stone walls ----------
  function drawStone(ctx, rnd, x, y, w, h) {
    const j = () => (rnd() - 0.5) * 7;
    ctx.beginPath();
    ctx.moveTo(x + 10 + j(), y + j());
    ctx.lineTo(x + w - 10 + j(), y + j());
    ctx.quadraticCurveTo(x + w, y, x + w + j(), y + 10);
    ctx.lineTo(x + w + j(), y + h - 10);
    ctx.quadraticCurveTo(x + w, y + h, x + w - 10, y + h + j());
    ctx.lineTo(x + 10 + j(), y + h + j());
    ctx.quadraticCurveTo(x, y + h, x + j(), y + h - 10);
    ctx.lineTo(x + j(), y + 10);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    const base = OP.shade('#dcc8a4', (rnd() - 0.5) * 0.18);
    g.addColorStop(0, OP.shade(base, 0.12));
    g.addColorStop(1, OP.shade(base, -0.12));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(95,68,40,.28)';
    for (let k = 0; k < 6; k++) ctx.fillRect(x + rnd() * w, y + rnd() * h, 4, 4);
    ctx.fillStyle = 'rgba(255,250,235,.35)';
    ctx.fillRect(x + 6, y + 4, w * 0.5, 3);
    ctx.restore();
    ctx.strokeStyle = '#5e4a34';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function stoneWall(ctx, rnd, side) {
    const left = side === 'left';
    const edge = [];
    for (let y = -20; y <= 740; y += 40) edge.push([(left ? 296 : 1044) + (rnd() - 0.5) * 24, y]);
    const outline = () => {
      ctx.beginPath();
      ctx.moveTo(left ? -20 : 1300, -20);
      edge.forEach((p) => ctx.lineTo(p[0], p[1]));
      ctx.lineTo(left ? -20 : 1300, 740);
      ctx.closePath();
    };
    ctx.save();
    outline();
    ctx.shadowColor = 'rgba(0,0,0,.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = left ? 12 : -12;
    ctx.fillStyle = '#8f7658';
    ctx.fill();
    ctx.restore();
    ctx.save();
    outline();
    ctx.clip();
    ctx.fillStyle = '#8a7152';
    ctx.fillRect(-20, -20, 1320, 760);
    let y = -24;
    let row = 0;
    while (y < 740) {
      const h = 50 + rnd() * 16;
      let x = (left ? -50 : 990) + (row % 2) * 34;
      const xEnd = left ? 340 : 1300;
      while (x < xEnd) {
        const w = 66 + rnd() * 50;
        drawStone(ctx, rnd, x + 3, y + 3, w - 6, h - 6);
        x += w;
      }
      y += h;
      row++;
    }
    const inner = ctx.createLinearGradient(left ? 300 : 1040, 0, left ? 180 : 1160, 0);
    inner.addColorStop(0, 'rgba(30,15,5,.28)');
    inner.addColorStop(1, 'rgba(30,15,5,0)');
    ctx.fillStyle = inner;
    ctx.fillRect(-20, -20, 1320, 760);
    ctx.restore();
    ctx.beginPath();
    edge.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]));
    ctx.strokeStyle = OUT();
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function leaf(ctx, x, y, rot, shade) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, -9, 0, -20);
    ctx.quadraticCurveTo(-10, -9, 0, 0);
    OP.fs(ctx, shade > 0.5 ? '#6fae4f' : '#4f8f3a', OUT(), 2);
    ctx.restore();
  }
  function ivy(ctx, rnd, x0, y0, len, dir) {
    let x = x0;
    let y = y0;
    const pts = [];
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < len; i++) {
      x += dir * (2 + rnd() * 5);
      y += 11 + rnd() * 6;
      const px = x + Math.sin(i * 1.3) * 7;
      ctx.lineTo(px, y);
      pts.push([px, y]);
    }
    ctx.strokeStyle = '#3f6a2c';
    ctx.lineWidth = 3;
    ctx.stroke();
    for (const [px, py] of pts) for (const k of [-1, 1]) leaf(ctx, px + k * 7, py + rnd() * 6, k * 0.9 + (rnd() - 0.5) * 0.8, rnd());
  }

  OP.drawWallsLayer = (ctx) => {
    const rnd = OP.mulberry32(21);
    stoneWall(ctx, rnd, 'left');
    stoneWall(ctx, rnd, 'right');

    // Oscar's kitchen doorway
    const dx = 105;
    const door = () => {
      ctx.beginPath();
      ctx.moveTo(18, 640);
      ctx.lineTo(18, 282);
      ctx.arc(dx, 282, 87, Math.PI, 0);
      ctx.lineTo(192, 640);
      ctx.closePath();
    };
    door();
    ctx.lineWidth = 32;
    ctx.strokeStyle = OUT();
    ctx.stroke();
    ctx.lineWidth = 24;
    ctx.strokeStyle = '#c9b28b';
    ctx.stroke();
    door();
    const g = ctx.createLinearGradient(0, 200, 0, 640);
    g.addColorStop(0, '#5a3a22');
    g.addColorStop(1, '#1d110a');
    ctx.fillStyle = g;
    ctx.fill();
    for (let a = Math.PI; a <= Math.PI * 2 + 0.01; a += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(dx + Math.cos(a) * 75, 282 + Math.sin(a) * 75);
      ctx.lineTo(dx + Math.cos(a) * 99, 282 + Math.sin(a) * 99);
      ctx.strokeStyle = '#6b5439';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.save();
    door();
    ctx.clip();
    const lg = ctx.createRadialGradient(dx, 330, 10, dx, 330, 160);
    lg.addColorStop(0, 'rgba(255,175,90,.5)');
    lg.addColorStop(1, 'rgba(255,175,90,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(18, 190, 174, 450);
    // copper pans hanging inside
    ctx.strokeStyle = '#1d110a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 232);
    ctx.lineTo(180, 232);
    ctx.stroke();
    for (const [px, r] of [[48, 20], [160, 16]]) {
      OP.rr(ctx, px - 3, 232, 6, 26, 3);
      OP.fs(ctx, '#8c5427', OUT(), 2);
      OP.ell(ctx, px, 272, r, r);
      OP.fs(ctx, '#c77a3e', OUT(), 2.5);
      OP.ell(ctx, px - r * 0.3, 266, r * 0.35, r * 0.2, -0.5);
      ctx.fillStyle = 'rgba(255,220,170,.5)';
      ctx.fill();
    }
    ctx.restore();

    ivy(ctx, rnd, 292, -10, 14, -1);
    ivy(ctx, rnd, 1050, -10, 13, 1);

    // chalkboard menu on the right wall
    const bx = 1068;
    const by = 116;
    OP.rr(ctx, bx, by, 132, 94, 10);
    OP.fs(ctx, '#8b5a2b', OUT(), 4);
    OP.rr(ctx, bx + 9, by + 9, 114, 76, 6);
    OP.fs(ctx, '#2f3b36', null);
    OP.text(ctx, 'תפריט', bx + 66, by + 24, { size: 19, color: '#f5f0e0' });
    OP.drawCroissant(ctx, bx + 66, by + 50, 0.34, { state: 'baked', noShadow: true });
    OP.text(ctx, 'חם מהתנור!', bx + 66, by + 73, { size: 15, color: '#f7b3c2', weight: 700 });
  };

  // ---------- counter ----------
  function veins(ctx, rnd, x0, y0, x1, y1, n) {
    for (let k = 0; k < n; k++) {
      let x = x0 + rnd() * (x1 - x0);
      let y = y0 + rnd() * (y1 - y0);
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 6; s++) {
        const nx = x + 30 + rnd() * 70;
        const ny = y + (rnd() - 0.5) * 36;
        ctx.quadraticCurveTo((x + nx) / 2 + (rnd() - 0.5) * 24, (y + ny) / 2 + (rnd() - 0.5) * 24, nx, ny);
        x = nx;
        y = ny;
      }
      ctx.strokeStyle = `rgba(120,112,104,${0.1 + rnd() * 0.18})`;
      ctx.lineWidth = 1 + rnd() * 2.5;
      ctx.stroke();
    }
  }

  OP.drawCounterLayer = (ctx) => {
    const rnd = OP.mulberry32(99);
    ctx.fillStyle = '#7d4a28';
    ctx.fillRect(0, 630, 1280, 90);
    for (let y = 630, r = 0; y < 720; y += 22, r++) {
      ctx.fillStyle = r % 2 ? '#9a5f35' : '#8a522c';
      ctx.fillRect(0, y, 1280, 20);
      ctx.fillStyle = '#5a3218';
      ctx.fillRect(0, y + 20, 1280, 2);
      for (let x = (r % 2) * 90 - 40; x < 1280; x += 150 + rnd() * 60) ctx.fillRect(x, y, 3, 20);
      ctx.fillStyle = 'rgba(255,220,170,.12)';
      ctx.fillRect(0, y + 2, 1280, 3);
    }

    // marble serving ledge with brass edge
    OP.rr(ctx, 382, 388, 716, 40, 6);
    OP.fs(ctx, '#c9953c', OUT(), 4);
    ctx.fillStyle = 'rgba(255,240,190,.55)';
    ctx.fillRect(388, 414, 704, 3);
    OP.rr(ctx, 382, 388, 716, 24, 6);
    const lg = ctx.createLinearGradient(0, 388, 0, 412);
    lg.addColorStop(0, '#fcf8f2');
    lg.addColorStop(1, '#e8dfd2');
    OP.fs(ctx, lg, OUT(), 3);
    ctx.save();
    OP.rr(ctx, 382, 388, 716, 24, 6);
    ctx.clip();
    veins(ctx, rnd, 382, 388, 1090, 412, 8);
    ctx.restore();

    const top = (dy) => {
      ctx.beginPath();
      ctx.moveTo(1300, 424 + dy);
      ctx.lineTo(238, 424 + dy);
      ctx.quadraticCurveTo(166, 424 + dy, 166, 482 + dy);
      ctx.lineTo(166, 598 + dy);
      ctx.quadraticCurveTo(166, 652 + dy, 232, 652 + dy);
      ctx.lineTo(1300, 652 + dy);
      ctx.closePath();
    };
    // cabinet front
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.4)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    top(36);
    OP.fs(ctx, '#244a40', OUT(), 4);
    ctx.restore();
    top(36);
    const cg = ctx.createLinearGradient(0, 652, 0, 690);
    cg.addColorStop(0, '#2f5d50');
    cg.addColorStop(1, '#1f3f36');
    OP.fs(ctx, cg, OUT(), 4);
    ctx.strokeStyle = 'rgba(150,210,190,.18)';
    ctx.lineWidth = 2;
    for (let x = 300; x < 1280; x += 170) {
      ctx.beginPath();
      ctx.moveTo(x, 660);
      ctx.lineTo(x, 684);
      ctx.stroke();
      OP.ell(ctx, x + 85, 672, 4.5, 4.5);
      OP.fs(ctx, '#d6a84a', OUT(), 1.5);
    }
    // marble work surface
    top(0);
    const mg = ctx.createLinearGradient(0, 424, 0, 652);
    mg.addColorStop(0, '#f8f4ee');
    mg.addColorStop(1, '#e6ddd0');
    OP.fs(ctx, mg, OUT(), 4);
    ctx.save();
    top(0);
    ctx.clip();
    veins(ctx, rnd, 150, 430, 1280, 650, 34);
    ctx.fillStyle = 'rgba(30,20,10,.16)';
    ctx.fillRect(150, 424, 1150, 12);
    const refl = ctx.createLinearGradient(0, 440, 0, 520);
    refl.addColorStop(0, 'rgba(255,255,255,.35)');
    refl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = refl;
    ctx.fillRect(150, 436, 1150, 84);
    ctx.restore();
    // brass trim along the front edge
    ctx.beginPath();
    ctx.moveTo(166, 560);
    ctx.lineTo(166, 598);
    ctx.quadraticCurveTo(166, 652, 232, 652);
    ctx.lineTo(1300, 652);
    ctx.strokeStyle = OUT();
    ctx.lineWidth = 11;
    ctx.stroke();
    ctx.strokeStyle = '#d6a84a';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,190,.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  // ---------- light layers ----------
  OP.drawShadeLayer = (ctx) => {
    const v = ctx.createRadialGradient(640, 380, 300, 640, 380, 860);
    v.addColorStop(0, 'rgba(30,14,4,0)');
    v.addColorStop(1, 'rgba(30,14,4,.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 1280, 720);
    const tg = ctx.createLinearGradient(0, 0, 0, 110);
    tg.addColorStop(0, 'rgba(30,14,4,.2)');
    tg.addColorStop(1, 'rgba(30,14,4,0)');
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, 1280, 110);
  };

  OP.drawGlowLayer = (ctx) => {
    for (const x of OP.LAMPS) {
      const cone = ctx.createLinearGradient(0, 146, 0, 620);
      cone.addColorStop(0, 'rgba(255,205,130,.2)');
      cone.addColorStop(1, 'rgba(255,205,130,0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(x - 26, 146);
      ctx.lineTo(x + 26, 146);
      ctx.lineTo(x + 190, 620);
      ctx.lineTo(x - 190, 620);
      ctx.closePath();
      ctx.fill();
      const halo = ctx.createRadialGradient(x, 146, 2, x, 146, 80);
      halo.addColorStop(0, 'rgba(255,230,170,.75)');
      halo.addColorStop(1, 'rgba(255,210,140,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(x - 80, 66, 160, 160);
    }
    for (let i = 0; i < 20; i++) {
      const bx = 242 + i * 44;
      const h = ctx.createRadialGradient(bx, 80, 1, bx, 80, 22);
      h.addColorStop(0, 'rgba(255,225,150,.55)');
      h.addColorStop(1, 'rgba(255,225,150,0)');
      ctx.fillStyle = h;
      ctx.fillRect(bx - 22, 58, 44, 44);
    }
    const win = ctx.createRadialGradient(640, 210, 20, 640, 240, 360);
    win.addColorStop(0, 'rgba(255,170,120,.18)');
    win.addColorStop(1, 'rgba(255,170,120,0)');
    ctx.fillStyle = win;
    ctx.fillRect(280, 0, 720, 600);
    const ov = ctx.createRadialGradient(294, 300, 20, 294, 320, 210);
    ov.addColorStop(0, 'rgba(255,140,50,.2)');
    ov.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = ov;
    ctx.fillRect(80, 90, 430, 460);
    const door = ctx.createRadialGradient(105, 420, 20, 105, 420, 200);
    door.addColorStop(0, 'rgba(255,170,90,.12)');
    door.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = door;
    ctx.fillRect(0, 220, 320, 400);
  };
})();
