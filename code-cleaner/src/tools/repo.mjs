// Fictional repo "northstar-shop" for the film: files with function counts that add up to 1,846,
// and a feed of realistic function names. node tools/repo.mjs
import fs from 'fs';
let seed = 7;
// mulberry32
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const files = [
	['app/(shop)/checkout', ['page.tsx', 'actions.ts', 'CheckoutForm.tsx']],
	['app/(shop)/cart', ['page.tsx', 'CartDrawer.tsx']],
	['app/(shop)/product/[slug]', ['page.tsx', 'Gallery.tsx']],
	['app/(account)', ['orders/page.tsx', 'settings/page.tsx']],
	['app/api', ['stripe/webhook/route.ts', 'inventory/sync/route.ts', 'auth/callback/route.ts']],
	['lib', ['checkout.ts', 'pricing.ts', 'tax.ts', 'coupons.ts', 'shipping.ts', 'cart.ts', 'inventory.ts', 'orders.ts', 'auth.ts', 'email.ts', 'analytics.ts', 'supabase.ts', 'utils.ts', 'flash-sale.ts']],
	['components', ['ProductCard.tsx', 'Header.tsx', 'SearchBar.tsx', 'Reviews.tsx', 'SizePicker.tsx']],
];
const list = [];
for (const [dir, fs_] of files) for (const f of fs_) list.push(`${dir}/${f}`);
// weights -> counts summing to 1846
const w = list.map((p) => (p.startsWith('lib/') ? 3 : 1.4) * (0.6 + rnd()));
const tot = w.reduce((a, b) => a + b, 0);
let counts = w.map((x) => Math.max(8, Math.round((x / tot) * 1846)));
counts[0] += 1846 - counts.reduce((a, b) => a + b, 0);
const verbs = ['get', 'set', 'calculate', 'apply', 'validate', 'format', 'parse', 'sync', 'handle', 'build', 'fetch', 'update', 'create', 'remove', 'normalize', 'resolve', 'map', 'check', 'compute', 'merge', 'load', 'save', 'send', 'track', 'render', 'toggle', 'reserve', 'refund'];
const nouns = ['CartItems', 'Subtotal', 'ShippingRate', 'TaxRate', 'Coupon', 'GiftCard', 'Address', 'OrderTotal', 'Inventory', 'Variant', 'SizeChart', 'Session', 'User', 'Webhook', 'Invoice', 'LineItems', 'Discount', 'Membership', 'Price', 'Currency', 'Stock', 'Order', 'Refund', 'Review', 'SearchQuery', 'Slug', 'Receipt', 'PaymentIntent', 'Checkout', 'Wishlist'];
const names = new Set(['calculateCheckoutTotal']);
while (names.size < 1846) names.add(verbs[Math.floor(rnd() * verbs.length)] + nouns[Math.floor(rnd() * nouns.length)] + (rnd() < 0.18 ? ['Async', 'V2', 'Safe', 'ForUser', 'FromDb'][Math.floor(rnd() * 5)] : ''));
const fns = [...names];
// heat: 0 clean .. 1 gnarly
const heat = list.map((p) => (p === 'lib/checkout.ts' ? 1 : 0.35 + rnd() * 0.65));
fs.writeFileSync('src/data/repo.json', JSON.stringify({files: list.map((p, i) => ({path: p, fns: counts[i], heat: +heat[i].toFixed(2)})), fns}));
console.log(list.length, counts.reduce((a, b) => a + b, 0));
