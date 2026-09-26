// ロゴ試作3案（確認用）。既存サイトからは読み込まれない。
// Voluntell 本体は images/voluntell-wordmark.png（正式ロゴからタグラインを除いたもの）をそのまま使用。
// 「インターンシップNAVI」側のみ新規デザイン。文字はWebフォント（Google Fonts）で描画している。

const BRAND = { gray: '#6E6260', coral: '#F27256', yellow: '#FDB920' };
const WORDMARK = 'images/voluntell-wordmark.png'; // 1746x486 → 174.6x48.6 に縮小して配置
let uid = 0;

// 3次ベジェの連なり（中心線）を、幅 w(u) の帯（左端は細く、右へ太く）にして SVG パスで返す
function tapered(segments, maxW) {
  const pts = [];
  const N = 40;
  segments.forEach(([p0, p1, p2, p3], si) => {
    for (let i = si === 0 ? 0 : 1; i <= N; i++) {
      const t = i / N, m = 1 - t;
      pts.push([
        m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  });
  const left = [], right = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const u = i / (pts.length - 1);
    const w = (maxW / 2) * (0.05 + 0.95 * Math.sin(Math.min(u / 0.6, 1) * Math.PI / 2));
    left.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
    right.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
  });
  const f = q => q[0].toFixed(2) + ' ' + q[1].toFixed(2);
  return 'M' + left.map(f).join(' L') + ' L' + right.reverse().map(f).join(' L') + ' Z';
}

const LOGOS = {
  // A案：「つながる」— 鎖の輪（コーラル×イエロー）で Voluntell と NAVI をつなぐ
  A: {
    name: 'A案　つながる',
    vbw: 500, vbh: 50, jpSize: 21.5,
    svg() {
      const id = 'clipA' + (uid++);
      const { gray, coral, yellow } = BRAND;
      const cy = 36.5;
      return `
        <image href="${WORDMARK}" x="0" y="0" width="174.6" height="48.6"/>
        <defs><clipPath id="${id}"><rect x="180" y="${cy}" width="60" height="30"/></clipPath></defs>
        <g fill="none" stroke-width="3.6">
          <ellipse cx="200" cy="${cy}" rx="10" ry="7.5" stroke="${yellow}"/>
          <ellipse cx="214" cy="${cy}" rx="10" ry="7.5" stroke="${coral}"/>
          <ellipse cx="200" cy="${cy}" rx="10" ry="7.5" stroke="${yellow}" clip-path="url(#${id})"/>
        </g>
        <text x="238" y="45.5" font-family="'Zen Maru Gothic','Yu Gothic',Meiryo,sans-serif" font-weight="700" font-size="21.5" fill="${gray}" textLength="172" lengthAdjust="spacing">インターンシップ</text>
        <text x="418" y="46.5" font-family="'Fredoka','Arial Rounded MT Bold',Arial,sans-serif" font-weight="600" font-size="31" fill="${coral}" textLength="80" lengthAdjust="spacing">NAVI</text>`;
    },
  },

  // B案：「NAVI・道・方向」— NAVI の A をナビゲーション矢印にした手描き幾何文字＋↗の矢印
  B: {
    name: 'B案　NAVI・道・方向',
    vbw: 346, vbh: 48.6, jpSize: 14.5,
    svg() {
      const { gray, coral, yellow } = BRAND;
      return `
        <image href="${WORDMARK}" x="0" y="0" width="174.6" height="48.6"/>
        <g fill="none" stroke="${yellow}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M190 43 L206 27 M195.5 27 H206 V37.5"/>
        </g>
        <text x="226" y="13.5" font-family="'Zen Kaku Gothic New','Yu Gothic',Meiryo,sans-serif" font-weight="700" font-size="14.5" fill="${gray}" textLength="116" lengthAdjust="spacing">インターンシップ</text>
        <g fill="none" stroke="${coral}" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M228.7 45 V22.5 L246 45 V22.5"/>
          <path d="M297 22.5 L308 45 L319 22.5"/>
          <path d="M338.5 22.5 V45"/>
        </g>
        <path d="M274 21 L285.5 45 L274 38 L262.5 45 Z" fill="${yellow}" stroke="${yellow}" stroke-width="3.2" stroke-linejoin="round"/>`;
    },
  },

  // C案（新）：Voluntell のリンクシンボル（イエローの尾）から一本の道が生まれ、NAVI の下をくぐって、先で学生（人）になる
  C: {
    name: 'C案　つながり→道→NAVI→学生（新）',
    vbw: 368, vbh: 60, jpSize: 15.5,
    svg() {
      const id = 'routeC' + (uid++);
      const { gray, coral, yellow } = BRAND;
      return `
        <defs>
          <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="88" y1="0" x2="347" y2="0">
            <stop offset="0" stop-color="${yellow}"/>
            <stop offset="0.25" stop-color="${coral}"/>
            <stop offset="0.8" stop-color="${coral}"/>
            <stop offset="1" stop-color="${yellow}"/>
          </linearGradient>
        </defs>
        <image href="${WORDMARK}" x="0" y="0" width="174.6" height="48.6"/>
        <text x="192" y="13" font-family="'Zen Maru Gothic','Yu Gothic',Meiryo,sans-serif" font-weight="700" font-size="15.5" fill="${gray}" textLength="124" lengthAdjust="spacing">インターンシップ</text>
        <text x="192" y="47.5" font-family="'Nunito','Arial Rounded MT Bold',Arial,sans-serif" font-weight="800" font-size="42" fill="${coral}" textLength="124" lengthAdjust="spacing">NAVI</text>
        <path d="M91.96 42.24 L90.9 43.3 L87.6 46.6 C85.3 48.9 86.2 54.2 92.5 54.2 H304 C330 54.2 344 46 346 33" fill="none" stroke="url(#${id})" stroke-width="6"/>
        <circle cx="346" cy="33" r="3" fill="${yellow}"/>
        <path d="M346 38.5 L357 28.5" fill="none" stroke="${yellow}" stroke-width="5" stroke-linecap="round"/>
        <circle cx="348.8" cy="22" r="5.4" fill="${yellow}"/>`;
    },
  },

  // 採用候補案D：Voluntell ｜ インターンシップ / NAVI。NAVI の下から伸びるイエローの道が、右上向きのコーラルの矢印になる
  D: {
    name: '採用候補　Voluntell｜インターンシップ NAVI',
    vbw: 368, vbh: 62, jpSize: 15,
    svg() {
      const { gray, coral, yellow } = BRAND;
      // 道：左端は細く、右へ向かって太くなる一枚の形（2本のベジェをつないだ中心線を、幅を変えながら両側へ広げる）
      const road = tapered([
        [[212, 57.5], [252, 61], [292, 60.5], [322, 57]],
        [[322, 57], [342, 55], [334.6, 36], [350.2, 19.8]],
      ], 6.2);
      return `
        <image href="${WORDMARK}" x="0" y="0" width="174.6" height="48.6"/>
        <line x1="191" y1="6" x2="191" y2="47" stroke="${gray}" stroke-opacity="0.55" stroke-width="1.5" stroke-linecap="round"/>
        <text x="208" y="13.5" font-family="'Zen Kaku Gothic New','Yu Gothic',Meiryo,sans-serif" font-weight="700" font-size="15" fill="${gray}" textLength="120" lengthAdjust="spacing">インターンシップ</text>
        <text x="206" y="47.5" font-family="'Poppins','Arial Black',Arial,sans-serif" font-weight="800" font-style="italic" font-size="40" fill="${coral}" textLength="122" lengthAdjust="spacing">NAVI</text>
        <path d="${road}" fill="${yellow}"/>
        <path d="M364 6 L336.8 15.6 L350.2 19.8 L354.4 33.2 Z" fill="${coral}" stroke="${coral}" stroke-width="2.2" stroke-linejoin="round"/>`;
    },
  },
};


function logoSVG(key, widthPx) {
  const L = LOGOS[key];
  const h = (widthPx * L.vbh) / L.vbw;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.vbw} ${L.vbh}" width="${widthPx}" height="${h}" role="img" aria-label="Voluntell インターンシップNAVI">${L.svg()}</svg>`;
}
