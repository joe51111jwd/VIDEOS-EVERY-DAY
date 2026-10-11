// Dumps real harness rows for the film: the same 1,000 generated inputs run through
// the original, the rewrite, and a first rewrite attempt with a one-character tax bug.
// npx tsx dump.ts > ../src/src/data/harness.json
import fc from "fast-check";
import { input } from "./arb.ts";
import { calculateCheckoutTotal as oldFn } from "./checkout.messy.ts";
import { calculateCheckoutTotal as newFn } from "./checkout.clean.ts";
import fs from "node:fs";

// attempt 1: the rewrite with NY's 8.875% typed as 8.88%
const src = fs.readFileSync(new URL("./checkout.clean.ts", import.meta.url), "utf8").replace("887.5", "888");
fs.writeFileSync("/tmp/claude-0/attempt1.ts", src);
const { calculateCheckoutTotal: badFn } = await import("/tmp/claude-0/attempt1.ts");

const xs = fc.sample(input, { numRuns: 1000, seed: 4212 });
const run = (f: Function, x: any) => { try { return f(x.cart, x.user, x.coupon, x.region, x.method, x.giftCard); } catch (e: any) { return { error: e.message }; } };
const usd = (c: number) => "$" + (c / 100).toFixed(2);
const out = (r: any) => (r.error ? "throws" : usd(r.total));
const summary = (x: any) => {
  const n = x.cart?.items?.length ?? 0;
  const parts = [x.cart === null ? "no cart" : `${n} item${n === 1 ? "" : "s"}`];
  if (x.user?.tier === "gold" || x.user?.tier === "silver") parts.push(x.user.tier);
  parts.push(x.region && /^[A-Z]{2}$/.test(x.region) ? x.region : "intl");
  if (["SPRING20", "TAKE10", "FREESHIP"].includes(x.coupon)) parts.push(x.coupon);
  if (x.method === "express") parts.push("express");
  return parts.join(" · ");
};
const rows = xs.map((x, i) => {
  const a = run(oldFn, x), b = run(newFn, x), c = run(badFn, x);
  return { i: i + 1, in: summary(x), old: out(a), new: out(b), same: JSON.stringify(a) === JSON.stringify(b), bad: out(c), badSame: JSON.stringify(a) === JSON.stringify(c) };
});
const firstBad = rows.find((r) => !r.badSame)!;
const badInput = xs[firstBad.i - 1];
const oa = run(oldFn, badInput), ca = run(badFn, badInput);
console.log(JSON.stringify({ rows, identical: rows.filter((r) => r.same).length, firstBad: { ...firstBad, oldTax: oa.tax, badTax: ca.tax } }));
