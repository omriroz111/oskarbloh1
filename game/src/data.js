// הפיטסרי של אוסקר — static data: layout, menu, upgrades, tips, tutorial
var OP = globalThis.OP || (globalThis.OP = {});

OP.TITLE = 'הפיטסרי של אוסקר';

// Every station's rectangle on the 1280x720 stage; art, input and logic all read this.
OP.L = {
  oven: { x: 196, y: 176, w: 196, h: 238 },
  ovenWrench: { x: 364, y: 198 },
  dough: { x: 204, y: 446, w: 196, h: 120 },
  basket: { x: 410, y: 440, w: 124, h: 108 },
  trays: {
    choc: { x: 542, y: 446, w: 76, h: 80 },
    pist: { x: 622, y: 446, w: 76, h: 80 },
    vanilla: { x: 702, y: 446, w: 76, h: 80 },
    cream: { x: 782, y: 446, w: 76, h: 80 },
    sugar: { x: 864, y: 450, w: 76, h: 74 },
    almond: { x: 944, y: 450, w: 76, h: 74 },
  },
  juice: { x: 1030, y: 436, w: 110, h: 112 },
  coffee: { x: 1092, y: 216, w: 172, h: 200 },
  coffeeWrench: { x: 1236, y: 238 },
  cupX: [1134, 1180, 1226],
  cupY: 376,
  boards: [
    { x: 428, y: 566, w: 172, h: 84 },
    { x: 612, y: 566, w: 172, h: 84 },
    { x: 796, y: 566, w: 172, h: 84 },
  ],
  bags: { x: 984, y: 566, w: 92, h: 84 },
  trash: { x: 1156, y: 552, w: 92, h: 104 },
  ledgeY: 404,
  prepPanel: { x: 430, y: 124, w: 420, h: 224 },
  openBtn: { x: 540, y: 262, w: 200, h: 56 },
  pauseBtn: { x: 1214, y: 16, w: 52, h: 52 },
  muteBtn: { x: 1214, y: 76, w: 52, h: 52 },
  coinHud: { x: 1176, y: 43 },
  oscar: { x: 104, y: 318 },
};

OP.refillPos = (id) => {
  const L = OP.L;
  if (id === 'dough') return { x: L.dough.x + 16, y: L.dough.y + 14 };
  if (id === 'juice') return { x: L.juice.x + L.juice.w - 10, y: L.juice.y + 10 };
  const r = L.trays[id];
  return { x: r.x + r.w - 8, y: r.y + 8 };
};

OP.ovenSlotPos = (shop, i) => {
  const r = OP.L.oven;
  const cols = shop.oven.slots.length === 6 ? 3 : 2;
  const col = i % cols;
  const row = Math.floor(i / cols);
  return { x: r.x + 16 + (col + 0.5) * (164 / cols), y: r.y + 96 + row * 72, s: cols === 3 ? 0.4 : 0.52 };
};

OP.FILLINGS = {
  choc: { name: 'שוקולד', color: '#6b3a1e', light: '#9b5b33' },
  pist: { name: 'פיסטוק', color: '#86b845', light: '#b7dc78' },
  vanilla: { name: 'וניל', color: '#f1d06a', light: '#fff0b4' },
  cream: { name: 'קרם', color: '#f2ddb0', light: '#fffbef' },
};
OP.FILLING_IDS = ['choc', 'pist', 'vanilla', 'cream'];
OP.TOPPINGS = {
  sugar: { name: 'אבקת סוכר' },
  almond: { name: 'שקדים' },
};
OP.TRAY_IDS = ['choc', 'pist', 'vanilla', 'cream', 'sugar', 'almond'];

OP.CATS = [
  { id: 'kitchen', name: 'מטבח', icon: 'oven' },
  { id: 'ingredients', name: 'חומרי גלם', icon: 'butter' },
  { id: 'ads', name: 'פרסום', icon: 'megaphone' },
];

