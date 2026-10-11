// Differential check: messy vs clean checkout on generated inputs (what Code Cleaner's harness does).
// npx tsx prove.ts [runs] [seed]
import fc from "fast-check";
import { isDeepStrictEqual } from "node:util";
import { calculateCheckoutTotal as oldFn } from "./checkout.messy.ts";
import { calculateCheckoutTotal as newFn } from "./checkout.clean.ts";
import { input } from "./arb.ts";

const runs = Number(process.argv[2] ?? 1000);
const seed = Number(process.argv[3] ?? 4212);

const call = (f: Function, x: any) => {
  try { return { ok: f(x.cart, x.user, x.coupon, x.region, x.method, x.giftCard) }; }
  catch (e: any) { return { threw: String(e?.message) }; }
};

let n = 0, threw = 0;
fc.assert(
  fc.property(input, (x) => {
    n++;
    const a = call(oldFn, x), b = call(newFn, x);
    if ("threw" in a) threw++;
    return isDeepStrictEqual(a, b);
  }),
  { numRuns: runs, seed, verbose: true }
);
console.log(JSON.stringify({ runs: n, identical: n, threwInBoth: threw, seed }));
