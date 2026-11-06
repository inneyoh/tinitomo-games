// Placeholder art, drawn as inline SVG so the prototype needs no files.
// To use real art later: put an image in assets/img/ and add its path to
// ASSET_OVERRIDES below, e.g. 'product:rose_perfume': 'assets/img/rose-perfume.webp'.
import { FLOWERS, PRODUCTS } from './data.js';

export const ASSET_OVERRIDES = {
  // 'product:chamomile_tea': 'assets/img/chamomile-tea.webp',
  // 'flower:rose': 'assets/img/rose.webp',
  // 'customer:bunny': 'assets/img/bunny.webp',
  // 'decor:fern': 'assets/img/fern.webp',
};

const OL = '#6B4A36';
const S = `stroke="${OL}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const svg = (body, vb = '0 0 100 100') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

function petalRing(cx, cy, r, n, len, w, color) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (360 / n) * i;
    out += `<ellipse cx="${cx}" cy="${cy - r - len / 2 + 4}" rx="${w}" ry="${len / 2}" fill="${color}" ${S} transform="rotate(${a} ${cx} ${cy})"/>`;
  }
  return out;
}

function flowerHead(key, cx = 50, cy = 46, scale = 1) {
  const f = FLOWERS[key];
  const g = (b) => `<g transform="translate(${cx} ${cy}) scale(${scale}) translate(-50 -46)">${b}</g>`;
  if (f.leaf) {
    return g(`<path d="M50 78 C30 70 26 40 50 18 C74 40 70 70 50 78Z" fill="${f.petal}" ${S}/>
      <path d="M50 74 L50 32" fill="none" ${S} stroke-width="2.5"/>
      <path d="M36 52 C26 48 22 34 30 24 C40 30 42 42 36 52Z" fill="${f.center}" ${S}/>`);
  }
  if (f.spike) {
    let b = `<path d="M50 84 L50 30" ${S} fill="none"/>`;
    for (let i = 0; i < 6; i++) {
      const y = 26 + i * 8;
      b += `<ellipse cx="${44}" cy="${y}" rx="7" ry="5" fill="${i % 2 ? f.center : f.petal}" ${S} stroke-width="2.5"/>
            <ellipse cx="${56}" cy="${y + 3}" rx="7" ry="5" fill="${i % 2 ? f.petal : f.center}" ${S} stroke-width="2.5"/>`;
    }
    return g(b);
  }
  if (f.cluster) {
    let b = `<circle cx="50" cy="46" r="28" fill="${f.petal}" ${S}/>`;
    const pts = [[38, 36], [52, 30], [64, 40], [42, 52], [58, 54], [50, 42], [34, 48], [66, 52], [48, 62]];
    pts.forEach(([x, y], i) => {
      b += `<g transform="translate(${x} ${y})">${[0, 90, 180, 270].map(a =>
        `<ellipse cx="0" cy="-4" rx="3.4" ry="4.2" fill="${i % 3 === 0 ? f.center : '#D3E0F2'}" stroke="${OL}" stroke-width="1.4" transform="rotate(${a})"/>`).join('')}</g>`;
    });
    return g(b);
  }
  if (f.fruit) {
    return g(`<path d="M50 78 C30 72 24 46 32 36 C40 28 60 28 68 36 C76 46 70 72 50 78Z" fill="${f.petal}" ${S}/>
      ${[[40, 46], [56, 44], [48, 56], [38, 60], [60, 58], [50, 68]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.6" fill="#F8E7B8"/>`).join('')}
      <path d="M50 34 L38 24 L46 32 L40 18 L50 30 L60 18 L54 32 L62 24Z" fill="${f.center}" ${S} stroke-width="2.5"/>`);
  }
  if (f.rose) {
    return g(`<circle cx="50" cy="46" r="27" fill="${f.petal}" ${S}/>
      <path d="M50 30 C64 30 68 46 58 54 C50 60 38 54 40 44 C42 36 52 36 54 44" fill="none" ${S}/>
      <path d="M28 52 C34 66 66 68 72 52" fill="none" ${S}/>`);
  }
  return g(petalRing(50, 46, 8, f.petals, 26, f.petals > 8 ? 5.5 : 8, f.petal) +
    `<circle cx="50" cy="46" r="11" fill="${f.center}" ${S}/>`);
}

export function flowerArt(key) {
  return svg(`<path d="M50 70 C48 80 50 88 50 96" fill="none" ${S}/>
    <path d="M50 84 C40 78 34 80 30 86 C38 92 46 90 50 84Z" fill="#A9C79A" ${S} stroke-width="2.5"/>
    ${flowerHead(key, 50, 42, 0.9)}`);
}

export function seedArt(key) {
  const f = FLOWERS[key];
  return svg(`<path d="M22 24 L78 24 L74 90 L26 90 Z" fill="#EAD9BD" ${S}/>
    <path d="M22 24 L78 24 L76 34 L24 34Z" fill="#D9C3A0" ${S}/>
    <circle cx="50" cy="60" r="20" fill="#FBF6EC" ${S} stroke-width="2.5"/>
    ${flowerHead(key, 50, 60, 0.38)}`);
}

function teaTin(p) {
  return `<rect x="26" y="26" width="48" height="64" rx="8" fill="${p.color}" ${S}/>
    <rect x="22" y="16" width="56" height="14" rx="5" fill="#E9D7B8" ${S}/>
    <rect x="32" y="44" width="36" height="30" rx="6" fill="#FBF6EC" ${S} stroke-width="2.5"/>`;
}
function perfumeBottle(p) {
  return `<rect x="42" y="12" width="16" height="14" rx="4" fill="#E9D7B8" ${S}/>
    <rect x="46" y="24" width="8" height="8" fill="#F6EEDF" ${S} stroke-width="2.5"/>
    <path d="M26 54 C26 36 74 36 74 54 L74 78 C74 90 26 90 26 78Z" fill="${p.color}" ${S}/>
    <path d="M34 50 C36 44 44 42 48 42" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    <path d="M58 36 C70 30 80 36 78 44 C72 46 64 42 58 36Z" fill="#F2B8C0" ${S} stroke-width="2.5"/>`;
}
function bouquet(p) {
  const heads = p.flowers.map((k, i) => flowerHead(k, 30 + i * 20, 32 + (i === 1 ? -6 : 4), 0.36)).join('');
  return `${heads}<path d="M24 46 L76 46 L58 92 L42 92Z" fill="#F6EEDF" ${S}/>
    <path d="M24 46 L50 56 L76 46" fill="none" ${S} stroke-width="2.5"/>
    <path d="M40 70 C30 64 30 78 40 74 M60 70 C70 64 70 78 60 74" fill="#EBA9AE" ${S} stroke-width="2.5"/>
    <circle cx="50" cy="72" r="4" fill="#EBA9AE" ${S} stroke-width="2.5"/>`;
}

export function productArt(key) {
  const p = PRODUCTS[key];
  if (p.cat === 'tea') {
    const icon = key === 'chamomile_tea' ? flowerHead('chamomile', 50, 59, 0.3)
      : key === 'mint_tea' ? flowerHead('mint', 50, 60, 0.32)
      : key === 'strawberry_tea' ? flowerHead('strawberry', 50, 60, 0.32)
      : flowerHead('lavender', 50, 60, 0.3);
    return svg(teaTin(p) + icon);
  }
  if (p.cat === 'perfume') return svg(perfumeBottle(p));
  return svg(bouquet(p));
}

export const coinArt = () => svg(`<circle cx="50" cy="50" r="38" fill="#F3D98B" ${S}/>
  <circle cx="50" cy="50" r="27" fill="none" stroke="#D9B65E" stroke-width="3"/>
  ${petalRing(50, 50, 4, 5, 14, 6, '#FBF1C9')}<circle cx="50" cy="50" r="6" fill="#E8B04A" ${S} stroke-width="2"/>`);

export const parcelArt = (stage = 3) => svg(`
  <rect x="18" y="38" width="64" height="48" rx="6" fill="#E9D7B8" ${S}/>
  ${stage >= 1 ? `<rect x="18" y="38" width="64" height="48" rx="6" fill="#F6E3E3" ${S}/><path d="M18 52 L82 52" ${S}/>` : `<rect x="14" y="30" width="72" height="14" rx="4" fill="#DCC7A3" ${S}/>`}
  ${stage >= 2 ? `<rect x="45" y="38" width="10" height="48" fill="#EBA9AE" ${S} stroke-width="2.5"/>
    <path d="M50 36 C36 18 26 30 36 38 C42 40 48 38 50 36 C52 38 58 40 64 38 C74 30 64 18 50 36Z" fill="#EBA9AE" ${S}/>` : ''}
  ${stage >= 3 ? `<path d="M64 60 L80 64 L76 80 L60 76Z" fill="#FBF6EC" ${S} stroke-width="2.5"/>` : ''}`);

export const canArt = () => svg(`<path d="M26 40 L70 40 L66 86 L30 86Z" fill="#A9BE94" ${S}/>
  <path d="M70 52 C86 52 86 74 68 76" fill="none" ${S} stroke-width="6"/><path d="M70 52 C86 52 86 74 68 76" fill="none" stroke="#A9BE94" stroke-width="2"/>
  <path d="M28 54 L10 34 L4 38" fill="none" ${S} stroke-width="6"/><path d="M28 54 L10 34" stroke="#A9BE94" stroke-width="2"/>
  <ellipse cx="6" cy="34" rx="5" ry="8" fill="#F6EEDF" ${S} stroke-width="2.5" transform="rotate(-40 6 34)"/>
  ${petalRing(48, 63, 3, 5, 10, 4, '#FBF6EC')}<circle cx="48" cy="63" r="4" fill="#F2C94C"/>`);

// --- Customers (sprites borrowed from Momo's Ramen Shop) -----------------
export const customerSrc = (c, upset = false) => `assets/img/customers/cu_${c.id}${upset ? '_upset' : ''}.webp`;

export const bagArt = (stage = 0) => svg(`
  <path d="M22 34 L78 34 L82 92 L18 92Z" fill="#E6CFA8" ${S}/>
  ${stage >= 1 ? `<path d="M22 34 L78 34 L76 46 L24 46Z" fill="#D9BE93" ${S} stroke-width="2.5"/><circle cx="50" cy="44" r="7" fill="#EBA9AE" ${S} stroke-width="2.5"/>` : `<path d="M22 34 L30 24 L70 24 L78 34" fill="#F0DEC0" ${S}/>`}
  <path d="M38 34 C38 18 62 18 62 34" fill="none" ${S}/>
  ${petalRing(50, 68, 3, 5, 10, 4, '#FBF6EC')}<circle cx="50" cy="68" r="4" fill="#F2C94C" ${S} stroke-width="1.5"/>`);

export const sprayArt = () => svg(`
  <rect x="44" y="10" width="14" height="10" rx="3" fill="#E9D7B8" ${S} stroke-width="2.5"/>
  <path d="M58 14 L70 12" ${S}/>
  <path d="M36 22 L66 22 L66 30 L36 30Z" fill="#D9BE93" ${S} stroke-width="2.5"/>
  <path d="M28 48 C28 32 74 32 74 48 L74 80 C74 92 28 92 28 80Z" fill="#F2BFC4" ${S}/>
  <path d="M36 46 C38 40 46 38 50 38" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
  <path d="M74 60 C88 56 92 70 84 76" fill="none" ${S}/><circle cx="86" cy="78" r="7" fill="#EBA9AE" ${S} stroke-width="2.5"/>`);

// --- Decor -------------------------------------------------------------
export const decorArt = {
  bunting: () => svg(`<path d="M0 8 Q100 30 200 8" fill="none" ${S}/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
      const x = 12 + i * 24, y = 8 + Math.sin((x / 200) * Math.PI) * 14;
      const c = ['#F2C4C4', '#F6DFA0', '#BFDCCB', '#CEC3E3'][i % 4];
      return `<path d="M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 20}Z" fill="${c}" ${S} stroke-width="2.5"/>`;
    }).join('')}`, '0 0 200 40'),
  fern: () => svg(`<path d="M30 70 L70 70 L64 96 L36 96Z" fill="#E3B9A0" ${S}/><rect x="26" y="64" width="48" height="10" rx="4" fill="#D9A68A" ${S}/>
    ${[-50, -25, 0, 25, 50].map(a => `<path d="M50 66 C46 46 50 26 50 12 C58 28 58 48 50 66Z" fill="#A9C79A" ${S} stroke-width="2.5" transform="rotate(${a} 50 66)"/>`).join('')}`),
  rug: () => svg(`<ellipse cx="100" cy="20" rx="96" ry="16" fill="#E9C9C9" ${S}/><ellipse cx="100" cy="20" rx="78" ry="10" fill="none" stroke="#FBF6EC" stroke-width="3" stroke-dasharray="6 6"/>`, '0 0 200 40'),
  painting: () => svg(`<rect x="8" y="10" width="84" height="70" rx="4" fill="#E3C9A6" ${S}/><rect x="17" y="19" width="66" height="52" fill="#EAF2EC" ${S} stroke-width="2"/>
    <path d="M17 60 Q40 48 60 58 T83 54 L83 71 L17 71Z" fill="#BFDCCB"/>${flowerHead('daisy', 36, 46, 0.22)}${flowerHead('rose', 62, 40, 0.22)}${flowerHead('lavender', 48, 54, 0.2)}`),
  lantern: () => svg(`<path d="M50 0 L50 18" ${S}/><rect x="38" y="16" width="24" height="6" rx="2" fill="#D9A68A" ${S} stroke-width="2.5"/>
    <ellipse cx="50" cy="46" rx="26" ry="26" fill="#F8E2B4" ${S}/><path d="M36 26 Q30 46 36 66 M64 26 Q70 46 64 66 M50 20 L50 72" fill="none" stroke="#E6C890" stroke-width="2"/>
    <rect x="38" y="70" width="24" height="6" rx="2" fill="#D9A68A" ${S} stroke-width="2.5"/>`),
  windowbox: () => svg(`<rect x="6" y="40" width="188" height="26" rx="5" fill="#C9A88A" ${S}/>
    ${['daisy', 'rose', 'chamomile', 'lavender', 'daisy', 'rose'].map((k, i) => flowerHead(k, 22 + i * 31, 28, 0.36)).join('')}`, '0 0 200 70'),
  shelf: () => svg(`<rect x="4" y="34" width="192" height="10" rx="3" fill="#D9B896" ${S}/><path d="M30 44 L36 58 M170 44 L164 58" ${S}/>`, '0 0 200 60'),
  plush: () => svg(`<ellipse cx="50" cy="70" rx="38" ry="22" fill="#E9D8C4" ${S}/>
    <path d="M24 56 L22 36 L38 48Z M62 48 L74 34 L78 54Z" fill="#E9D8C4" ${S}/><path d="M30 64 Q34 67 38 64 M58 64 Q62 67 66 64" fill="none" ${S} stroke-width="2.5"/>
    <path d="M84 74 C96 70 96 56 88 54" fill="none" ${S}/><text x="76" y="30" font-size="16" fill="${OL}" font-family="sans-serif">z</text>`),
};

// --- Garden tools -------------------------------------------------------------
export const ipadArt = () => svg(`<rect x="12" y="8" width="76" height="84" rx="10" fill="#FBF6EC" ${S}/>
  <rect x="20" y="16" width="60" height="64" rx="4" fill="#BFD6AE" ${S} stroke-width="2.5"/>
  ${flowerHead('daisy', 50, 46, 0.4)}<circle cx="50" cy="86" r="2.5" fill="${OL}"/>`);
export const basketArt = (full = false) => svg(`
  ${full ? `${flowerHead('daisy', 36, 40, 0.3)}${flowerHead('rose', 58, 36, 0.3)}${flowerHead('chamomile', 48, 44, 0.26)}` : ''}
  <path d="M30 44 C30 14 70 14 70 44" fill="none" ${S} stroke-width="5"/><path d="M30 44 C30 14 70 14 70 44" fill="none" stroke="#E6C890" stroke-width="2"/>
  <path d="M14 46 L86 46 L76 88 L24 88Z" fill="#E3C38F" ${S}/>
  <path d="M18 60 L82 60 M21 74 L79 74 M34 46 L36 88 M50 46 L50 88 M66 46 L64 88" stroke="#C9A06A" stroke-width="2.5" fill="none"/>`);
export const shearsArt = () => svg(`<path d="M50 52 L80 14 M50 52 L22 18" ${S} stroke-width="6"/><path d="M50 52 L80 14 M50 52 L22 18" stroke="#DCE3E8" stroke-width="2"/>
  <circle cx="36" cy="72" r="13" fill="none" ${S} stroke-width="6"/><circle cx="36" cy="72" r="13" fill="none" stroke="#EBA9AE" stroke-width="2.5"/>
  <circle cx="64" cy="72" r="13" fill="none" ${S} stroke-width="6"/><circle cx="64" cy="72" r="13" fill="none" stroke="#EBA9AE" stroke-width="2.5"/>
  <path d="M44 62 L50 52 L56 62" fill="none" ${S}/>`);
export const dropArt = () => svg(`<path d="M50 10 C64 32 78 46 78 62 C78 80 64 90 50 90 C36 90 22 80 22 62 C22 46 36 32 50 10Z" fill="#B9D6EA" ${S} stroke-width="5"/>
  <path d="M36 62 C36 70 42 76 48 76" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`);

// Plot art for each growth stage
export function plotArt(key, stage) {
  if (!key) return '';
  if (stage === 0) return svg(`<circle cx="40" cy="70" r="3" fill="${OL}"/><circle cx="55" cy="66" r="3" fill="${OL}"/><circle cx="62" cy="74" r="3" fill="${OL}"/>`);
  if (stage === 1) return svg(`<path d="M50 84 L50 64" ${S}/><path d="M50 66 C40 54 30 60 32 66 C40 70 46 68 50 66Z M50 66 C60 54 70 60 68 66 C60 70 54 68 50 66Z" fill="#A9C79A" ${S} stroke-width="2.5"/>`);
  if (stage === 2) return svg(`<path d="M50 86 L50 46" ${S}/><path d="M50 70 C38 60 28 66 30 72 C40 76 46 74 50 70Z M50 62 C62 52 72 58 70 64 C60 68 54 66 50 62Z" fill="#A9C79A" ${S} stroke-width="2.5"/><ellipse cx="50" cy="42" rx="7" ry="10" fill="${FLOWERS[key].petal}" ${S} stroke-width="2.5"/>`);
  return svg(`<path d="M50 90 L50 54" ${S}/><path d="M50 74 C38 64 28 70 30 76 C40 80 46 78 50 74Z M50 68 C62 58 72 64 70 70 C60 74 54 72 50 68Z" fill="#A9C79A" ${S} stroke-width="2.5"/>${flowerHead(key, 50, 38, 0.62)}`);
}

// Returns an <img> when an override exists, else inline SVG markup.
export function art(type, key, fallback) {
  const path = ASSET_OVERRIDES[`${type}:${key}`];
  if (path) return `<img src="${path}" alt="" draggable="false">`;
  return fallback();
}
export const P = (key) => art('product', key, () => productArt(key));
export const F = (key) => art('flower', key, () => flowerArt(key));
export const SEED = (key) => art('seed', key, () => seedArt(key));
export const D = (key) => art('decor', key, () => decorArt[key]());

// --- 作業場 stations (placeholder until real art arrives) ----------------------
export const alchemyArt = () => svg(`
  <rect x="8" y="96" width="184" height="16" rx="6" fill="#C9A88A" ${S}/>
  <path d="M20 112 L22 150 M180 112 L178 150" ${S} stroke-width="6"/><path d="M20 112 L22 150 M180 112 L178 150" stroke="#D9B896" stroke-width="2"/>
  <path d="M30 96 L30 60 L22 48 L48 48 L40 60 L40 96Z" fill="#E7DFF2" ${S} stroke-width="2.5"/><path d="M31 96 L31 76 L39 76 L39 96Z" fill="#CFC3EA"/>
  <path d="M70 52 L70 66 C54 72 50 92 62 96 L98 96 C110 92 106 72 90 66 L90 52Z" fill="#FBF6EC" ${S}/>
  <path d="M56 86 C60 78 100 78 104 86 C106 92 102 96 98 96 L62 96 C58 96 54 92 56 86Z" fill="#F2BFC4"/>
  <rect x="66" y="44" width="28" height="10" rx="3" fill="#D9BE93" ${S} stroke-width="2.5"/>
  <circle cx="76" cy="84" r="3" fill="#fff" opacity=".8"/><circle cx="86" cy="78" r="2" fill="#fff" opacity=".8"/>
  <path d="M120 96 L160 96 L156 88 L124 88Z" fill="#B9C4C9" ${S} stroke-width="2.5"/><path d="M140 88 L140 70" ${S}/>
  <path d="M118 70 L162 70" ${S}/><path d="M118 70 L112 82 L124 82Z M162 70 L156 82 L168 82Z" fill="#E6D3B3" ${S} stroke-width="2"/>
  <ellipse cx="176" cy="90" rx="12" ry="7" fill="#C9B6A0" ${S} stroke-width="2.5"/>${flowerHead('rose', 176, 82, 0.18)}`, '0 0 200 150');

export const kitchenArt = () => svg(`
  <rect x="8" y="96" width="184" height="54" rx="6" fill="#DCC5A3" ${S}/>
  <rect x="8" y="90" width="184" height="12" rx="5" fill="#C9A88A" ${S}/>
  <rect x="20" y="108" width="46" height="34" rx="4" fill="#E9D7BA" ${S} stroke-width="2.5"/><circle cx="43" cy="125" r="4" fill="${OL}"/>
  <rect x="78" y="108" width="46" height="34" rx="4" fill="#E9D7BA" ${S} stroke-width="2.5"/><circle cx="101" cy="125" r="4" fill="${OL}"/>
  <path d="M26 90 L26 84 L60 84 L60 90" fill="#9FA9AE" ${S} stroke-width="2.5"/>
  <path d="M28 84 C26 62 58 62 58 84Z" fill="#AFC39B" ${S}/><path d="M58 74 C66 70 70 64 72 58" fill="none" ${S}/><rect x="38" y="58" width="10" height="6" rx="2" fill="#D9BE93" ${S} stroke-width="2"/>
  <path d="M40 54 C38 48 44 46 42 40 M48 54 C46 48 52 46 50 40" fill="none" stroke="#C9C1B6" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="84" y="40" width="44" height="50" rx="8" fill="#E6F0EE" ${S}/><rect x="86" y="60" width="40" height="28" rx="6" fill="#F4E3A6" opacity=".9"/>
  <circle cx="96" cy="70" r="3" fill="#fff" opacity=".8"/><circle cx="112" cy="76" r="2" fill="#fff" opacity=".8"/><rect x="80" y="36" width="52" height="8" rx="3" fill="#C9A88A" ${S} stroke-width="2.5"/>
  <path d="M140 30 L188 30" ${S} stroke-width="4"/><path d="M146 30 L146 22 M182 30 L182 22" ${S}/>
  ${['mint', 'chamomile', 'lavender', 'mint'].map((k, i) => `<g transform="translate(${148 + i * 11} 34) rotate(180)">${flowerHead(k, 0, -14, 0.16)}</g>`).join('')}
  <path d="M140 88 L188 88 L184 76 L144 76Z" fill="#EAD9BD" ${S} stroke-width="2.5"/>${[0, 1, 2].map((i) => flowerHead('mint', 152 + i * 13, 74, 0.12)).join('')}`, '0 0 200 150');
