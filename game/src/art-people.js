// הפיטסרי של אוסקר — customers, Oscar, order tickets
var OP = globalThis.OP || (globalThis.OP = {});

function hairTop(ctx, x, y, hw, hh, color) {
  ctx.beginPath();
  ctx.moveTo(x - hw * 1.04, y - hh * 0.05);
  ctx.bezierCurveTo(x - hw * 1.15, y - hh * 1.25, x + hw * 1.15, y - hh * 1.25, x + hw * 1.04, y - hh * 0.05);
  ctx.lineTo(x + hw * 0.9, y - hh * 0.3);
  for (let i = 4; i >= 0; i--) {
    const fx = x - hw * 0.9 + (i / 4) * hw * 1.8;
    ctx.quadraticCurveTo(fx + hw * 0.22, y - hh * 0.62, fx, y - hh * 0.38);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(0, y - hh, 0, y);
  g.addColorStop(0, OP.shade(color, 0.18));
  g.addColorStop(1, color);
  OP.fs(ctx, g, OP.OUT, 3);
  ctx.beginPath();
  ctx.moveTo(x - hw * 0.5, y - hh * 0.78);
  ctx.quadraticCurveTo(x - hw * 0.1, y - hh * 0.95, x + hw * 0.3, y - hh * 0.82);
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawHairBack(ctx, L, x, y, hw, hh) {
  const dark = OP.shade(L.hair, -0.15);
  if (L.style === 'bob') {
    OP.rr(ctx, x - hw * 1.15, y - hh * 0.9, hw * 2.3, hh * 1.55, hw * 0.7);
    OP.fs(ctx, dark, OP.OUT, 3);
  } else if (L.style === 'long') {
    OP.rr(ctx, x - hw * 1.2, y - hh * 0.9, hw * 2.4, hh * 2.3, hw * 0.8);
    OP.fs(ctx, dark, OP.OUT, 3);
  } else if (L.style === 'pony') {
    OP.ell(ctx, x + hw * 1.15, y + hh * 0.2, hw * 0.35, hh * 0.75, -0.35);
    OP.fs(ctx, dark, OP.OUT, 3);
  } else if (L.style === 'hood') {
    OP.ell(ctx, x, y - 2, hw * 1.45, hh * 1.3);
    OP.fs(ctx, OP.shade(L.shirt, -0.12), OP.OUT, 3.5);
  }
}

function drawHairFront(ctx, L, x, y, hw, hh) {
  switch (L.style) {
    case 'short':
    case 'bob':
    case 'long':
    case 'pony':
      hairTop(ctx, x, y, hw, hh, L.hair);
      break;
    case 'bun':
      OP.ell(ctx, x, y - hh * 1.12, hw * 0.45, hh * 0.35);
      OP.fs(ctx, L.hair, OP.OUT, 3);
      hairTop(ctx, x, y, hw, hh, L.hair);
      break;
    case 'curly':
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        OP.ell(ctx, x + Math.cos(a) * hw * 0.95, y - hh * 0.15 + Math.sin(a) * hh * 0.95, hw * 0.34, hw * 0.34);
        OP.fs(ctx, i % 2 ? L.hair : OP.shade(L.hair, 0.12), OP.OUT, 3);
      }
      break;
    case 'spiky': {
      ctx.beginPath();
      ctx.moveTo(x - hw, y - hh * 0.25);
      for (let i = 0; i <= 6; i++) {
        const sx = x - hw + (i / 6) * hw * 2;
        ctx.lineTo(sx - hw * 0.12, y - hh * (1.05 + (i % 2) * 0.3));
        ctx.lineTo(sx + hw * 0.15, y - hh * 0.55);
      }
      ctx.lineTo(x + hw, y - hh * 0.25);
      ctx.closePath();
      OP.fs(ctx, L.hair, OP.OUT, 3);
      break;
    }
    case 'bald':
      OP.ell(ctx, x - hw * 0.95, y - hh * 0.2, hw * 0.2, hh * 0.25);
      OP.fs(ctx, L.hair, OP.OUT, 2.5);
      OP.ell(ctx, x + hw * 0.95, y - hh * 0.2, hw * 0.2, hh * 0.25);
      OP.fs(ctx, L.hair, OP.OUT, 2.5);
      OP.ell(ctx, x - hw * 0.3, y - hh * 0.7, hw * 0.25, hh * 0.1, -0.4);
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.fill();
      break;
    case 'cap': {
      const cc = L.capColor || (L.shirt === '#58b368' ? '#e5534b' : '#58b368');
      ctx.beginPath();
      ctx.moveTo(x - hw * 1.05, y - hh * 0.3);
      ctx.bezierCurveTo(x - hw, y - hh * 1.3, x + hw, y - hh * 1.3, x + hw * 1.05, y - hh * 0.3);
      ctx.closePath();
      OP.fs(ctx, cc, OP.OUT, 3);
      OP.rr(ctx, x - hw * 0.2, y - hh * 0.46, hw * 1.7, hh * 0.18, 6);
      OP.fs(ctx, OP.shade(cc, -0.2), OP.OUT, 3);
      break;
    }
    case 'fedora':
      OP.ell(ctx, x, y - hh * 0.55, hw * 1.45, hh * 0.2);
      OP.fs(ctx, '#5f5a4e', OP.OUT, 3);
      OP.rr(ctx, x - hw * 0.8, y - hh * 1.3, hw * 1.6, hh * 0.8, 12);
      OP.fs(ctx, '#6f6a5c', OP.OUT, 3);
      ctx.fillStyle = '#3b352c';
      ctx.fillRect(x - hw * 0.8, y - hh * 0.72, hw * 1.6, 8);
      break;
    case 'hood':
      ctx.beginPath();
      ctx.arc(x, y - 2, hw * 1.25, Math.PI * 1.05, Math.PI * 1.95);
      ctx.strokeStyle = OP.shade(L.shirt, -0.3);
      ctx.lineWidth = 6;
      ctx.stroke();
      break;
  }
}

function drawFace(ctx, c, x, y, hw, hh, t) {
  const L = c.look;
  const mood = c.mood;
  const blink = (t + c.id * 0.77) % 3.7 < 0.12;
  const eg = L.eyeGap;
  if (L.blush || mood === 'happy') {
    for (const k of [-1, 1]) {
      OP.ell(ctx, x + k * (eg + 9), y + 12, 7, 4.5);
      ctx.fillStyle = 'rgba(240,110,120,.38)';
      ctx.fill();
    }
  }
  const joy = mood === 'happy' && (c.state === 'paid' || c.bounce > 0);
  if (L.shades) {
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 4);
    ctx.lineTo(x + 6, y - 4);
    ctx.strokeStyle = OP.OUT;
    ctx.lineWidth = 3;
    ctx.stroke();
    for (const k of [-1, 1]) {
      OP.rr(ctx, x + k * eg - 11, y - 10, 22, 15, 6);
      OP.fs(ctx, '#1d1d24', c.type === 'vip' ? '#e8b400' : OP.OUT, 3);
      OP.ell(ctx, x + k * eg - 4, y - 6, 4, 2, -0.3);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.fill();
    }
  } else {
    for (const k of [-1, 1]) {
      const ex = x + k * eg;
      if (blink || joy) {
        ctx.beginPath();
        if (joy) {
          ctx.moveTo(ex - 6, y);
          ctx.quadraticCurveTo(ex, y - 8, ex + 6, y);
        } else {
          ctx.moveTo(ex - 6, y - 2);
          ctx.quadraticCurveTo(ex, y + 2, ex + 6, y - 2);
        }
        ctx.strokeStyle = OP.OUT;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        OP.ell(ctx, ex, y - 2, 6.5, 7.5);
        OP.fs(ctx, '#fff', OP.OUT, 2.5);
        const look = c.lookX != null ? OP.clamp((c.lookX - c.x) / 60, -2.5, 2.5) : c.state === 'waiting' ? 0 : c.leaveDir || c.fleeDir || 0;
        const lookY = c.state === 'waiting' ? 1.5 : 0;
        OP.ell(ctx, ex + look, y + lookY - 1, 3.5, 4);
        ctx.fillStyle = '#24160e';
        ctx.fill();
        OP.ell(ctx, ex + look - 1.2, y + lookY - 2.5, 1.2, 1.2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    }
    if (L.glasses) {
      for (const k of [-1, 1]) {
        OP.ell(ctx, x + k * eg, y - 2, 10.5, 10.5);
        ctx.strokeStyle = OP.OUT;
        ctx.lineWidth = 2.8;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x - eg + 10, y - 3);
      ctx.lineTo(x + eg - 10, y - 3);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = L.style === 'bald' || L.style === 'hood' ? OP.OUT : OP.shade(L.hair, -0.3);
  ctx.lineWidth = 3.5;
  for (const k of [-1, 1]) {
    const bx = x + k * eg;
    ctx.beginPath();
    if (mood === 'angry') {
      ctx.moveTo(bx - k * 8, y - 19);
      ctx.lineTo(bx + k * 7, y - 12);
    } else if (mood === 'worried' || mood === 'gross') {
      ctx.moveTo(bx - k * 8, y - 13);
      ctx.lineTo(bx + k * 7, y - 18);
    } else {
      ctx.moveTo(bx - 7, y - 14 - (joy ? 3 : 0));
      ctx.quadraticCurveTo(bx, y - 20 - (joy ? 3 : 0), bx + 7, y - 14 - (joy ? 3 : 0));
    }
    ctx.stroke();
  }
  OP.ell(ctx, x + 1, y + 9, 5, 6);
  OP.fs(ctx, OP.shade(L.skin, -0.25), null);
  ctx.beginPath();
  ctx.arc(x + 1, y + 9, 5, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = OP.OUT;
  ctx.lineWidth = 2;
  ctx.stroke();
  if (L.freckles) {
    ctx.fillStyle = 'rgba(160,90,50,.55)';
    for (const k of [-1, 1]) {
      for (const [fx, fy] of [[0, 0], [6, 3], [-5, 4], [2, 7]]) {
        OP.ell(ctx, x + k * (eg + 6) + fx, y + 8 + fy, 1.6, 1.6);
        ctx.fill();
      }
    }
  }
  const my = y + 22;
  ctx.lineWidth = 3;
  ctx.strokeStyle = OP.OUT;
  ctx.beginPath();
  if (mood === 'happy') {
    const open = joy ? 6 : 0;
    ctx.moveTo(x - 10, my - 2);
    ctx.quadraticCurveTo(x, my + 10 + open, x + 10, my - 2);
    ctx.closePath();
    OP.fs(ctx, '#9c2f2a', OP.OUT, 2.5);
    if (joy) {
      OP.ell(ctx, x, my + 5, 4, 2.5);
      ctx.fillStyle = '#ff8a8a';
      ctx.fill();
    }
  } else if (mood === 'angry') {
    ctx.moveTo(x - 10, my + 5);
    ctx.quadraticCurveTo(x, my - 6, x + 10, my + 5);
    ctx.stroke();
  } else if (mood === 'gross') {
    ctx.moveTo(x - 10, my);
    for (let i = 1; i <= 4; i++) ctx.lineTo(x - 10 + i * 5, my + (i % 2 ? -3 : 3));
    ctx.strokeStyle = '#4c8a2e';
    ctx.stroke();
  } else {
    ctx.moveTo(x - 7, my + 1);
    ctx.quadraticCurveTo(x, my - 2, x + 7, my + 2);
    ctx.stroke();
  }
  if (L.mustache) {
    ctx.beginPath();
    ctx.moveTo(x, my - 6);
    ctx.bezierCurveTo(x - 8, my - 10, x - 18, my - 6, x - 17, my + 1);
    ctx.bezierCurveTo(x - 10, my - 2, x - 5, my - 2, x, my - 3);
    ctx.bezierCurveTo(x + 5, my - 2, x + 10, my - 2, x + 17, my + 1);
    ctx.bezierCurveTo(x + 18, my - 6, x + 8, my - 10, x, my - 6);
    OP.fs(ctx, OP.shade(L.hair, -0.1), OP.OUT, 2.5);
  }
  if (L.stubble) {
    ctx.fillStyle = 'rgba(40,30,25,.45)';
    for (let i = 0; i < 14; i++) ctx.fillRect(x - 16 + ((i * 7) % 32), y + 26 + ((i * 5) % 12), 2.5, 2.5);
  }
  if (mood === 'angry' || mood === 'gross') {
    OP.ell(ctx, x, y, hw, hh);
    ctx.fillStyle = mood === 'angry' ? 'rgba(230,40,20,.2)' : 'rgba(90,170,50,.22)';
    ctx.fill();
  }
}

OP.customerPose = (c, t) => {
  const walking = c.state === 'arriving' || c.state === 'leaving' || c.state === 'fleeing';
  const bob = walking ? -Math.abs(Math.sin(c.walk * 9)) * 9 : Math.sin(t * 2 + c.id) * 1.5;
  const hop = c.bounce > 0 ? -Math.sin((c.bounce / 0.4) * Math.PI) * 14 : 0;
  const cheer = c.state === 'paid' && c.mood === 'happy' ? -Math.abs(Math.sin(c.stateT * 12)) * 10 * Math.max(0, 1 - c.stateT) : 0;
  const sh = c.shake > 0 ? Math.sin(c.shake * 60) * 6 : 0;
  return { x: c.x + sh, y: 290 + bob + hop + cheer };
};

OP.drawCustomer = (ctx, c, t) => {
  const L = c.look;
  const { x, y } = OP.customerPose(c, t);
  const hw = L.headW;
  const hh = L.headH;
  const bw = L.bodyW;
  OP.softShadow(ctx, x + 16, y + 60, 72, 96, 0.2);
  ctx.save();
  if (c.state === 'fleeing') {
    ctx.translate(x, 400);
    ctx.rotate(c.fleeDir * 0.18);
    ctx.translate(-x, -400);
  }
  if (L.scale && L.scale !== 1) {
    // grow from the counter line so he stands taller than everyone else
    ctx.translate(x, 450);
    ctx.scale(L.scale, L.scale);
    ctx.translate(-x, -450);
  }
  const nw = L.big ? 34 : 18;
  OP.rr(ctx, x - nw / 2, y + 26, nw, 24, 6);
  OP.fs(ctx, OP.shade(L.skin, -0.12), OP.OUT, 3);
  ctx.beginPath();
  ctx.moveTo(x - bw / 2, 450);
  ctx.lineTo(x - bw / 2, y + 76);
  ctx.quadraticCurveTo(x - bw / 2, y + 46, x - bw / 2 + 24, y + 44);
  ctx.lineTo(x + bw / 2 - 24, y + 44);
  ctx.quadraticCurveTo(x + bw / 2, y + 46, x + bw / 2, y + 76);
  ctx.lineTo(x + bw / 2, 450);
  ctx.closePath();
  const sg = ctx.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
  sg.addColorStop(0, OP.shade(L.shirt, 0.12));
  sg.addColorStop(0.6, L.shirt);
  sg.addColorStop(1, OP.shade(L.shirt, -0.2));
  OP.fs(ctx, sg, OP.OUT, 3.5);
  if (L.stripes) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - bw / 2, 450);
    ctx.lineTo(x - bw / 2, y + 76);
    ctx.quadraticCurveTo(x - bw / 2, y + 46, x - bw / 2 + 24, y + 44);
    ctx.lineTo(x + bw / 2 - 24, y + 44);
    ctx.quadraticCurveTo(x + bw / 2, y + 46, x + bw / 2, y + 76);
    ctx.lineTo(x + bw / 2, 450);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = L.stripes;
    for (let sy = y + 56; sy < 450; sy += 20) ctx.fillRect(x - bw / 2, sy, bw, 9);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(x - bw / 2, 450);
    ctx.lineTo(x - bw / 2, y + 76);
    ctx.quadraticCurveTo(x - bw / 2, y + 46, x - bw / 2 + 24, y + 44);
    ctx.lineTo(x + bw / 2 - 24, y + 44);
    ctx.quadraticCurveTo(x + bw / 2, y + 46, x + bw / 2, y + 76);
    ctx.lineTo(x + bw / 2, 450);
    ctx.strokeStyle = OP.OUT;
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }
  if (L.suit) {
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 44);
    ctx.lineTo(x, y + 88);
    ctx.lineTo(x + 14, y + 44);
    ctx.closePath();
    OP.fs(ctx, '#fff', OP.OUT, 2.5);
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 50);
    ctx.lineTo(x + 10, y + 60);
    ctx.lineTo(x + 10, y + 50);
    ctx.lineTo(x - 10, y + 60);
    ctx.closePath();
    OP.fs(ctx, L.bow, OP.OUT, 2.5);
  } else if (L.coat) {
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + k * 6, y + 44);
      ctx.lineTo(x + k * 24, y + 44);
      ctx.lineTo(x + k * 4, y + 96);
      ctx.closePath();
      OP.fs(ctx, OP.shade(L.shirt, -0.15), OP.OUT, 2.5);
    }
  } else if (L.polo) {
    // polo collar with a colored trim, and a short button placket
    OP.rr(ctx, x - 5, y + 50, 10, 30, 3);
    OP.fs(ctx, OP.shade(L.shirt, 0.08), OP.OUT, 2);
    for (const by of [58, 71]) {
      OP.ell(ctx, x, y + by, 2.2, 2.2);
      ctx.fillStyle = '#8a8a92';
      ctx.fill();
    }
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + k * 3, y + 48);
      ctx.lineTo(x + k * 27, y + 40);
      ctx.lineTo(x + k * 19, y + 62);
      ctx.closePath();
      OP.fs(ctx, OP.shade(L.shirt, 0.16), OP.OUT, 2.5);
      ctx.beginPath();
      ctx.moveTo(x + k * 23, y + 44);
      ctx.lineTo(x + k * 17, y + 57);
      ctx.strokeStyle = L.polo;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  } else if (L.hood) {
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + k * 10, y + 46);
      ctx.lineTo(x + k * 12, y + 84);
      ctx.strokeStyle = '#d9d9d9';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 44);
    ctx.quadraticCurveTo(x, y + 62, x + 12, y + 44);
    ctx.strokeStyle = OP.OUT;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  if (L.big) {
    // round belly resting on the counter, with a croissant print
    OP.ell(ctx, x, y + 112, bw * 0.52, 66);
    const bg = ctx.createRadialGradient(x - bw * 0.16, y + 80, 6, x, y + 112, bw * 0.55);
    bg.addColorStop(0, OP.shade(L.shirt, 0.16));
    bg.addColorStop(1, OP.shade(L.shirt, -0.14));
    OP.fs(ctx, bg, OP.OUT, 3.5);
    OP.drawCroissant(ctx, x, y + 86, 0.36, { state: 'baked', toppings: [], noShadow: true });
  }
  if (c.type === 'binyamin' && c.state === 'waiting') {
    // throwing arm, winding up over and over, with the next candy in hand
    const sw = Math.sin(t * 8 + c.id);
    const sx = x - bw / 2 + 12;
    const sy = y + 58;
    const a1 = -2.5 + sw * 0.2;
    const a2 = -1.9 + sw * 0.6;
    const ex = sx + Math.cos(a1) * 34;
    const ey = sy + Math.sin(a1) * 34;
    const hx = ex + Math.cos(a2) * 30;
    const hy = ey + Math.sin(a2) * 30;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.lineTo(hx, hy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = OP.OUT;
    ctx.lineWidth = 19;
    ctx.stroke();
    ctx.strokeStyle = L.skin;
    ctx.lineWidth = 13;
    ctx.stroke();
    // short sleeve with the polo's colored trim
    const at = (f) => [sx + (ex - sx) * f, sy + (ey - sy) * f];
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(...at(0.58));
    ctx.strokeStyle = OP.OUT;
    ctx.lineWidth = 27;
    ctx.stroke();
    ctx.strokeStyle = L.shirt;
    ctx.lineWidth = 21;
    ctx.stroke();
    if (L.polo) {
      ctx.beginPath();
      ctx.moveTo(...at(0.5));
      ctx.lineTo(...at(0.57));
      ctx.strokeStyle = L.polo;
      ctx.lineWidth = 21;
      ctx.stroke();
    }
    ctx.lineCap = 'round';
    if (sw < 0.6) OP.drawCandy(ctx, hx - 4, hy - 12, 1, 'wrap', '#ff5fa2', sw);
    OP.ell(ctx, hx, hy, 9, 9);
    OP.fs(ctx, L.skin, OP.OUT, 2.5);
  }
  drawHairBack(ctx, L, x, y, hw, hh);
  for (const k of [-1, 1]) {
    OP.ell(ctx, x + k * hw * 0.98, y + 4, 7, 10);
    OP.fs(ctx, L.skin, OP.OUT, 3);
    if (L.earrings) {
      OP.ell(ctx, x + k * hw * 0.98, y + 17, 3.5, 3.5);
      OP.fs(ctx, '#ffd23a', OP.OUT, 1.5);
    }
  }
  if (L.big) {
    // double chin peeking out under the round face
    OP.ell(ctx, x, y + hh * 0.72, hw * 0.78, hh * 0.46);
    OP.fs(ctx, OP.shade(L.skin, -0.06), OP.OUT, 3.5);
  }
  OP.ell(ctx, x, y, hw, hh);
  const hg = ctx.createRadialGradient(x - hw * 0.35, y - hh * 0.4, 4, x, y, hh * 1.1);
  hg.addColorStop(0, OP.shade(L.skin, 0.14));
  hg.addColorStop(1, OP.shade(L.skin, -0.08));
  OP.fs(ctx, hg, OP.OUT, 3.5);
  if (L.big) {
    ctx.beginPath();
    ctx.arc(x, y + hh * 0.4, hw * 0.55, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.strokeStyle = 'rgba(59,35,20,.35)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  if (L.beard) {
    ctx.beginPath();
    ctx.moveTo(x - hw * 0.95, y + 4);
    ctx.quadraticCurveTo(x - hw * 0.8, y + hh * 1.15, x, y + hh * 1.12);
    ctx.quadraticCurveTo(x + hw * 0.8, y + hh * 1.15, x + hw * 0.95, y + 4);
    ctx.quadraticCurveTo(x, y + hh * 0.75, x - hw * 0.95, y + 4);
    OP.fs(ctx, L.hair, OP.OUT, 3);
  }
  drawFace(ctx, c, x, y, hw, hh, t);
  // a lollipop stuck in the corner of his mouth
  if (L.lolly) OP.drawCandy(ctx, x + 32, y + 22, 1.05, 'lolly', '#ff5fa2', 1.45 + Math.sin(t * 3 + c.id) * 0.08);
  drawHairFront(ctx, L, x, y, hw, hh);
  if (c.type === 'vip') {
    for (let k = 0; k < 3; k++) {
      const a = t * 1.5 + (k * Math.PI * 2) / 3;
      OP.icon(ctx, 'star', x + Math.cos(a) * (hw + 20), y - 10 + Math.sin(a) * (hh + 10), 16);
    }
  }
  if (c.mood === 'angry' && c.state === 'waiting') {
    for (let k = 0; k < 2; k++) {
      const ph = (t * 1.2 + k * 0.5) % 1;
      OP.ell(ctx, x + (k ? 20 : -20), y - hh - 10 - ph * 30, 7 + ph * 6, 6 + ph * 5);
      ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - ph)})`;
      ctx.fill();
    }
  }
  if (c.state === 'paid' && c.mood === 'happy' && c.stateT < 1) {
    for (let k = 0; k < 3; k++) {
      const ph = Math.min(1, c.stateT * 1.3 + k * 0.12);
      OP.icon(ctx, 'heart', x - 26 + k * 26, y - hh - 8 - ph * 40, 20 * (1 - ph * 0.4), { alpha: 1 - ph });
    }
  }
  if (c.state === 'caught') {
    for (let k = 0; k < 4; k++) {
      const a = t * 6 + (k * Math.PI) / 2;
      OP.icon(ctx, 'star', x + Math.cos(a) * 34, y - hh - 6 + Math.sin(a) * 8, 18);
    }
  }
  if (c.state === 'smirk') {
    OP.rr(ctx, x + 30, y - hh - 34, 30, 34, 10);
    OP.fs(ctx, '#fffdf6', OP.OUT, 3);
    OP.text(ctx, '!', x + 45, y - hh - 16, { size: 28, color: '#e0453a', dir: 'ltr' });
  }
  if (c.state === 'fleeing') {
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 4;
    for (let k = 0; k < 3; k++) {
      const lx = x - c.fleeDir * (bw / 2 + 14 + k * 6);
      ctx.beginPath();
      ctx.moveTo(lx, y + 10 + k * 22);
      ctx.lineTo(lx - c.fleeDir * (26 + ((t * 80 + k * 13) % 14)), y + 10 + k * 22);
      ctx.stroke();
    }
  }
  ctx.restore();
};

// Hands resting on the serving ledge, drawn in front of the counter.
OP.drawCustomerHands = (ctx, c, t) => {
  if (!['waiting', 'inspecting', 'paid', 'smirk'].includes(c.state)) return;
  const L = c.look;
  const { x } = OP.customerPose(c, t);
  const impatient = c.mood === 'worried' || c.mood === 'angry';
  // בנימין's left hand is busy throwing candy
  for (const k of c.type === 'binyamin' && c.state === 'waiting' ? [1] : [-1, 1]) {
    const tap = impatient && k > 0 ? Math.max(0, Math.sin(t * 14 + c.id)) * 5 : 0;
    const hx = x + k * L.bodyW * 0.36;
    const hy = 398 - tap;
    OP.rr(ctx, hx - 14, hy - 16, 28, 14, 6);
    OP.fs(ctx, L.suit ? '#fff' : L.polo ? L.skin : L.shirt, OP.OUT, 2.5);
    if (L.watch && k > 0) {
      OP.rr(ctx, hx - 14, hy - 12, 28, 7, 3);
      OP.fs(ctx, '#c9ced4', OP.OUT, 2);
      OP.ell(ctx, hx, hy - 8.5, 5, 5);
      OP.fs(ctx, '#eef1f4', OP.OUT, 2);
    }
    OP.ell(ctx, hx, hy, 13, 9);
    OP.fs(ctx, L.skin, OP.OUT, 2.5);
    ctx.strokeStyle = 'rgba(59,35,20,.55)';
    ctx.lineWidth = 1.6;
    for (const f of [-4, 1, 6]) {
      ctx.beginPath();
      ctx.moveTo(hx + f, hy + 2);
      ctx.lineTo(hx + f, hy + 7);
      ctx.stroke();
    }
  }
  if (c.type === 'inspector') {
    ctx.save();
    ctx.translate(x + 2, 380);
    ctx.rotate(-0.08);
    OP.icon(ctx, 'clipboard', 0, 0, 46);
    ctx.restore();
  }
};

// Name tag floating above a named customer; drawn after the order cards so nothing covers it.
OP.drawNameTag = (ctx, c, t) => {
  const L = c.look;
  if (!L.name || ['caught', 'gone'].includes(c.state)) return;
  const { x, y } = OP.customerPose(c, t);
  const ty = 450 - (450 - (y - L.headH - 34)) * (L.scale || 1) + Math.sin(t * 3 + c.id) * 1.5;
  ctx.save();
  ctx.translate(x, ty);
  ctx.rotate(Math.sin(t * 1.3 + c.id) * 0.04);
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(-8, 30);
  ctx.lineTo(8, 30);
  ctx.closePath();
  OP.fs(ctx, '#e0453a', OP.OUT, 3);
  OP.rr(ctx, -54, -21, 108, 42, 13);
  OP.fs(ctx, '#e0453a', OP.OUT, 3.5);
  OP.rr(ctx, -46, -13, 92, 26, 9);
  OP.fs(ctx, '#fffdf6', null);
  OP.rr(ctx, -44, -11, 88, 6, 3);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fill();
  OP.text(ctx, L.name, 0, 1, { size: L.name.length > 4 ? 22 : 24, color: OP.OUT });
  ctx.restore();
};

OP.orderCardRect = (c) => {
  if (c.type === 'dvir') {
    // his long order sits in two columns, clear of the nametag
    const rowH = 50;
    const h = Math.ceil(c.order.length / 2) * rowH + 36;
    return { x: c.x + 60, y: 242 - h, w: 160, h, cols: 2, rowH };
  }
  const rows = c.type === 'inspector' ? 1 : c.order.length;
  const w = 94;
  const h = c.type === 'inspector' ? 92 : rows * 52 + 36;
  // named customers wear a tag above the head, so their ticket moves clear of it
  return { x: c.x + (c.look && c.look.name ? 60 : 18), y: 242 - h, w, h };
};

OP.drawOrderCard = (ctx, c, t) => {
  if (c.state !== 'waiting' && c.state !== 'inspecting') return;
  const r = OP.orderCardRect(c);
  const pop = OP.easeOutBack(Math.min(1, c.stateT * 4));
  const p = OP.clamp(c.patience / c.patienceMax, 0, 1);
  const urgent = c.state === 'waiting' && p < 0.3;
  const sway = Math.sin(t * 1.6 + c.id) * 0.025 + (urgent ? Math.sin(t * 34) * 0.035 : 0);
  ctx.save();
  ctx.translate(r.x + r.w / 2, r.y);
  ctx.rotate(sway);
  ctx.scale(pop, pop);
  ctx.translate(-(r.x + r.w / 2), -r.y);
  const paper = () => {
    ctx.beginPath();
    ctx.moveTo(r.x + 10, r.y);
    ctx.lineTo(r.x + r.w - 10, r.y);
    ctx.quadraticCurveTo(r.x + r.w, r.y, r.x + r.w, r.y + 10);
    ctx.lineTo(r.x + r.w, r.y + r.h - 6);
    const teeth = 7;
    for (let i = 0; i < teeth; i++) {
      const tx = r.x + r.w - ((i + 0.5) * r.w) / teeth;
      ctx.lineTo(tx, r.y + r.h + 4);
      ctx.lineTo(r.x + r.w - ((i + 1) * r.w) / teeth, r.y + r.h - 6);
    }
    ctx.lineTo(r.x, r.y + 10);
    ctx.quadraticCurveTo(r.x, r.y, r.x + 10, r.y);
    ctx.closePath();
  };
  ctx.save();
  ctx.translate(4, 7);
  paper();
  ctx.fillStyle = 'rgba(30,15,5,.3)';
  ctx.fill();
  ctx.restore();
  paper();
  const pg = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  pg.addColorStop(0, '#fffef8');
  pg.addColorStop(1, '#f5ead6');
  OP.fs(ctx, pg, c.type === 'vip' ? '#d99a00' : OP.OUT, c.type === 'vip' ? 5 : 3);
  if (urgent) {
    paper();
    ctx.fillStyle = `rgba(255,70,50,${0.1 + Math.sin(t * 10) * 0.08})`;
    ctx.fill();
  }
  OP.ell(ctx, r.x + r.w / 2, r.y + 3, 7, 7);
  OP.fs(ctx, '#e0453a', OP.OUT, 2.5);
  OP.ell(ctx, r.x + r.w / 2 - 2, r.y + 1, 2.5, 2);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fill();
  if (c.type === 'inspector') {
    OP.icon(ctx, 'clipboard', r.x + r.w / 2, r.y + 44, 44);
    OP.progressRing(ctx, r.x + r.w / 2, r.y + 44, 30, 1 - c.inspectT / c.inspectMax, '#ff8a3a', 5);
    OP.text(ctx, 'בודק…', r.x + r.w / 2, r.y + 80, { size: 16, color: OP.OUT });
    ctx.restore();
    return;
  }
  OP.icon(ctx, p > 0.6 ? 'smile' : 'frown', r.x + 15, r.y + 21, 22);
  const bx = r.x + 29;
  const bwid = r.w - 38;
  OP.rr(ctx, bx, r.y + 15, bwid, 12, 6);
  OP.fs(ctx, '#3a2a20', OP.OUT, 2);
  if (!(urgent && Math.sin(t * 14) > 0.4)) {
    OP.rr(ctx, bx + 2, r.y + 17, Math.max(4, (bwid - 4) * p), 8, 4);
    const col = p > 0.6 ? '#5fd068' : p > 0.3 ? '#ffc93a' : '#ff4a3a';
    ctx.fillStyle = col;
    ctx.fill();
    OP.rr(ctx, bx + 4, r.y + 18, Math.max(0, (bwid - 8) * p), 2.5, 1);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fill();
  }
  const cols = r.cols || 1;
  const cw = r.w / cols;
  const rowH = r.rowH || 52;
  const sep = (x1, y1, x2, y2) => {
    ctx.strokeStyle = 'rgba(150,110,70,.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  if (cols > 1) sep(r.x + cw, r.y + 40, r.x + cw, r.y + r.h - 8);
  c.order.forEach((l, k) => {
    const col = k % cols;
    const lx = r.x + col * cw;
    const cy = r.y + 34 + Math.floor(k / cols) * rowH + 24;
    const cx = lx + cw / 2;
    if (k >= cols && col === 0) sep(r.x + 10, cy - rowH / 2, r.x + r.w - 10, cy - rowH / 2);
    if (l.kind === 'croissant') {
      OP.drawCroissant(ctx, cx, cy, cols > 1 ? 0.46 : 0.52, { state: 'baked', sliced: !!l.filling, filling: l.filling, spread: 1, toppings: l.toppings, noShadow: true });
      if (l.filling) OP.drawFillingBlob(ctx, lx + 13, cy - 16, 8, l.filling);
      l.toppings.forEach((tp, i) => {
        OP.ell(ctx, lx + cw - 13, cy - 15 + i * 20, 10, 10);
        OP.fs(ctx, '#fff', OP.OUT, 2);
        OP.drawToppingIcon(ctx, lx + cw - 13, cy - 14 + i * 20, 0.48, tp);
      });
    } else if (l.kind === 'juice') {
      OP.drawJuiceBox(ctx, cx, cy + 4, 0.8);
    } else {
      OP.drawCup(ctx, cx, cy + 6, 0.78, 1, true, t);
    }
    if (l.done) {
      OP.rr(ctx, lx + 5, cy - rowH / 2 + 2, cw - 10, rowH - 4, 8);
      ctx.fillStyle = 'rgba(255,255,255,.68)';
      ctx.fill();
      OP.icon(ctx, 'check', cx, cy, 36);
    }
  });
  if (c.type === 'vip') {
    OP.rr(ctx, r.x - 12, r.y - 12, 50, 24, 11);
    OP.fs(ctx, '#ffd23a', OP.OUT, 3);
    OP.iconText(ctx, 'star', 'VIP', r.x + 13, r.y, { size: 15, color: OP.OUT, iconSize: 16, dir: 'ltr' });
  }
  ctx.restore();
};

// Oscar's own colors, plus friend bakers who share his shape in multiplayer scenes.
const OSCAR_PAL = { stripe: '#2f5597', scarf: '#e0453a', hair: '#5a3a26', brow: '#6b6258', skin0: '#ffd8b8', skin1: '#eeb088', ear: '#f0b48c', hand: '#f6c29c', mustache: true };
OP.BAKER_PALS = [
  { stripe: '#c0392b', scarf: '#2f8a3e', hair: '#2a1b12', brow: '#2a1b12', skin0: '#e9b48a', skin1: '#c98a5e', ear: '#d49a70', hand: '#dba27a', mustache: false },
  { stripe: '#2f8a3e', scarf: '#f2b134', hair: '#c98a3b', brow: '#a86a2a', skin0: '#ffe0c8', skin1: '#f2bf98', ear: '#f0c0a0', hand: '#f6c9a6', mustache: true },
  { stripe: '#8e44ad', scarf: '#4a90d9', hair: '#1d1d24', brow: '#1d1d24', skin0: '#c98d62', skin1: '#9c6a44', ear: '#b07a52', hand: '#b88560', mustache: false },
  { stripe: '#e67e22', scarf: '#9b6bd3', hair: '#8f8f8f', brow: '#6b6258', skin0: '#ffd8b8', skin1: '#eeb088', ear: '#f0b48c', hand: '#f6c29c', mustache: true },
];
let PAL = OSCAR_PAL;

function oscarArm(ctx, sx, sy, a1, l1, a2, l2, hand, t) {
  const ex = sx + Math.cos(a1) * l1;
  const ey = sy + Math.sin(a1) * l1;
  const hx = ex + Math.cos(a2) * l2;
  const hy = ey + Math.sin(a2) * l2;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.lineTo(hx, hy);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = OP.OUT;
  ctx.lineWidth = 34;
  ctx.stroke();
  ctx.strokeStyle = '#fbfbfb';
  ctx.lineWidth = 26;
  ctx.stroke();
  ctx.strokeStyle = PAL.stripe;
  ctx.lineWidth = 6;
  ctx.setLineDash([6, 12]);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(hand === 'thumb' ? 0 : a2 + Math.PI / 2);
  if (hand === 'thumb') {
    OP.ell(ctx, 0, 4, 17, 15);
    OP.fs(ctx, PAL.hand, OP.OUT, 3);
    OP.rr(ctx, -6, -22, 12, 24, 6);
    OP.fs(ctx, PAL.hand, OP.OUT, 2.5);
  } else {
    OP.ell(ctx, 0, 0, 16, 18);
    OP.fs(ctx, PAL.hand, OP.OUT, 3);
    for (const f of [-9, -3, 3, 9]) {
      OP.rr(ctx, f - 3, -24, 6, 14, 3);
      OP.fs(ctx, PAL.hand, OP.OUT, 2);
    }
  }
  ctx.restore();
}

// Oscar the baker, leaning out of his doorway. o: talking, wave, mood ('happy'|'sad')
OP.drawOscar = (ctx, x, y, s, t, o = {}) => {
  PAL = o.pal || OSCAR_PAL;
  const mood = o.mood;
  const bob = Math.sin(t * 1.8) * 2 + (mood === 'happy' ? -Math.abs(Math.sin(t * 10)) * 6 : 0);
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(s, s);
  if (mood === 'sad') ctx.rotate(-0.04);
  const torso = () => {
    ctx.beginPath();
    ctx.moveTo(-62, 380);
    ctx.lineTo(-62, 100);
    ctx.quadraticCurveTo(-60, 56, -18, 50);
    ctx.lineTo(18, 50);
    ctx.quadraticCurveTo(60, 56, 62, 100);
    ctx.lineTo(62, 380);
    ctx.closePath();
  };
  torso();
  OP.fs(ctx, '#fbfbfb', null);
  ctx.save();
  torso();
  ctx.clip();
  ctx.fillStyle = PAL.stripe;
  for (let yy = 62; yy < 380; yy += 22) ctx.fillRect(-70, yy, 140, 9);
  const tg = ctx.createLinearGradient(-62, 0, 62, 0);
  tg.addColorStop(0, 'rgba(255,255,255,.12)');
  tg.addColorStop(1, 'rgba(0,0,30,.18)');
  ctx.fillStyle = tg;
  ctx.fillRect(-70, 40, 140, 340);
  ctx.restore();
  torso();
  OP.fs(ctx, null, OP.OUT, 4);
  OP.rr(ctx, -40, 112, 80, 260, 14);
  OP.fs(ctx, '#fff8ee', OP.OUT, 3.5);
  OP.rr(ctx, -22, 176, 44, 30, 6);
  OP.fs(ctx, '#f3e6d2', OP.OUT, 2.5);
  OP.drawCroissant(ctx, 0, 142, 0.34, { state: 'baked', noShadow: true });
  ctx.beginPath();
  ctx.moveTo(-26, 50);
  ctx.lineTo(26, 50);
  ctx.lineTo(4, 92);
  ctx.closePath();
  OP.fs(ctx, PAL.scarf, OP.OUT, 3);

  const sadArm = mood === 'sad';
  if (o.wave) oscarArm(ctx, 52, 90, -0.8, 40, -1.5 + Math.sin(t * 7) * 0.3, 52, 'open', t);
  else if (mood === 'happy') oscarArm(ctx, 52, 90, -0.6, 40, -1.6 + Math.sin(t * 12) * 0.1, 54, 'thumb', t);
  else if (!sadArm) oscarArm(ctx, 52, 90, 1.35, 60, 3.0, 48, 'thumb', t);

  for (const k of [-1, 1]) {
    OP.ell(ctx, k * 50, 6, 11, 15);
    OP.fs(ctx, PAL.ear, OP.OUT, 3);
  }
  OP.ell(ctx, 0, 0, 50, 54);
  const hg = ctx.createRadialGradient(-18, -22, 6, 0, 0, 62);
  hg.addColorStop(0, PAL.skin0);
  hg.addColorStop(1, PAL.skin1);
  OP.fs(ctx, hg, OP.OUT, 4);
  for (const k of [-1, 1]) {
    OP.ell(ctx, k * 30, 16, 12, 8);
    ctx.fillStyle = mood === 'sad' ? 'rgba(120,150,220,.3)' : 'rgba(235,100,100,.38)';
    ctx.fill();
  }
  const blink = t % 4.2 < 0.14;
  for (const k of [-1, 1]) {
    if (mood === 'happy' || blink) {
      ctx.beginPath();
      ctx.moveTo(k * 19 - 9, -6);
      ctx.quadraticCurveTo(k * 19, -15, k * 19 + 9, -6);
      ctx.strokeStyle = OP.OUT;
      ctx.lineWidth = 3.5;
      ctx.stroke();
    } else {
      OP.ell(ctx, k * 19, -8, 9, 11);
      OP.fs(ctx, '#fff', OP.OUT, 3);
      OP.ell(ctx, k * 19 + (mood === 'sad' ? 0 : 2), mood === 'sad' ? -3 : -6, 4.5, 5.5);
      ctx.fillStyle = '#24160e';
      ctx.fill();
      OP.ell(ctx, k * 19, -9, 1.6, 1.6);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
    ctx.beginPath();
    if (mood === 'sad') {
      ctx.moveTo(k * 8, -30);
      ctx.quadraticCurveTo(k * 22, -26, k * 34, -18);
    } else {
      ctx.moveTo(k * 8, -24 - (mood === 'happy' ? 4 : 0));
      ctx.quadraticCurveTo(k * 22, -34 - (mood === 'happy' ? 4 : 0), k * 34, -24);
    }
    ctx.lineWidth = 7;
    ctx.strokeStyle = PAL.brow;
    ctx.stroke();
  }
  const talk = o.talking ? (Math.sin(t * 18) + 1) / 2 : 0;
  const mouthOpen = mood === 'happy' ? 10 : mood === 'sad' ? 7 : 5 + talk * 8;
  OP.ell(ctx, 0, 38 + talk * 3, 12, mouthOpen);
  OP.fs(ctx, '#8e2a24', OP.OUT, 3);
  const wig = Math.sin(t * 3) * 0.04 + (o.talking ? Math.sin(t * 18) * 0.05 : 0);
  for (const k of PAL.mustache ? [-1, 1] : []) {
    ctx.save();
    ctx.rotate(k * wig);
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.bezierCurveTo(k * 16, 12, k * 44, 18, k * 50, 4);
    ctx.bezierCurveTo(k * 62, 20, k * 44, 44, k * 18, 36);
    ctx.quadraticCurveTo(k * 6, 34, 0, 30);
    ctx.closePath();
    OP.fs(ctx, PAL.hair, OP.OUT, 3);
    ctx.beginPath();
    ctx.moveTo(k * 12, 26);
    ctx.quadraticCurveTo(k * 32, 22, k * 44, 14);
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
  OP.ell(ctx, 3, 12, 15, 13);
  OP.fs(ctx, '#ec6a5c', OP.OUT, 3);
  OP.ell(ctx, -2, 7, 5, 3.5, -0.5);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fill();
  for (const [hx, hy, hr] of [[-30, -84, 28], [30, -84, 28], [0, -104, 34]]) {
    OP.ell(ctx, hx, hy, hr, hr);
    const cg = ctx.createRadialGradient(hx - hr * 0.3, hy - hr * 0.4, 2, hx, hy, hr);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(1, '#e8e2da');
    OP.fs(ctx, cg, OP.OUT, 3.5);
  }
  OP.rr(ctx, -42, -70, 84, 26, 6);
  OP.fs(ctx, '#ffffff', OP.OUT, 3.5);
  ctx.strokeStyle = 'rgba(160,150,140,.5)';
  ctx.lineWidth = 2;
  for (const hx of [-18, 0, 18]) {
    ctx.beginPath();
    ctx.moveTo(hx, -68);
    ctx.lineTo(hx, -48);
    ctx.stroke();
  }
  if (sadArm) oscarArm(ctx, 52, 90, -0.95, 52, -2.7, 50, 'open', t);
  if (mood === 'sad') {
    ctx.fillStyle = '#8fd0ff';
    ctx.beginPath();
    ctx.moveTo(-44, -30);
    ctx.quadraticCurveTo(-52, -16, -44, -10);
    ctx.quadraticCurveTo(-36, -16, -44, -30);
    ctx.fill();
  }
  ctx.restore();
  PAL = OSCAR_PAL;
};