OP.UPGRADES = [
  { id: 'cutter', cat: 'kitchen', name: 'חותכן בצק', icon: 'knife', levels: [{ price: 200, desc: 'חיתוך אחד לכל קרואסון' }, { price: 2000, desc: 'חותך ומכניס לתנור לבד' }] },
  { id: 'ovenSpeed', cat: 'kitchen', name: 'תנור מהיר', icon: 'fire', levels: [{ price: 300, desc: 'אפייה ב-8 שניות במקום 12' }, { price: 1500, desc: 'אפייה ב-5 שניות' }] },
  { id: 'ovenBig', cat: 'kitchen', name: 'תנור גדול', icon: 'oven', levels: [{ price: 900, desc: '6 מקומות בתנור במקום 4' }] },
  { id: 'thermo', cat: 'kitchen', name: 'טרמוסטט חכם', icon: 'thermo', levels: [{ price: 1200, desc: 'קרואסונים כבר לא נשרפים' }] },
  { id: 'basket', cat: 'kitchen', name: 'סל גדול', icon: 'basket', levels: [{ price: 400, desc: 'הסל מחזיק 12 קרואסונים' }] },
  { id: 'coffee', cat: 'kitchen', name: 'מכונת קפה', icon: 'cup', levels: [{ price: 600, desc: 'לקוחות יזמינו גם קפה' }, { price: 1400, desc: 'מזיגה מהירה ו-3 כוסות' }] },
  { id: 'wrapper', cat: 'kitchen', name: 'שקיות משובחות', icon: 'bag', levels: [{ price: 700, desc: 'פחות סיבובים לעטיפה' }, { price: 2400, desc: 'העטיפה לא מתפרקת' }] },
  { id: 'helper', cat: 'kitchen', name: 'עוזר מילוי', icon: 'chefHat', levels: [{ price: 700, desc: 'מילוי מגש ב-2 שניות' }, { price: 2400, desc: 'ממלא מגשים ריקים לבד' }] },
  { id: 'trays', cat: 'kitchen', name: 'מגשים גדולים', icon: 'tray', levels: [{ price: 500, desc: '50% יותר מנות בכל מגש' }] },
  { id: 'register', cat: 'kitchen', name: 'קופה אוטומטית', icon: 'moneyBag', levels: [{ price: 1800, desc: 'המטבעות נאספים לבד' }] },
  { id: 'alarm', cat: 'kitchen', name: 'אזעקה', icon: 'siren', levels: [{ price: 900, desc: 'גנבים רצים לאט יותר' }] },
  { id: 'flytrap', cat: 'kitchen', name: 'מלכודת זבובים', icon: 'flytrap', levels: [{ price: 700, desc: 'פחות זבובים, והם מתים לבד' }] },
  { id: 'vacuum', cat: 'kitchen', name: 'שואב פירורים', icon: 'broom', levels: [{ price: 800, desc: 'פירורים נעלמים לאט לבד' }] },
  { id: 'counter', cat: 'kitchen', name: 'דלפק רחב', icon: 'stool', levels: [{ price: 1200, desc: '4 לקוחות בדלפק' }, { price: 3500, desc: '5 לקוחות בדלפק' }] },

  { id: 'butter', cat: 'ingredients', name: 'חמאה צרפתית', icon: 'butter', levels: [{ price: 400, desc: 'כל קרואסון שווה +2' }, { price: 1600, desc: 'כל קרואסון שווה +4' }] },
  { id: 'choc', cat: 'ingredients', name: 'שוקולד בלגי', icon: 'chocolate', levels: [{ price: 500, desc: 'מילוי שוקולד שווה +3' }] },
  { id: 'sugar', cat: 'ingredients', name: 'אבקת סוכר', icon: 'sugar', levels: [{ price: 200, desc: 'תוספת חדשה: אבקת סוכר' }] },
  { id: 'pist', cat: 'ingredients', name: 'קרם פיסטוק', icon: 'pistachio', levels: [{ price: 450, desc: 'מילוי חדש: פיסטוק' }] },
  { id: 'almond', cat: 'ingredients', name: 'שקדים קלויים', icon: 'almond', levels: [{ price: 350, desc: 'תוספת חדשה: שקדים' }] },
  { id: 'vanilla', cat: 'ingredients', name: 'קרם וניל', icon: 'vanilla', levels: [{ price: 700, desc: 'מילוי חדש: וניל' }] },
  { id: 'cream', cat: 'ingredients', name: 'קרם פיטסרי', icon: 'cream', levels: [{ price: 900, desc: 'מילוי חדש ששווה +2' }] },
  { id: 'orange', cat: 'ingredients', name: 'תפוזים טריים', icon: 'orange', levels: [{ price: 300, desc: 'מיץ תפוזים שווה +2' }] },

  { id: 'flyers', cat: 'ads', name: 'פליירים בשכונה', icon: 'flyer', levels: [{ price: 250, desc: '15% יותר לקוחות' }] },
  { id: 'neon', cat: 'ads', name: 'שלט ניאון', icon: 'bulb', levels: [{ price: 1000, desc: 'עוד 15% לקוחות וטיפים גדולים' }] },
  { id: 'insta', cat: 'ads', name: 'האינסטגרם של אוסקר', icon: 'camera', levels: [{ price: 2500, desc: 'עוד 20% לקוחות ופי 2 VIP' }] },
  { id: 'paper', cat: 'ads', name: 'ביקורת בעיתון', icon: 'newspaper', levels: [{ price: 4000, desc: 'טיפים כפולים ומוניטין עולה מהר' }] },
];

