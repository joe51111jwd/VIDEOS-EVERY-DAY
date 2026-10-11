// checkout.ts — rewritten by Code Cleaner (upkeep mode)

type Item = { sku: string; price: number; qty: number; category: string; onSale: boolean };
type Cart = { items: Item[] };

const TAX_BPS = new Map([["CA", 725], ["NY", 887.5], ["TX", 625], ["WA", 650], ["OR", 0]]);
const MEMBER_BPS = new Map([["gold", 500], ["silver", 200]]);
const bps = (cents: number, rate: number) => Math.round((cents * rate) / 10000);
const sum = (items: Item[]) => items.reduce((s, i) => s + i.price * i.qty, 0);

export function calculateCheckoutTotal(
  cart: Cart | null | undefined,
  user: { tier?: string } | null | undefined,
  coupon: string | null | undefined,
  region: string,
  method: "standard" | "express",
  giftCard: number | null | undefined
) {
  const items = cart?.items;
  if (!items?.length) throw new Error("Cart is empty");
  for (const i of items)
    if (!Number.isInteger(i.qty) || i.qty < 1 || i.qty > 99) throw new Error("Invalid quantity for " + i.sku);

  const goods = items.filter((i) => i.category !== "gift");
  const merch = sum(goods);

  const couponOff =
    coupon === "SPRING20" ? bps(sum(goods.filter((i) => !i.onSale)), 2000)
    : coupon === "TAKE10" && merch >= 5000 ? Math.min(1000, merch)
    : 0;
  const tier = user?.tier;
  const memberOff = bps(merch - couponOff, MEMBER_BPS.get(tier ?? "") ?? 0);
  const taxable = merch - couponOff - memberOff;

  const freeShip = coupon === "FREESHIP";
  const shipping =
    !goods.length ? 0
    : method === "express" ? (freeShip ? 900 : 1499)
    : freeShip || taxable >= 7500 || (tier === "gold" && taxable >= 2500) ? 0
    : 599;

  const rate = TAX_BPS.get(region) ?? 500;
  const tax = bps(taxable, rate) + (region === "NY" && shipping > 0 ? bps(shipping, rate) : 0);

  const total = sum(items) - couponOff - memberOff + shipping + tax;
  const giftCardApplied = giftCard && giftCard > 0 ? Math.min(giftCard, total) : 0;

  return {
    subtotal: sum(items),
    discount: couponOff + memberOff,
    shipping,
    tax,
    total,
    giftCardApplied,
    amountDue: total - giftCardApplied,
  };
}
