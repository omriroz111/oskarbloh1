// הפיטסרי של אוסקר — hand-drawn vector icons (the game uses no emoji)
var OP = globalThis.OP || (globalThis.OP = {});

(function () {
  const O = '#3b2314';
  const LW = 7;
  const fs = (c, fill, lw = LW) => OP.fs(c, fill, O, lw);
  const shine = (c, x, y, rx, ry, rot = -0.5) => {
    OP.ell(c, x, y, rx, ry, rot);
    c.fillStyle = 'rgba(255,255,255,.55)';
    c.fill();
  };
  const thick = (c, pts, color, w = 13) => {
    c.beginPath();
    pts.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1]));
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.strokeStyle = O;
    c.lineWidth = w + 9;
    c.stroke();
    c.strokeStyle = color;
    c.lineWidth = w;
    c.stroke();
  };
  function face(c, col, mood) {
    OP.ell(c, 0, 0, 42, 42);
    fs(c, col);
    shine(c, -16, -20, 9, 5);
    for (const k of [-1, 1]) {
      OP.ell(c, k * 14, -10, 5, 8);
      c.fillStyle = O;
      c.fill();
    }
    c.beginPath();
    if (mood > 0) c.arc(0, 4, 22, 0.25, Math.PI - 0.25);
    else c.arc(0, 34, 18, Math.PI + 0.4, -0.4);
    c.strokeStyle = O;
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.stroke();
  }

  const I = {};

  I.wrench = (c) => {
    c.rotate(0.78);
    OP.rr(c, -9, -10, 18, 60, 8);
    fs(c, '#aeb9c0');
    c.beginPath();
    c.arc(0, -26, 23, -Math.PI / 2 + 0.5, -Math.PI / 2 - 0.5 + Math.PI * 2);
    c.lineTo(-7, -34);
    c.lineTo(7, -34);
    c.closePath();
    fs(c, '#d3dade');
    shine(c, -9, -20, 7, 4);
  };
  I.lock = (c) => {
    c.beginPath();
    c.arc(0, -8, 20, Math.PI, 0);
    c.lineCap = 'butt';
    c.strokeStyle = O;
    c.lineWidth = 20;
    c.stroke();
    c.strokeStyle = '#d3dade';
    c.lineWidth = 10;
    c.stroke();
    OP.rr(c, -32, -8, 64, 52, 10);
    fs(c, '#f2b53a');
    OP.rr(c, -26, -3, 52, 10, 5);
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.fill();
    OP.ell(c, 0, 14, 7, 7);
    c.fillStyle = O;
    c.fill();
    c.fillRect(-3, 16, 6, 16);
  };
  I.trash = (c) => {
    c.beginPath();
    c.moveTo(-28, -18);
    c.lineTo(28, -18);
    c.lineTo(22, 44);
    c.lineTo(-22, 44);
    c.closePath();
    fs(c, '#aab4ba');
    c.strokeStyle = 'rgba(40,50,60,.45)';
    c.lineWidth = 5;
    for (const x of [-11, 0, 11]) {
      c.beginPath();
      c.moveTo(x * 1.2, -8);
      c.lineTo(x, 34);
      c.stroke();
    }
    OP.rr(c, -36, -32, 72, 14, 6);
    fs(c, '#d3dade');
    OP.rr(c, -11, -42, 22, 11, 5);
    fs(c, '#8a959c');
  };
  I.speaker = (c, o) => {
    c.beginPath();
    c.moveTo(-42, -14);
    c.lineTo(-22, -14);
    c.lineTo(2, -36);
    c.lineTo(2, 36);
    c.lineTo(-22, 14);
    c.lineTo(-42, 14);
    c.closePath();
    fs(c, o.color || '#ffb23f');
    if (o.off) {
      thick(c, [[16, -16], [42, 16]], '#e0453a', 8);
      thick(c, [[42, -16], [16, 16]], '#e0453a', 8);
    } else {
      c.lineCap = 'round';
      const waves = o.level == null ? 2 : o.level > 0.66 ? 3 : o.level > 0.33 ? 2 : o.level > 0 ? 1 : 0;
      for (let k = 0; k < waves; k++) {
        c.beginPath();
        c.arc(4, 0, 16 + k * 14, -0.8, 0.8);
        c.strokeStyle = O;
        c.lineWidth = 8;
        c.stroke();
      }
    }
  };
  I.music = (c, o) => {
    const col = o.color || '#8b64e0';
    c.beginPath();
    c.moveTo(-14, -26);
    c.lineTo(36, -40);
    c.lineTo(36, -22);
    c.lineTo(-14, -8);
    c.closePath();
    fs(c, col);
    OP.rr(c, -16, -26, 9, 58, 3);
    fs(c, col, 5);
    OP.rr(c, 30, -40, 9, 58, 3);
    fs(c, col, 5);
    OP.ell(c, -24, 32, 15, 11, -0.4);
    fs(c, col);
    OP.ell(c, 22, 18, 15, 11, -0.4);
    fs(c, col);
    shine(c, -28, 28, 5, 3);
  };
  I.hand = (c) => {
    const skin = '#ffdcbf';
    OP.ell(c, -26, 12, 10, 17, -0.5);
    fs(c, skin);
    OP.rr(c, -22, -6, 48, 50, 16);
    fs(c, skin);
    OP.rr(c, 8, -12, 14, 26, 7);
    fs(c, skin);
    OP.rr(c, 20, -6, 13, 24, 6);
    fs(c, skin);
    OP.rr(c, -12, -52, 19, 62, 9);
    fs(c, skin);
    OP.rr(c, -24, 38, 52, 14, 6);
    fs(c, '#ffffff');
    shine(c, -5, -42, 3, 7, 0);
  };
  I.clipboard = (c) => {
    OP.rr(c, -32, -40, 64, 86, 8);
    fs(c, '#c98f55');
    OP.rr(c, -24, -30, 48, 68, 4);
    fs(c, '#ffffff', 5);
    c.fillStyle = '#b9c2c8';
    for (let k = 0; k < 4; k++) c.fillRect(-16, -16 + k * 13, 32, 5);
    OP.rr(c, -14, -48, 28, 16, 5);
    fs(c, '#aab4ba');
  };
  I.star = (c, o) => {
    OP.starPath(c, 0, 3, 47, 21);
    fs(c, o.color || '#ffd23a');
    shine(c, -10, -12, 7, 4);
  };
  I.check = (c, o) => thick(c, [[-30, 2], [-8, 24], [32, -24]], o.color || '#4cc25a', 14);
  I.cross = (c, o) => {
    thick(c, [[-26, -26], [26, 26]], o.color || '#e0453a', 14);
    thick(c, [[26, -26], [-26, 26]], o.color || '#e0453a', 14);
  };
  I.play = (c, o) => {
    if (o.flip) c.scale(-1, 1);
    c.beginPath();
    c.moveTo(-22, -34);
    c.lineTo(34, 0);
    c.lineTo(-22, 34);
    c.closePath();
    fs(c, o.color || '#ffffff');
  };
  I.players = (c) => {
    for (const [dx, dy, col, s] of [[20, 4, '#4a90d9', 0.82], [-14, 0, '#ee7b95', 1]]) {
      c.save();
      c.translate(dx, dy);
      c.scale(s, s);
      c.beginPath();
      c.moveTo(-26, 46);
      c.quadraticCurveTo(-26, 8, 0, 8);
      c.quadraticCurveTo(26, 8, 26, 46);
      c.closePath();
      fs(c, col);
      OP.ell(c, 0, -16, 18, 18);
      fs(c, '#f6c29c');
      c.beginPath();
      c.arc(0, -22, 18, Math.PI, 0);
      c.closePath();
      fs(c, dx > 0 ? '#4f3321' : '#c98a3b');
      c.restore();
    }
  };
  I.fastForward = (c, o) => {
    for (const dx of [-20, 14]) {
      c.beginPath();
      c.moveTo(dx - 22, -30);
      c.lineTo(dx + 20, 0);
      c.lineTo(dx - 22, 30);
      c.closePath();
      fs(c, o.color || '#ffffff');
    }
  };
  I.film = (c) => {
    OP.rr(c, -44, -14, 88, 58, 8);
    fs(c, '#3a3f4b');
    c.save();
    c.translate(-44, -16);
    c.rotate(-0.28);
    OP.rr(c, 0, -20, 90, 22, 5);
    fs(c, '#3a3f4b');
    c.fillStyle = '#ffffff';
    for (let k = 0; k < 4; k++) {
      c.beginPath();
      c.moveTo(8 + k * 22, -20);
      c.lineTo(20 + k * 22, -20);
      c.lineTo(12 + k * 22, 2);
      c.lineTo(0 + k * 22, 2);
      c.closePath();
      c.fill();
    }
    c.restore();
    c.fillStyle = '#ffd23a';
    OP.ell(c, 0, 16, 12, 12);
    c.fill();
    c.fillStyle = '#3a3f4b';
    c.beginPath();
    c.moveTo(-4, 9);
    c.lineTo(7, 16);
    c.lineTo(-4, 23);
    c.closePath();
    c.fill();
  };
  I.pause = (c, o) => {
    OP.rr(c, -28, -32, 20, 64, 6);
    fs(c, o.color || O);
    OP.rr(c, 8, -32, 20, 64, 6);
    fs(c, o.color || O);
  };
  I.cart = (c) => {
    c.beginPath();
    c.moveTo(-50, -38);
    c.lineTo(-38, -38);
    c.lineTo(-26, 14);
    c.lineTo(32, 14);
    c.strokeStyle = O;
    c.lineWidth = 9;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();
    c.beginPath();
    c.moveTo(-36, -26);
    c.lineTo(44, -26);
    c.lineTo(36, 6);
    c.lineTo(-28, 6);
    c.closePath();
    fs(c, '#ffb23f');
    c.strokeStyle = 'rgba(59,35,20,.5)';
    c.lineWidth = 4;
    for (const x of [-12, 6, 24]) {
      c.beginPath();
      c.moveTo(x, -22);
      c.lineTo(x - 2, 2);
      c.stroke();
    }
    for (const x of [-18, 26]) {
      OP.ell(c, x, 32, 9, 9);
      fs(c, '#6b7a84');
    }
  };
  I.moon = (c) => {
    c.save();
    c.beginPath();
    c.rect(-60, -60, 120, 120);
    c.arc(20, -16, 32, 0, Math.PI * 2, true);
    c.clip();
    OP.ell(c, 0, 0, 40, 40);
    fs(c, '#ffe08a');
    c.restore();
    c.save();
    OP.ell(c, 0, 0, 40, 40);
    c.clip();
    c.beginPath();
    c.arc(20, -16, 32, 0, Math.PI * 2);
    c.strokeStyle = O;
    c.lineWidth = LW;
    c.stroke();
    c.restore();
    c.fillStyle = 'rgba(200,150,40,.45)';
    OP.ell(c, -20, 12, 6, 6);
    c.fill();
    OP.ell(c, -6, 28, 4, 4);
    c.fill();
  };
  I.heart = (c, o) => {
    c.beginPath();
    c.moveTo(0, 40);
    c.bezierCurveTo(-62, 2, -40, -48, 0, -18);
    c.bezierCurveTo(40, -48, 62, 2, 0, 40);
    fs(c, o.color || '#ff5a7a');
    shine(c, -20, -16, 8, 5);
  };
  I.smile = (c) => face(c, '#ffd23a', 1);
  I.frown = (c) => face(c, '#ff9a5a', -1);
  I.gear = (c, o) => {
    c.beginPath();
    const n = 8;
    const w = (Math.PI / n) * 0.55;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const pts = [[a - w * 1.3, 33], [a - w * 0.7, 47], [a + w * 0.7, 47], [a + w * 1.3, 33]];
      pts.forEach(([ang, r], k) => {
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r;
        if (i === 0 && k === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
    }
    c.closePath();
    fs(c, o.color || '#aab4ba');
    OP.ell(c, 0, 0, 15, 15);
    fs(c, o.hole || '#fffaf0');
  };
  I.home = (c) => {
    OP.rr(c, -30, -6, 60, 46, 5);
    fs(c, '#fff3e0');
    c.beginPath();
    c.moveTo(-46, -2);
    c.lineTo(0, -44);
    c.lineTo(46, -2);
    c.closePath();
    fs(c, '#ee7b95');
    OP.rr(c, -10, 12, 20, 28, 4);
    fs(c, '#c98f55', 5);
  };
  I.arrowUp = (c, o) => {
    c.beginPath();
    c.moveTo(0, -42);
    c.lineTo(36, 0);
    c.lineTo(14, 0);
    c.lineTo(14, 40);
    c.lineTo(-14, 40);
    c.lineTo(-14, 0);
    c.lineTo(-36, 0);
    c.closePath();
    fs(c, o.color || '#4cc25a');
  };
  I.arrowDown = (c, o) => {
    c.scale(1, -1);
    I.arrowUp(c, { color: o.color || '#e0453a' });
  };
  I.receipt = (c) => {
    c.beginPath();
    c.moveTo(-28, -44);
    c.lineTo(28, -44);
    c.lineTo(28, 38);
    for (let i = 0; i < 6; i++) c.lineTo(28 - (i + 1) * 9.33, i % 2 ? 38 : 46);
    c.closePath();
    fs(c, '#ffffff');
    c.fillStyle = '#b9c2c8';
    for (let k = 0; k < 4; k++) c.fillRect(-18, -30 + k * 14, k === 3 ? 20 : 36, 6);
  };
  I.badge = (c) => {
    c.beginPath();
    c.moveTo(0, -46);
    c.lineTo(38, -30);
    c.quadraticCurveTo(38, 24, 0, 46);
    c.quadraticCurveTo(-38, 24, -38, -30);
    c.closePath();
    fs(c, '#4a7fd4');
    OP.starPath(c, 0, 0, 22, 10);
    fs(c, '#ffd23a', 5);
  };
  I.sparkle = (c, o) => {
    OP.starPath(c, 0, 0, 46, 12, 4);
    fs(c, o.color || '#fff3a0', 5);
  };
  I.bolt = (c) => {
    c.beginPath();
    c.moveTo(8, -46);
    c.lineTo(-26, 6);
    c.lineTo(-2, 6);
    c.lineTo(-10, 46);
    c.lineTo(26, -8);
    c.lineTo(2, -8);
    c.closePath();
    fs(c, '#ffd23a');
  };
  I.fire = (c) => {
    c.beginPath();
    c.moveTo(0, 46);
    c.bezierCurveTo(-44, 42, -40, -4, -14, -22);
    c.bezierCurveTo(-12, -6, -4, -2, 0, -4);
    c.bezierCurveTo(-6, -24, 6, -40, 14, -48);
    c.bezierCurveTo(16, -24, 44, -12, 40, 14);
    c.bezierCurveTo(38, 36, 22, 46, 0, 46);
    fs(c, '#ff7a2a');
    c.beginPath();
    c.moveTo(0, 40);
    c.bezierCurveTo(-22, 38, -22, 14, -4, 2);
    c.bezierCurveTo(-2, 14, 8, 12, 10, 4);
    c.bezierCurveTo(22, 16, 22, 38, 0, 40);
    c.fillStyle = '#ffd23a';
    c.fill();
  };
  I.croissant = (c) => OP.drawCroissant(c, 0, 6, 0.72, { state: 'baked', noShadow: true });
  I.cup = (c) => OP.drawCup(c, -4, 12, 2.1, 1, true, 0);
  I.juice = (c) => OP.drawJuiceBox(c, 0, 12, 1.8);
  I.orange = (c) => {
    OP.ell(c, 0, 6, 38, 38);
    fs(c, '#ff9a24');
    shine(c, -14, -8, 9, 6);
    c.fillStyle = 'rgba(200,100,0,.35)';
    for (const [x, y] of [[10, 14], [18, 0], [-4, 24], [14, 28]]) {
      OP.ell(c, x, y, 2.5, 2.5);
      c.fill();
    }
    OP.rr(c, -3, -44, 6, 14, 3);
    fs(c, '#7a4a22', 4);
    OP.ell(c, 16, -36, 16, 8, -0.4);
    fs(c, '#58b368', 5);
  };
  I.knife = (c) => {
    c.rotate(-0.75);
    c.beginPath();
    c.moveTo(-8, -10);
    c.lineTo(46, -10);
    c.quadraticCurveTo(58, -2, 46, 10);
    c.lineTo(-8, 10);
    c.closePath();
    fs(c, '#dfe6ea');
    shine(c, 16, -4, 16, 2.5, 0);
    OP.rr(c, -48, -9, 42, 18, 6);
    fs(c, '#7a4520');
    c.fillStyle = '#e9d7c0';
    for (const x of [-38, -20]) {
      OP.ell(c, x, 0, 2.5, 2.5);
      c.fill();
    }
  };
  I.oven = (c) => {
    OP.rr(c, -42, -44, 84, 88, 12);
    fs(c, '#8d9aa5');
    OP.rr(c, -34, -36, 68, 14, 4);
    fs(c, '#39424a', 5);
    const g = c.createLinearGradient(0, -14, 0, 34);
    g.addColorStop(0, '#ffc15a');
    g.addColorStop(1, '#e0521f');
    OP.rr(c, -32, -14, 64, 46, 8);
    fs(c, g, 6);
    OP.drawCroissant(c, 0, 10, 0.34, { state: 'baked', noShadow: true });
    c.fillStyle = '#d7dde2';
    for (const x of [14, 26]) {
      OP.ell(c, x, -29, 4, 4);
      c.fill();
    }
  };
  I.thermo = (c) => {
    OP.rr(c, -12, -46, 24, 72, 12);
    fs(c, '#ffffff');
    OP.ell(c, 0, 30, 18, 18);
    fs(c, '#e0453a');
    OP.rr(c, -5, -30, 10, 56, 5);
    c.fillStyle = '#e0453a';
    c.fill();
    c.fillStyle = O;
    for (let k = 0; k < 4; k++) c.fillRect(16, -36 + k * 14, 10, 4);
  };
  I.basket = (c) => {
    OP.drawCroissant(c, 0, -16, 0.52, { state: 'baked', noShadow: true });
    c.beginPath();
    c.moveTo(-44, -6);
    c.lineTo(44, -6);
    c.lineTo(32, 40);
    c.lineTo(-32, 40);
    c.closePath();
    fs(c, '#c88a4a');
    c.strokeStyle = '#8c5427';
    c.lineWidth = 5;
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.moveTo(-40 + k * 4, 6 + k * 12);
      c.lineTo(40 - k * 4, 6 + k * 12);
      c.stroke();
    }
    OP.rr(c, -48, -12, 96, 12, 6);
    fs(c, '#a86a32');
  };
  I.bag = (c) => {
    c.beginPath();
    c.arc(0, -20, 17, Math.PI, 0);
    c.lineCap = 'round';
    c.strokeStyle = O;
    c.lineWidth = 13;
    c.stroke();
    c.strokeStyle = '#e2bf8a';
    c.lineWidth = 6;
    c.stroke();
    c.beginPath();
    c.moveTo(-34, -20);
    c.lineTo(34, -20);
    c.lineTo(40, 44);
    c.lineTo(-40, 44);
    c.closePath();
    fs(c, '#d9b27a');
    OP.ell(c, 0, 14, 14, 14);
    fs(c, '#ee7b95', 5);
  };
  I.chefHat = (c) => {
    for (const [x, y, r] of [[-22, -12, 22], [22, -12, 22], [0, -26, 26]]) {
      OP.ell(c, x, y, r, r);
      fs(c, '#ffffff');
    }
    OP.rr(c, -32, 4, 64, 30, 6);
    fs(c, '#ffffff');
    c.strokeStyle = 'rgba(150,140,130,.6)';
    c.lineWidth = 4;
    for (const x of [-12, 0, 12]) {
      c.beginPath();
      c.moveTo(x, 10);
      c.lineTo(x, 28);
      c.stroke();
    }
  };
  I.tray = (c) => {
    OP.rr(c, -46, -28, 92, 60, 10);
    fs(c, '#c9d0d5');
    OP.rr(c, -36, -18, 72, 40, 7);
    fs(c, '#6b3a1e', 5);
    c.fillStyle = '#9b5b33';
    for (const x of [-18, 4, 22]) {
      OP.ell(c, x, -4, 7, 3);
      c.fill();
    }
  };
  I.moneyBag = (c) => {
    c.beginPath();
    c.moveTo(-14, -30);
    c.bezierCurveTo(-56, 0, -44, 46, 0, 46);
    c.bezierCurveTo(44, 46, 56, 0, 14, -30);
    c.closePath();
    fs(c, '#d8b06a');
    c.beginPath();
    c.moveTo(-14, -30);
    c.lineTo(-22, -46);
    c.lineTo(22, -46);
    c.lineTo(14, -30);
    c.closePath();
    fs(c, '#d8b06a');
    OP.rr(c, -18, -34, 36, 8, 4);
    fs(c, '#8c5427', 4);
    OP.coinIcon(c, 0, 12, 18);
  };
  I.siren = (c) => {
    c.strokeStyle = '#ffb000';
    c.lineCap = 'round';
    c.lineWidth = 7;
    for (const [x1, y1, x2, y2] of [[-42, -32, -32, -22], [42, -32, 32, -22], [0, -50, 0, -40]]) {
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(-26, 26);
    c.lineTo(-26, -6);
    c.arc(0, -6, 26, Math.PI, 0);
    c.lineTo(26, 26);
    c.closePath();
    fs(c, '#e0453a');
    shine(c, -10, -12, 6, 10, 0.2);
    OP.rr(c, -38, 24, 76, 18, 6);
    fs(c, '#6b7a84');
  };
  I.fly = (c) => {
    c.scale(2.6, 2.6);
    OP.drawFly(c, { x: 0, y: 2, state: 'landed' }, 0);
  };
  I.flytrap = (c) => {
    c.save();
    c.scale(2.2, 2.2);
    OP.drawFly(c, { x: 0, y: 2, state: 'landed' }, 0);
    c.restore();
    const ring = (draw) => {
      c.beginPath();
      draw();
      c.strokeStyle = O;
      c.lineWidth = 16;
      c.stroke();
      c.strokeStyle = '#e0453a';
      c.lineWidth = 8;
      c.stroke();
    };
    ring(() => c.arc(0, 0, 42, 0, Math.PI * 2));
    ring(() => {
      c.moveTo(-29, -29);
      c.lineTo(29, 29);
    });
  };
  I.broom = (c) => {
    c.rotate(0.6);
    OP.rr(c, -5, -54, 10, 66, 5);
    fs(c, '#b0723c', 5);
    c.beginPath();
    c.moveTo(-14, 8);
    c.lineTo(14, 8);
    c.lineTo(28, 50);
    c.lineTo(-28, 50);
    c.closePath();
    fs(c, '#f2c74a');
    c.strokeStyle = 'rgba(140,90,20,.55)';
    c.lineWidth = 4;
    for (const x of [-14, 0, 14]) {
      c.beginPath();
      c.moveTo(x * 0.5, 14);
      c.lineTo(x, 46);
      c.stroke();
    }
    OP.rr(c, -16, 2, 32, 11, 4);
    fs(c, '#e0453a', 5);
  };
  I.stool = (c) => {
    c.strokeStyle = O;
    c.lineWidth = 9;
    c.lineCap = 'round';
    for (const [x1, x2] of [[-18, -30], [18, 30]]) {
      c.beginPath();
      c.moveTo(x1, -10);
      c.lineTo(x2, 46);
      c.stroke();
    }
    OP.rr(c, -24, 18, 48, 8, 4);
    fs(c, '#b0723c', 5);
    OP.ell(c, 0, -14, 38, 13);
    fs(c, '#c0392b');
    OP.ell(c, 0, -20, 38, 13);
    fs(c, '#ff6f5f');
    shine(c, -12, -24, 12, 4, 0);
  };
  I.butter = (c) => {
    c.beginPath();
    c.moveTo(-42, -2);
    c.lineTo(-10, -28);
    c.lineTo(44, -12);
    c.lineTo(12, 12);
    c.closePath();
    fs(c, '#fff1a8');
    c.beginPath();
    c.moveTo(-42, -2);
    c.lineTo(12, 12);
    c.lineTo(12, 40);
    c.lineTo(-42, 24);
    c.closePath();
    fs(c, '#ffe07a');
    c.beginPath();
    c.moveTo(12, 12);
    c.lineTo(44, -12);
    c.lineTo(44, 14);
    c.lineTo(12, 40);
    c.closePath();
    fs(c, '#f2c94c');
  };
  I.chocolate = (c) => {
    c.rotate(-0.25);
    OP.rr(c, -30, -42, 60, 84, 8);
    fs(c, '#6b3a1e');
    c.strokeStyle = '#3e2010';
    c.lineWidth = 4;
    for (let k = 1; k < 3; k++) {
      c.beginPath();
      c.moveTo(-30 + k * 20, -40);
      c.lineTo(-30 + k * 20, 10);
      c.stroke();
      c.beginPath();
      c.moveTo(-30, -42 + k * 20);
      c.lineTo(30, -42 + k * 20);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(-30, 12);
    c.lineTo(30, 2);
    c.lineTo(30, 34);
    c.quadraticCurveTo(30, 42, 22, 42);
    c.lineTo(-22, 42);
    c.quadraticCurveTo(-30, 42, -30, 34);
    c.closePath();
    fs(c, '#e0453a');
    c.fillStyle = 'rgba(255,255,255,.35)';
    c.fillRect(-22, 22, 44, 6);
  };
  I.sugar = (c) => {
    OP.rr(c, -24, -18, 48, 60, 10);
    fs(c, '#ffffff');
    OP.rr(c, -28, -34, 56, 18, 8);
    fs(c, '#aab4ba');
    c.fillStyle = O;
    for (const x of [-12, 0, 12]) {
      OP.ell(c, x, -25, 2.5, 2.5);
      c.fill();
    }
    OP.rr(c, -16, 4, 32, 22, 6);
    c.fillStyle = '#9fd8ff';
    c.fill();
    for (const [x, y] of [[-30, -46], [-12, -52], [6, -46], [24, -52]]) {
      OP.ell(c, x, y, 4, 4);
      fs(c, '#ffffff', 3);
    }
  };
  I.pistachio = (c) => {
    OP.ell(c, 0, 4, 30, 42, 0.35);
    fs(c, '#e9d5a8');
    OP.ell(c, 3, 2, 17, 31, 0.35);
    fs(c, '#8fbf4d', 5);
    shine(c, -3, -10, 5, 9, 0.35);
  };
  I.almond = (c) => {
    c.beginPath();
    c.moveTo(0, -46);
    c.bezierCurveTo(34, -20, 30, 36, 0, 46);
    c.bezierCurveTo(-30, 36, -34, -20, 0, -46);
    fs(c, '#c98a52');
    c.strokeStyle = 'rgba(90,50,20,.45)';
    c.lineWidth = 4;
    for (const k of [-10, 6]) {
      c.beginPath();
      c.moveTo(k, -30);
      c.quadraticCurveTo(k + 8, 0, k, 32);
      c.stroke();
    }
    shine(c, -8, -14, 4, 10, 0.2);
  };
  I.vanilla = (c) => {
    OP.rr(c, -32, -20, 64, 62, 14);
    fs(c, '#e8f4f7');
    OP.rr(c, -25, -6, 50, 42, 10);
    c.fillStyle = '#f3d77a';
    c.fill();
    OP.rr(c, -36, -34, 72, 18, 6);
    fs(c, '#e0453a');
    c.save();
    c.rotate(0.35);
    OP.rr(c, 16, -62, 8, 52, 3);
    fs(c, '#4a2a14', 4);
    c.restore();
  };
  I.cream = (c) => {
    // a bowl of whipped pastry cream with a swirl on top
    c.beginPath();
    c.moveTo(-30, 2);
    c.quadraticCurveTo(-30, -18, -14, -16);
    c.quadraticCurveTo(-12, -36, 4, -32);
    c.quadraticCurveTo(10, -50, 18, -34);
    c.quadraticCurveTo(32, -30, 30, 2);
    c.closePath();
    fs(c, '#f7e6c0', 5);
    c.strokeStyle = 'rgba(160,120,60,.5)';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-18, -8);
    c.quadraticCurveTo(0, -20, 18, -8);
    c.stroke();
    c.beginPath();
    c.moveTo(-38, 0);
    c.quadraticCurveTo(-36, 42, 0, 42);
    c.quadraticCurveTo(36, 42, 38, 0);
    c.closePath();
    fs(c, '#6fb7e9', 5);
    shine(c, -18, 14, 5, 9, 0.3);
  };
  I.flyer = (c) => {
    c.rotate(-0.12);
    OP.rr(c, -32, -44, 64, 88, 5);
    fs(c, '#ffffff');
    OP.rr(c, -32, -44, 64, 26, 5);
    fs(c, '#ee7b95');
    OP.drawCroissant(c, 0, 4, 0.3, { state: 'baked', noShadow: true });
    c.fillStyle = '#b9c2c8';
    c.fillRect(-20, 22, 40, 5);
    c.fillRect(-14, 32, 28, 5);
  };
  I.bulb = (c) => {
    c.strokeStyle = '#ffb000';
    c.lineWidth = 6;
    c.lineCap = 'round';
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI + ((k + 0.5) * Math.PI) / 5;
      c.beginPath();
      c.moveTo(Math.cos(a) * 40, -8 + Math.sin(a) * 40);
      c.lineTo(Math.cos(a) * 50, -8 + Math.sin(a) * 50);
      c.stroke();
    }
    c.beginPath();
    c.arc(0, -10, 26, Math.PI * 0.8, Math.PI * 2.2);
    c.lineTo(10, 22);
    c.lineTo(-10, 22);
    c.closePath();
    fs(c, '#fff06a');
    OP.rr(c, -12, 20, 24, 18, 4);
    fs(c, '#aab4ba');
    shine(c, -10, -18, 6, 9, 0.4);
  };
  I.camera = (c) => {
    OP.rr(c, -18, -38, 36, 16, 5);
    fs(c, '#c85a78', 5);
    OP.rr(c, -44, -26, 88, 62, 12);
    fs(c, '#ee7b95');
    OP.ell(c, 0, 4, 22, 22);
    fs(c, '#3b3f4a');
    OP.ell(c, 0, 4, 12, 12);
    fs(c, '#6fb7e9', 5);
    shine(c, -5, -1, 4, 3);
    OP.rr(c, 24, -18, 12, 8, 3);
    c.fillStyle = '#fff3a0';
    c.fill();
  };
  I.newspaper = (c) => {
    OP.rr(c, -44, -34, 88, 70, 6);
    fs(c, '#f1ede4');
    OP.rr(c, -36, -26, 72, 12, 3);
    c.fillStyle = O;
    c.fill();
    OP.rr(c, 6, -6, 30, 30, 3);
    fs(c, '#9fd8ff', 4);
    c.fillStyle = '#9aa3aa';
    for (let k = 0; k < 4; k++) c.fillRect(-36, -6 + k * 9, 34, 5);
  };
  I.megaphone = (c) => {
    OP.rr(c, -24, 10, 12, 26, 4);
    fs(c, '#6b7a84', 5);
    c.beginPath();
    c.moveTo(-30, -12);
    c.lineTo(30, -38);
    c.lineTo(30, 38);
    c.lineTo(-30, 12);
    c.closePath();
    fs(c, '#e0453a');
    OP.rr(c, -44, -14, 18, 28, 6);
    fs(c, '#ffffff');
    OP.ell(c, 30, 0, 9, 38);
    fs(c, '#ff8a7a');
  };
  I.clock = (c) => {
    OP.ell(c, 0, 0, 42, 42);
    fs(c, '#ffffff');
    c.strokeStyle = O;
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -26);
    c.moveTo(0, 0);
    c.lineTo(18, 8);
    c.stroke();
  };
  I.coin = (c) => OP.coinIcon(c, 0, 0, 40);
  I.refresh = (c) => OP.refillIcon(c, 0, 0, 92, 0);

  OP.ICONS = I;
  OP.icon = (ctx, name, x, y, size, o = {}) => {
    const fn = I[name];
    if (!fn) return;
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    const s = size / 100;
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    fn(ctx, o);
    ctx.restore();
  };
})();