// persist: where the save lives (the personal save by default; multiplayer passes its own or null)
OP.buyUpgrade = (save, id, persist = OP.writeSave) => {
  const u = OP.UPGRADES.find((x) => x.id === id);
  const lvl = save.upgrades[id] || 0;
  if (!u || lvl >= u.levels.length) return false;
  const price = u.levels[lvl].price;
  if (save.coins < price) return false;
  save.coins -= price;
  save.upgrades[id] = lvl + 1;
  if (persist) persist(save);
  return true;
};

// One-time explanations Oscar gives the first time something happens.
OP.TIPS = {
  ready: 'הקרואסונים מוכנים! לחצו על התנור כדי להוציא אותם לסל',
  burnt: 'אוי! קרואסון נשרף. העשן מעצבן את הלקוחות, לחצו על התנור כדי לזרוק אותו',
  coins: 'אל תשכחו לאסוף את המטבעות מהדלפק!',
  juice: 'מישהו רוצה מיץ תפוזים! גררו קופסת מיץ ישר אליו',
  coffee: 'לחצו על מכונת הקפה כדי למזוג, ואז גררו את הכוס ללקוח',
  patience: 'לקוח עזב בכעס… המוניטין ירד. שימו לב למד הסבלנות!',
  wrongOrder: 'זה לא מה שהוא הזמין! בדקו את הכרטיס מעל הראש שלו',
  fallApart: 'העטיפה התפרקה! סובבו במעגלים בלי להרים את האצבע עד שהשקית נסגרת',
  fly: 'זבוב! לחצו עליו כדי להעיף אותו לפני שהוא נוחת על האוכל',
  dirtyTray: 'הזבוב לכלך את המגש, צריך למלא אותו מחדש',
  thief: 'גנב! לחצו עליו מהר כדי לתפוס אותו לפני שהוא בורח!',
  vip: 'לקוח VIP! הוא משלם פי 3, אבל רק על מנה מושלמת',
  dvir: 'דביר הגיע! הוא רעב במיוחד ומזמין הרבה, אבל משאיר טיפ שמן',
  binyamin: 'בנימין זורק סוכריות על הפיטסרי! תביאו לו קרואסון והוא יפסיק וילך',
  inspector: 'מפקח תברואה! נקו פירורים והעיפו זבובים לפני שהוא מסיים לבדוק',
  crumbs: 'פירורים על הדלפק! החליקו עליהם עם האצבע כדי לנקות',
  trayLow: 'מגש כמעט ריק! לחצו על כפתור המילוי',
  doughEmpty: 'נגמר הבצק! לחצו על כפתור המילוי כדי לרדד בצק חדש',
  newFilling: 'יש לנו מילוי חדש בתפריט! בדקו טוב כל הזמנה',
  combo: 'רצף! כל לקוח מרוצה ברצף מגדיל את הטיפים',
};

