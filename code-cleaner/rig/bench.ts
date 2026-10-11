// Real benchmark: original TS vs rewrite vs Rust port, same 1,000 inputs. npx tsx bench.ts <rust-bench-binary>
import fc from "fast-check";
import { execFileSync } from "node:child_process";
import { input } from "./arb.ts";
import { calculateCheckoutTotal as oldFn } from "./checkout.messy.ts";
import { calculateCheckoutTotal as newFn } from "./checkout.clean.ts";
const xs = fc.sample(input.filter((x) => [x.coupon, x.region].every((s) => s == null || /^[\x00-\xff]*$/.test(s))), { numRuns: 1000, seed: 4212 });
const hex = (s: string) => Buffer.from(s, "latin1").toString("hex");
const enc = (x: any) => [x.cart === null ? "~" : x.cart.items.map((i: any) => [hex(i.sku), i.price, i.qty, hex(i.category), i.onSale ? 1 : 0].join(",")).join(";"),
  x.user === null ? "~" : hex(x.user.tier), x.coupon == null ? "~" : hex(x.coupon), hex(x.region), x.method, x.giftCard == null ? "~" : x.giftCard].join("|");
const time = (f: Function, reps: number) => { let acc = 0; for (let w = 0; w < 50; w++) for (const x of xs) { try { acc += f(x.cart, x.user, x.coupon, x.region, x.method, x.giftCard).amountDue; } catch {} }
  const t = process.hrtime.bigint(); for (let r = 0; r < reps; r++) for (const x of xs) { try { acc += f(x.cart, x.user, x.coupon, x.region, x.method, x.giftCard).amountDue; } catch {} }
  return Number(process.hrtime.bigint() - t) / (reps * xs.length); };
const reps = 2000;
const oldNs = time(oldFn, reps), newNs = time(newFn, reps);
const rs = JSON.parse(execFileSync(process.argv[2], [String(reps)], { input: xs.map(enc).join("\n") + "\n" }).toString());
console.log(JSON.stringify({ oldNs: +oldNs.toFixed(1), newNs: +newNs.toFixed(1), rustNs: rs.nsPerCall, rustVsOld: +(oldNs / rs.nsPerCall).toFixed(1) }));
