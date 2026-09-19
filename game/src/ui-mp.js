// הפיטסרי של אוסקר — multiplayer screens: menu, host lobby, join, co-op/versus results, in-game pieces
var OP = globalThis.OP || (globalThis.OP = {});

OP.MP_INPUT = { x: 390, y: 266, w: 500, h: 66 };

(function () {
  const dim = (ctx, a = 0.58) => {
    ctx.fillStyle = `rgba(20,10,5,${a})`;
    ctx.fillRect(0, 0, 1280, 720);
  };
  const dots = (t) => '.'.repeat(1 + (Math.floor(t * 3) % 3));
  const modeName = (m) => (m === 'versus' ? 'תחרות' : 'שיתופי');
  const profitOf = (st) => st.earned + st.tips + st.bonus - st.fines;

  function playerDots(ctx, x, y, pids, r = 9) {
    const net = OP.Net;
    const shown = pids.slice(0, 12);
    shown.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(x - i * (r * 2 + 4), y, r, 0, Math.PI * 2);
      ctx.fillStyle = net.colorOf(p);
      ctx.fill();
      ctx.strokeStyle = OP.OUT;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
    if (pids.length > shown.length) OP.text(ctx, '+' + (pids.length - shown.length), x - shown.length * (r * 2 + 4) - 6, y + 1, { size: 16, color: OP.OUT, dir: 'ltr', align: 'right' });
  }

  function codeBox(ctx, app, x, y, w, label, code, id, t) {
    OP.text(ctx, label, x + w, y, { size: 22, weight: 700, color: OP.OUT, align: 'right' });
    OP.rr(ctx, x, y + 18, w, 62, 16);
    OP.fs(ctx, '#fffdf6', OP.OUT, 3);
    if (code) {
      OP.text(ctx, code, x + w / 2 + 40, y + 50, { size: code.length > 24 ? 24 : 30, color: '#2f5d50', dir: 'ltr' });
      const cb = { x: x + 10, y: y + 28, w: 78, h: 42 };
      OP.drawButton(ctx, cb, 'העתק', { size: 18, color: '#4a90d9', hover: app.hover('copy' + id, cb) });
      app.ui.add(cb, () => {
        try {
          navigator.clipboard.writeText(code);
          app.copied = { id, at: app.t };
        } catch (e) {}
      });
      if (app.copied && app.copied.id === id && app.t - app.copied.at < 1.5) {
        OP.text(ctx, 'הועתק!', x + 49, y + 100, { size: 18, color: '#2f7d3a' });
      }
    }
  }

  OP.drawMp = (ctx, app, t) => {
    OP.renderScene(ctx, app.demo, t, app, { title: true });
    dim(ctx);
    if (app.mpView === 'host') drawHost(ctx, app, t);
    else if (app.mpView === 'join') drawJoin(ctx, app, t);
    else drawMenu(ctx, app, t);
  };

  function drawMenu(ctx, app, t) {
    OP.panel(ctx, 320, 100, 640, 560, { title: 'משחק עם חברים', icon: 'players', titleW: 350 });
    const canHost = OP.Net.canHost();
    OP.text(ctx, canHost ? 'פתחו שרת על המחשב הזה, כמה חברים שרוצים:' : 'בטלפון מצטרפים לחבר שפתח שרת במחשב', 900, 168, { size: 22, weight: 700, color: OP.OUT, align: 'right' });
    const cards = [
      { mode: 'coop', x: 660, icon: 'players', title: 'שיתופי', lines: ['פיטסרי משותפת משלכם', 'קופה ושדרוגים משותפים'] },
      { mode: 'versus', x: 380, icon: 'star', title: 'תחרות', lines: ['3 ימים, כל אחד במטבח שלו', 'מי שמרוויח הכי הרבה מנצח'] },
    ];
    for (const c of cards) {
      const r = { x: c.x, y: 196, w: 240, h: 210 };
      const h = canHost ? app.hover('card' + c.mode, r) : 0;
      ctx.save();
      ctx.globalAlpha = canHost ? 1 : 0.5;
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.scale(1 + h * 0.03, 1 + h * 0.03);
      ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
      OP.rr(ctx, r.x + 3, r.y + 7, r.w, r.h, 20);
      ctx.fillStyle = 'rgba(40,20,8,.2)';
      ctx.fill();
      OP.rr(ctx, r.x, r.y, r.w, r.h, 20);
      const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
      g.addColorStop(0, c.mode === 'coop' ? '#e3f4ff' : '#fff1d6');
      g.addColorStop(1, c.mode === 'coop' ? '#bfe0f7' : '#ffd79a');
      OP.fs(ctx, g, h ? '#e89a0c' : OP.OUT, h ? 5 : 3);
      OP.icon(ctx, c.icon, r.x + r.w / 2, r.y + 58, 70);
      OP.text(ctx, c.title, r.x + r.w / 2, r.y + 118, { size: 32, color: OP.OUT });
      c.lines.forEach((ln, i) => OP.text(ctx, ln, r.x + r.w / 2, r.y + 154 + i * 26, { size: 18, weight: 600, color: '#6b4a32' }));
      ctx.restore();
      if (canHost) app.ui.add(r, () => app.hostMp(c.mode));
    }
    const jb = { x: 470, y: 440, w: 340, h: 68 };
    OP.drawButton(ctx, jb, 'הצטרפות לחבר', { color: '#4cb050', size: 28, icon: 'play', t, hover: app.hover('joinBtn', jb) });
    app.ui.add(jb, () => app.showJoin());
    const bb = { x: 540, y: 552, w: 200, h: 56 };
    OP.drawButton(ctx, bb, 'חזרה', { color: '#8d7f71', size: 24, icon: 'home', hover: app.hover('mpBack', bb) });
    app.ui.add(bb, () => app.closeMp());
  }

  function drawHost(ctx, app, t) {
    const net = OP.Net;
    OP.panel(ctx, 300, 90, 680, 580, { title: 'פתחתם שרת', icon: 'players', titleW: 300 });
    const coop = net.mode === 'coop' ? OP.loadCoopSave() : null;
    const pill = 'מצב: ' + modeName(net.mode) + (coop ? ` · יום ${coop.day} · ${coop.coins} מטבעות` : net.mode === 'coop' ? ' · פיטסרי חדשה' : ' · 3 ימים');
    const pw = OP.textWidth(ctx, pill, 20) + 40;
    OP.rr(ctx, 640 - pw / 2, 138, pw, 36, 18);
    OP.fs(ctx, net.mode === 'versus' ? '#ffd79a' : '#bfe0f7', OP.OUT, 3);
    OP.text(ctx, pill, 640, 156, { size: 20, color: OP.OUT });
    if (coop && coop.day > 1) {
      const rb = { x: 322, y: 138, w: 118, h: 36 };
      OP.drawButton(ctx, rb, 'מההתחלה', { color: '#8d7f71', size: 16, hover: app.hover('coopReset', rb) });
      app.ui.add(rb, () => app.askNewCoop());
    }
    if (net.status === 'error') {
      OP.text(ctx, net.error || 'משהו השתבש', 640, 330, { size: 24, color: '#d9483b' });
    } else if (!net.hosting) {
      OP.text(ctx, 'פותח שרת' + dots(t), 640, 330, { size: 28, color: OP.OUT });
    } else {
      const lan = net.hosting.lan[0] ? `${net.hosting.lan[0]}:${net.hosting.port}` : null;
      codeBox(ctx, app, 360, 196, 560, 'חברים באותו Wi-Fi מקלידים:', lan || 'אין רשת מקומית', 'lan', t);
      if (net.hosting.code) {
        codeBox(ctx, app, 360, 310, 560, 'חברים דרך האינטרנט מקלידים:', net.hosting.code, 'net', t);
        const st = net.hosting.tunnel;
        const note = st === 'ready' ? 'הקישור לאינטרנט מוכן' : st === 'checking' ? 'הקישור מתעורר, זה יכול לקחת דקה או שתיים' + dots(t) : 'הקישור עדיין מתעורר. אם חבר לא מצליח, חכו רגע ונסו שוב';
        OP.text(ctx, note, 640, 408, { size: 17, weight: 700, color: st === 'ready' ? '#2f8a3e' : '#6b4a32' });
      } else {
        OP.text(ctx, 'חברים דרך האינטרנט מקלידים:', 920, 310, { size: 22, weight: 700, color: OP.OUT, align: 'right' });
        OP.rr(ctx, 360, 328, 560, 62, 16);
        OP.fs(ctx, 'rgba(255,253,246,.6)', OP.OUT, 3);
        const msg = net.hosting.tunnel === 'error' ? 'לא הצלחתי לפתוח קישור לאינטרנט. אפשר לשחק ב-Wi-Fi' : 'מכין קישור לאינטרנט' + dots(t);
        OP.text(ctx, msg, 640, 360, { size: 20, weight: 700, color: net.hosting.tunnel === 'error' ? '#d9483b' : '#6b4a32' });
      }
    }
    const py = 452;
    if (net.peer) {
      OP.text(ctx, `${net.count} שחקנים מחוברים`, 790, py, { size: 28, color: '#2f7d3a', align: 'right' });
      playerDots(ctx, 520, py, net.pids);
    } else if (net.status !== 'error') {
      OP.text(ctx, 'מחכים שחברים יקלידו את הקוד' + dots(t), 640, py, { size: 24, weight: 700, color: '#6b4a32' });
    }
    const sb = { x: 500, y: 500, w: 280, h: 70 };
    OP.drawButton(ctx, sb, 'התחל', { color: net.peer ? '#4cb050' : '#a79c90', disabled: !net.peer, size: 32, icon: 'play', t: net.peer ? t : null, hover: net.peer ? app.hover('mpStart', sb) : 0 });
    if (net.peer) app.ui.add(sb, () => app.hostStartMatch());
    const cb = { x: 560, y: 596, w: 160, h: 50 };
    OP.drawButton(ctx, cb, 'ביטול', { color: '#d9483b', size: 22, hover: app.hover('mpCancel', cb) });
    app.ui.add(cb, () => app.mpBack());
  }

  function drawJoin(ctx, app, t) {
    const net = OP.Net;
    OP.panel(ctx, 300, 110, 680, 520, { title: 'הצטרפות לחבר', icon: 'players', titleW: 320 });
    const connected = net.status === 'lobby' && net.role === 'guest';
    if (connected) {
      OP.icon(ctx, 'players', 640, 240, 90);
      OP.text(ctx, 'מחובר!', 640, 316, { size: 40, color: '#2f7d3a' });
      const info = net.info ? ` · יום ${net.info.day}` : '';
      OP.text(ctx, net.mode ? 'מצב: ' + modeName(net.mode) + info : 'מתחבר למשחק' + dots(t), 640, 364, { size: 24, color: OP.OUT });
      OP.text(ctx, `${net.count} שחקנים בחדר`, 700, 408, { size: 22, weight: 700, color: OP.OUT, align: 'right' });
      playerDots(ctx, 520, 408, net.pids, 8);
      OP.text(ctx, 'מחכים שהמארח יתחיל' + dots(t), 640, 452, { size: 24, weight: 700, color: '#6b4a32' });
    } else {
      OP.text(ctx, 'הקלידו את הקוד שהחבר קיבל', 640, 190, { size: 28, color: OP.OUT });
      OP.text(ctx, 'מילים באנגלית עם מקפים (אינטרנט) או כתובת כמו 192.168.1.5:47777 (Wi-Fi)', 640, 228, { size: 17, weight: 600, color: '#6b4a32' });
      const R = OP.MP_INPUT;
      OP.rr(ctx, R.x - 4, R.y - 4, R.w + 8, R.h + 8, 20);
      OP.fs(ctx, '#fffdf6', OP.OUT, 4);
      const jb = { x: 510, y: 364, w: 260, h: 66 };
      const busy = net.status === 'connecting';
      OP.drawButton(ctx, jb, busy ? 'מתחבר' + dots(t) : 'התחבר', { color: busy ? '#a79c90' : '#4cb050', size: 30, icon: busy ? null : 'play', hover: app.hover('joinGo', jb) });
      if (!busy) app.ui.add(jb, () => app.joinMp());
      if (net.status === 'error') OP.text(ctx, net.error, 640, 470, { size: 22, weight: 700, color: '#d9483b' });
      if (busy && net.attempts > 0) OP.text(ctx, `מנסה שוב (${net.attempts})`, 640, 470, { size: 20, color: '#6b4a32' });
    }
    const bb = { x: 540, y: 540, w: 200, h: 56 };
    OP.drawButton(ctx, bb, 'חזרה', { color: '#8d7f71', size: 24, icon: 'home', hover: app.hover('joinBack', bb) });
    app.ui.add(bb, () => app.mpBack());
  }

  OP.drawConfirm = (ctx, app, t) => {
    const c = app.confirmBox;
    dim(ctx, 0.62);
    app.ui.add({ x: 0, y: 0, w: 1280, h: 720 }, () => {});
    OP.panel(ctx, 390, 210, 500, 300, { title: c.title, icon: c.icon || 'refresh', titleW: 300 });
    OP.wrapText(ctx, c.text, 400, 24, 700).forEach((ln, i) => OP.text(ctx, ln, 640, 290 + i * 34, { size: 24, weight: 700, color: OP.OUT }));
    const yes = { x: 650, y: 404, w: 200, h: 62 };
    const no = { x: 430, y: 404, w: 200, h: 62 };
    OP.drawButton(ctx, yes, c.yes, { color: '#d9483b', size: 24, hover: app.hover('cYes', yes) });
    OP.drawButton(ctx, no, 'ביטול', { color: '#8d7f71', size: 24, hover: app.hover('cNo', no) });
    app.ui.add(yes, () => {
      const fn = c.onYes;
      app.confirmBox = null;
      fn();
    });
    app.ui.add(no, () => (app.confirmBox = null));
  };

  // ---------- in game ----------
  OP.drawMpHud = (ctx, play, t) => {
    const m = play.mp;
    const net = OP.Net;
    ctx.save();
    ctx.translate(0, OP.hudY || 0);
    if (m.mode === 'coop') {
      const label = net.count > 1 ? `${net.count} אופים במטבח` : 'לבד במטבח';
      OP.rr(ctx, 24, 98, 206, 40, 20);
      OP.fs(ctx, 'rgba(255,253,246,.94)', OP.OUT, 3);
      OP.iconText(ctx, 'players', label, 138, 118, { size: 18, color: OP.OUT, iconSize: 24 });
      ctx.beginPath();
      ctx.arc(44, 118, 7, 0, Math.PI * 2);
      ctx.fillStyle = net.peer ? '#4cc25a' : '#d9483b';
      ctx.fill();
    } else {
      // live leaderboard for this day: the top three plus your own row
      const me = { pid: net.pid, profit: profitOf(play.shop.stats) };
      const rows = [me].concat(play.activePlayers().filter((p) => p !== net.pid).map((p) => ({ pid: p, profit: (play.opps[p] && play.opps[p].profit) || 0 })));
      rows.sort((a, b) => b.profit - a.profit);
      const myRank = rows.findIndex((r) => r.pid === net.pid);
      let shown = rows.slice(0, 3);
      if (myRank >= 3) shown = shown.slice(0, 2).concat(rows[myRank]);
      const h = 30 + shown.length * 26;
      OP.rr(ctx, 24, 96, 168, h, 14);
      OP.fs(ctx, 'rgba(40,22,12,.86)', OP.OUT, 3);
      OP.text(ctx, `יום ${m.round} מתוך ${OP.VS_ROUNDS}`, 180, 111, { size: 15, color: '#ffd79a', align: 'right' });
      shown.forEach((r, i) => {
        const y = 136 + i * 26;
        const rank = rows.indexOf(r) + 1;
        const mine = r.pid === net.pid;
        if (mine) {
          OP.rr(ctx, 29, y - 12, 158, 24, 9);
          ctx.fillStyle = 'rgba(255,215,154,.2)';
          ctx.fill();
        }
        OP.text(ctx, String(rank), 176, y + 1, { size: 15, color: '#ffd79a', dir: 'ltr' });
        ctx.beginPath();
        ctx.arc(158, y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = net.colorOf(r.pid);
        ctx.fill();
        OP.text(ctx, mine ? 'אתם' : net.nameOf(r.pid), 147, y + 1, { size: 15, color: '#fff', align: 'right' });
        OP.text(ctx, String(r.profit), 36, y + 1, { size: 17, color: mine ? '#ffd23a' : '#fff', dir: 'ltr', align: 'left' });
      });
    }
    OP.drawToasts(ctx, play, t);
    ctx.restore();
  };

  OP.drawToasts = (ctx, play, t, y0 = 150, step = 42) => {
    (play.toasts || []).slice(-3).forEach((x, i) => {
      const age = play.app.t - x.at;
      const a = Math.min(1, age * 5, (3 - age) * 3);
      if (a <= 0) return;
      const w = OP.textWidth(ctx, x.text, 20) + 40;
      const y = y0 + i * step;
      ctx.save();
      ctx.globalAlpha = a;
      OP.rr(ctx, 640 - w / 2, y, w, 36, 18);
      OP.fs(ctx, 'rgba(255,253,246,.97)', OP.OUT, 3);
      OP.text(ctx, x.text, 640, y + 19, { size: 20, color: OP.OUT });
      ctx.restore();
    });
  };

  OP.drawPartner = (ctx, play, t) => {
    if (play.mp.mode !== 'coop') return;
    const net = OP.Net;
    play.partnerPos = play.partnerPos || {};
    for (const [key, p] of Object.entries(play.partners)) {
      if (play.app.t - p.at > 2) continue;
      const pos = play.partnerPos[key] || (play.partnerPos[key] = { x: p.x, y: p.y });
      pos.x += (p.x - pos.x) * 0.35;
      pos.y += (p.y - pos.y) * 0.35;
      const { x, y } = pos;
      const pid = Number(key);
      const col = net.colorOf(pid);
      ctx.save();
      ctx.globalAlpha = 0.92;
      if (p.src === 'basket') OP.drawCroissant(ctx, x, y - 10, 0.8, { state: 'baked', noShadow: true });
      else if (p.src === 'juice') OP.drawJuiceBox(ctx, x, y - 10, 1.1);
      else if (p.src === 'cup') OP.drawCup(ctx, x, y - 10, 1, 1, true, t);
      else if (p.src === 'bag') OP.drawBagFlat(ctx, x, y - 10, 1.1, 0);
      else if (p.src === 'topping' && p.tid) OP.drawToppingIcon(ctx, x, y - 10, 1.3, p.tid);
      else if (p.src === 'board') OP.icon(ctx, 'bag', x, y - 12, 46);
      else if (p.src === 'spread') OP.drawSpatula(ctx, x, y, p.fill, t);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.strokeStyle = OP.OUT;
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = col;
      ctx.lineWidth = 4;
      ctx.stroke();
      const name = net.nameOf(pid);
      const w = OP.textWidth(ctx, name, 14) + 18;
      OP.rr(ctx, x - w / 2, y + 20, w, 22, 11);
      OP.fs(ctx, col, OP.OUT, 2.5);
      OP.text(ctx, name, x, y + 31, { size: 14, color: '#fff' });
    }
  };

  OP.drawMpOverlay = (ctx, play, t) => {
    if (!play.netLost) return;
    const app = play.app;
    app.ui.list = [];
    dim(ctx, 0.66);
    app.ui.add({ x: 0, y: 0, w: 1280, h: 720 }, () => {});
    OP.panel(ctx, 420, 230, 440, 270, { title: 'החיבור נותק', icon: 'players', titleW: 260 });
    OP.text(ctx, 'המארח יצא מהמשחק או שהאינטרנט נפל', 640, 330, { size: 22, weight: 700, color: OP.OUT });
    const b = { x: 510, y: 400, w: 260, h: 64 };
    OP.drawButton(ctx, b, 'חזרה לתפריט', { color: '#f59a23', size: 26, icon: 'home', hover: app.hover('lostBack', b) });
    app.ui.add(b, () => app.toTitle());
  };

  OP.drawCoopSummary = (ctx, app, t) => {
    const play = app.play;
    const r = play.coopResult;
    dim(ctx, 0.6);
    const at = play.viewT;
    const pop = OP.easeOutBack(Math.min(1, at * 3));
    ctx.save();
    ctx.translate(640, 360);
    ctx.scale(pop, pop);
    ctx.translate(-640, -360);
    OP.panel(ctx, 370, 80, 540, 570, { title: r ? `יום ${r.day} בפיטסרי המשותפת` : 'סוף היום', icon: 'players', titleW: 400 });
    if (!r) {
      OP.text(ctx, 'מחכים למארח' + dots(t), 640, 320, { size: 28, color: OP.OUT });
      ctx.restore();
      return;
    }
    const st = r.stats;
    const rows = [
      ['smile', 'לקוחות מרוצים', st.served],
      ['frown', 'לקוחות שעזבו', st.lost],
      ['coin', 'הכנסות', st.earned],
      ['heart', 'טיפים', st.tips],
    ];
    if (st.fines) rows.push(['receipt', 'קנסות', -st.fines]);
    rows.forEach(([icon, label, val], i) => {
      const y = 160 + i * 42;
      OP.rr(ctx, 402, y - 18, 476, 36, 10);
      ctx.fillStyle = i % 2 ? 'rgba(200,150,90,.12)' : 'rgba(200,150,90,.24)';
      ctx.fill();
      OP.icon(ctx, icon, 850, y, 28);
      OP.text(ctx, label, 828, y + 1, { size: 22, weight: 700, color: OP.OUT, align: 'right' });
      OP.text(ctx, String(val), 424, y, { size: 24, color: val < 0 ? '#d9483b' : '#2f7d3a', align: 'left', dir: 'ltr' });
    });
    const ty = 160 + rows.length * 42 + 20;
    OP.text(ctx, 'רווח היום', 790, ty, { size: 28, color: '#8a3d17' });
    OP.coinIcon(ctx, 620, ty, 17);
    OP.text(ctx, String(r.profit), 548, ty, { size: 38, color: '#f2a20c', stroke: OP.OUT, lw: 6, dir: 'ltr' });
    OP.rr(ctx, 420, ty + 36, 440, 50, 18);
    OP.fs(ctx, '#e3f5de', '#2f7d3a', 3);
    OP.iconText(ctx, 'moneyBag', `בקופה המשותפת: ${r.total} מטבעות`, 640, ty + 61, { size: 22, color: '#2f7d3a', iconSize: 26 });
    ctx.restore();
    if (at < 0.6) return;
    const nb = { x: 630, y: 570, w: 260, h: 62 };
    OP.drawButton(ctx, nb, 'לחנות השדרוגים', { color: '#f59a23', size: 24, icon: 'cart', t, hover: app.hover('coopShop', nb) });
    app.ui.add(nb, () => play.openShopScreen());
    const xb = { x: 410, y: 570, w: 200, h: 62 };
    OP.drawButton(ctx, xb, 'יציאה', { color: '#d9483b', size: 24, icon: 'home', hover: app.hover('coopExit', xb) });
    app.ui.add(xb, () => app.toTitle());
  };

  OP.drawVersusResult = (ctx, app, t) => {
    const play = app.play;
    const net = OP.Net;
    const round = play.mp.round;
    const last = round >= OP.VS_ROUNDS;
    const done = play.roundDone();
    dim(ctx, 0.6);
    const pop = OP.easeOutBack(Math.min(1, play.viewT * 3));
    ctx.save();
    ctx.translate(640, 360);
    ctx.scale(pop, pop);
    ctx.translate(-640, -360);
    OP.panel(ctx, 290, 70, 700, 590, { title: last && done ? 'תוצאות התחרות' : `סוף יום ${round} מתוך ${OP.VS_ROUNDS}`, icon: 'star', titleW: 380 });
    const me = play.finals[net.pid];
    if (!done) {
      OP.text(ctx, 'סיימתם את היום!', 640, 190, { size: 32, color: OP.OUT });
      OP.coinIcon(ctx, 730, 252, 22);
      OP.text(ctx, String(me ? me.profit : 0), 640, 254, { size: 48, color: '#f2a20c', stroke: OP.OUT, lw: 7, dir: 'ltr' });
      const waiting = play.activePlayers().filter((p) => !play.finals[p]).length;
      OP.text(ctx, `מחכים ל-${waiting} שחקנים שיסיימו` + dots(t), 640, 340, { size: 26, weight: 700, color: '#6b4a32' });
      ctx.restore();
      drawExit(ctx, app, 540, 560);
      return;
    }
    const list = play.standings();
    const myRank = list.findIndex((r) => r.pid === net.pid);
    if (last) {
      const win = myRank === 0;
      const title = win ? 'ניצחתם!' : `${net.nameOf(list[0].pid)} ניצח!`;
      const bounce = win ? Math.abs(Math.sin(t * 4)) * 8 : 0;
      OP.text(ctx, title, 640, 160 - bounce, { size: 52, color: win ? '#f2a20c' : '#4a90d9', stroke: OP.OUT, lw: 9 });
      if (win) for (let k = 0; k < 6; k++) OP.icon(ctx, 'sparkle', 640 + Math.cos(t * 2 + k) * 230, 160 + Math.sin(t * 2 + k) * 36, 22, { color: '#ffe59a' });
    } else {
      OP.text(ctx, myRank === 0 ? 'אתם מובילים!' : `אתם במקום ${myRank + 1}`, 640, 160, { size: 40, color: myRank === 0 ? '#f2a20c' : OP.OUT, stroke: myRank === 0 ? OP.OUT : null, lw: 7 });
    }
    // table: rank, player, today, total
    const top = 214;
    OP.text(ctx, 'שחקן', 858, top, { size: 18, color: '#8a6a4a', align: 'right' });
    OP.text(ctx, 'היום', 500, top, { size: 18, color: '#8a6a4a' });
    OP.text(ctx, 'סה״כ', 390, top, { size: 18, color: '#8a6a4a' });
    let rows = list.slice(0, 7);
    if (myRank >= 7) rows = rows.slice(0, 6).concat(list[myRank]);
    rows.forEach((r, i) => {
      const y = top + 40 + i * 42;
      const mine = r.pid === net.pid;
      const rank = list.indexOf(r) + 1;
      OP.rr(ctx, 330, y - 18, 620, 36, 12);
      OP.fs(ctx, mine ? '#fff1c7' : i % 2 ? 'rgba(200,150,90,.12)' : 'rgba(200,150,90,.24)', mine ? '#e8a317' : null, 3);
      if (rank === 1) OP.icon(ctx, 'star', 916, y, 30);
      else OP.text(ctx, String(rank), 916, y + 1, { size: 22, color: OP.OUT, dir: 'ltr' });
      ctx.beginPath();
      ctx.arc(880, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = net.colorOf(r.pid);
      ctx.fill();
      ctx.strokeStyle = OP.OUT;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      OP.text(ctx, mine ? 'אתם' : net.nameOf(r.pid), 858, y + 1, { size: 22, color: OP.OUT, align: 'right' });
      OP.text(ctx, String(r.round ? r.round.profit : 0), 500, y + 1, { size: 22, color: '#2f7d3a', dir: 'ltr' });
      OP.text(ctx, String(r.total), 390, y + 1, { size: 26, color: '#f2a20c', stroke: OP.OUT, lw: 5, dir: 'ltr' });
    });
    ctx.restore();
    if (play.viewT < 0.5) return;
    if (!last) {
      const sb = { x: 650, y: 574, w: 250, h: 62 };
      OP.drawButton(ctx, sb, 'לחנות השדרוגים', { color: '#f59a23', size: 24, icon: 'cart', t, hover: app.hover('vsShop', sb) });
      app.ui.add(sb, () => play.openShopScreen());
      drawExit(ctx, app, 400, 574);
    } else {
      if (play.mp.role === 'host') {
        const rb = { x: 650, y: 574, w: 240, h: 62 };
        OP.drawButton(ctx, rb, 'משחק חוזר', { color: '#4cb050', size: 26, icon: 'refresh', hover: app.hover('rematch', rb) });
        app.ui.add(rb, () => app.hostStartMatch());
      } else {
        OP.text(ctx, 'המארח יכול להתחיל משחק חוזר', 770, 605, { size: 20, weight: 700, color: '#fff', stroke: OP.OUT, lw: 5 });
      }
      drawExit(ctx, app, 400, 574);
    }
  };

  function drawExit(ctx, app, x, y) {
    const xb = { x, y, w: 200, h: 62 };
    OP.drawButton(ctx, xb, 'יציאה', { color: '#d9483b', size: 24, icon: 'home', hover: app.hover('vsExit', xb) });
    app.ui.add(xb, () => app.toTitle());
  }
})();