// Day 1 walkthrough. Each step waits for its condition before moving on.
OP.TUTORIAL = [
  { phase: 'prep', target: 'fix_oven', text: 'בונז׳ור! אני אוסקר. לפני שפותחים בודקים את הציוד. התנור מקולקל: החזיקו לחוץ על המפתח כדי לתקן', done: (s) => !s.oven.fault },
  { phase: 'prep', target: 'dough', text: 'עכשיו אופים! החליקו את האצבע על הבצק כמה פעמים כדי לחתוך קרואסון', done: (s) => s.flags.baked },
  { phase: 'prep', target: 'refill_choc', text: 'בזמן שהוא נאפה, נמלא את המגשים. לחצו על כפתור המילוי של השוקולד', done: (s) => s.trays.choc.refillT > 0 || s.trays.choc.amount === s.trays.choc.max },
  { phase: 'prep', target: 'oven', text: 'כשהקרואסון מזהיב, לחצו על התנור כדי להוציא אותו לסל. אל תחכו יותר מדי, הוא נשרף!', done: (s) => s.flags.ovenCollected },
  { phase: 'prep', target: 'openBtn', text: 'הכל מוכן! לחצו על "פתיחה" כדי לפתוח את הפיטסרי', done: (s) => s.phase === 'shift' },
  { phase: 'shift', target: 'basket', text: 'לקוחה ראשונה! היא רוצה קרואסון שוקולד. גררו קרואסון מהסל אל קרש העבודה', done: (s) => s.flags.placed },
  { phase: 'shift', target: 'board', text: 'החליקו את האצבע לרוחב הקרואסון כדי לפתוח אותו', done: (s) => s.flags.sliced },
  { phase: 'shift', target: 'choc', text: 'גררו שוקולד מהמגש אל הקרואסון ומרחו: ימינה ושמאלה, ימינה ושמאלה!', done: (s) => s.flags.spread },
  { phase: 'shift', target: 'bags', text: 'גררו שקית נייר אל הקרואסון', done: (s) => s.flags.bagged },
  { phase: 'shift', target: 'board', text: 'סובבו את האצבע במעגלים על הקרואסון כדי לעטוף. אל תעזבו באמצע, זה מתפרק!', done: (s) => s.flags.wrapped },
  { phase: 'shift', target: 'customer', text: 'גררו את הקרואסון העטוף אל הלקוחה', done: (s) => s.flags.served },
  { phase: 'shift', target: 'coins', text: 'היא שילמה! לחצו על המטבעות כדי לאסוף אותם', done: (s) => s.flags.collected },
  { phase: 'shift', target: null, text: 'מצוין! עכשיו מגיעים עוד לקוחות. שימו לב למד הסבלנות שלהם. בהצלחה!', done: (s) => s.tutT > 5 },
];

OP.makeLook = (type, rng = Math.random) => {
  const pick = (a) => a[Math.floor(rng() * a.length)];
  const rand = (a, b) => a + rng() * (b - a);
  const skins = ['#f7d2b3', '#eab58c', '#d39a6c', '#b5774d', '#8a5534', '#f2c6a0'];
  const hairs = ['#2a1b12', '#4f3321', '#7a4a24', '#c98a3b', '#e0b865', '#a23b1d', '#1d1d24', '#8f8f8f'];
  const shirts = ['#e5534b', '#4a90d9', '#f2b134', '#58b368', '#9b6bd3', '#ee7fb0', '#3fb6b0', '#f07f3c'];
  const styles = ['short', 'bob', 'bun', 'curly', 'bald', 'long', 'spiky', 'cap', 'pony'];
  const L = {
    skin: pick(skins),
    hair: pick(hairs),
    shirt: pick(shirts),
    style: pick(styles),
    glasses: rng() < 0.25,
    beard: rng() < 0.15,
    mustache: rng() < 0.15,
    earrings: rng() < 0.2,
    blush: rng() < 0.5,
    headW: rand(35, 41),
    headH: rand(41, 47),
    bodyW: rand(62, 76),
    eyeGap: rand(13, 16),
  };
  if (type === 'vip') Object.assign(L, { shirt: '#5a2d82', suit: true, shades: true, glasses: false, bow: '#f2c230', style: pick(['short', 'bob', 'spiky']) });
  if (type === 'inspector') Object.assign(L, { shirt: '#8c8f7a', coat: true, glasses: true, style: 'fedora', mustache: true, beard: false, hair: '#5b4636' });
  // דביר: the rare big eater, drawn larger and rounder than everyone else
  // בנימין (from his photo): bald, grey beard, round glasses, black polo with yellow trim, a watch.
  // He throws candy at the shop until he gets a croissant.
  if (type === 'binyamin') Object.assign(L, { name: 'בנימין', scale: 1, headW: 41, headH: 46, bodyW: 84, eyeGap: 15, skin: '#c99a72', hair: '#aaa49b', shirt: '#29292e', polo: '#e6dc6a', watch: true, style: 'bald', glasses: true, beard: true, mustache: true, blush: false, freckles: false, stubble: false, earrings: false });
  if (type === 'dvir') Object.assign(L, { name: 'דביר', scale: 1.14, big: true, headW: 56, headH: 50, bodyW: 140, eyeGap: 18, skin: '#eab58c', hair: '#2a1b12', shirt: '#e5534b', style: 'short', stubble: false, blush: true, glasses: false, beard: false, mustache: false, earrings: false });
  if (type === 'thief') Object.assign(L, { shirt: '#3a3f4b', hood: true, shades: rng() < 0.5, glasses: false, stubble: true, style: 'hood' });
  return L;
};
