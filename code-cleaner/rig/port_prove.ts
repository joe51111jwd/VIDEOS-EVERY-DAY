// Port proof: TypeScript original vs Rust port on the same generated inputs.
// npx tsx port_prove.ts <rust-binary> [runs] [seed]
import fc from "fast-check";
import { execFileSync } from "node:child_process";
import { input } from "./arb.ts";
import { calculateCheckoutTotal as oldFn } from "./checkout.messy.ts";

const [bin, runsArg, seedArg] = process.argv.slice(2);
const runs = Number(runsArg ?? 1000), seed = Number(seedArg ?? 4212);
const hex = (s: string) => Buffer.from(s, "latin1").toString("hex");
const xs = fc.sample(input.filter((x) => [x.coupon, x.region].every((s) => s == null || /^[\x00-\xff]*$/.test(s))), { numRuns: runs, seed });
const enc = (x: any) => [
  x.cart === null ? "~" : x.cart.items.map((i: any) => [hex(i.sku), i.price, i.qty, hex(i.category), i.onSale ? 1 : 0].join(",")).join(";"),
  x.user === null ? "~" : hex(x.user.tier), x.coupon == null ? "~" : hex(x.coupon), hex(x.region), x.method, x.giftCard == null ? "~" : x.giftCard,
].join("|");
const ts = xs.map((x) => { try { const r = oldFn(x.cart, x.user, x.coupon, x.region, x.method, x.giftCard);
  return `ok ${r.subtotal} ${r.discount} ${r.shipping} ${r.tax} ${r.total} ${r.giftCardApplied} ${r.amountDue}`; } catch (e: any) { return `err ${e.message}`; } });
const rs = execFileSync(bin, { input: xs.map(enc).join("\n") + "\n", maxBuffer: 1 << 28 }).toString("latin1").trimEnd().split("\n");
const diff = ts.findIndex((t, i) => t !== rs[i]);
console.log(JSON.stringify({ runs: xs.length, identical: ts.filter((t, i) => t === rs[i]).length, firstDiff: diff, ts: ts[diff], rs: rs[diff] }));
