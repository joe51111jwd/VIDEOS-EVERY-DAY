// Input generators built from the function's types (Code Cleaner harness).
import fc from "fast-check";

const item = fc.record({
  sku: fc.stringMatching(/^[A-Z]{2}-[0-9]{3}$/),
  price: fc.oneof({ weight: 8, arbitrary: fc.integer({ min: 900, max: 12000 }) }, { weight: 2, arbitrary: fc.integer({ min: 1, max: 40000 }) }),
  qty: fc.oneof({ weight: 150, arbitrary: fc.integer({ min: 1, max: 3 }) }, { weight: 20, arbitrary: fc.integer({ min: 4, max: 99 }) }, { weight: 1, arbitrary: fc.constantFrom(0, 100, 2.5, -1) }),
  category: fc.constantFrom("apparel", "shoes", "accessories", "gift"),
  onSale: fc.boolean(),
});
export const input = fc.record({
  cart: fc.oneof({ weight: 60, arbitrary: fc.record({ items: fc.array(item, { minLength: 1, maxLength: 5 }) }) }, { weight: 1, arbitrary: fc.constant({ items: [] }) }, { weight: 1, arbitrary: fc.constant(null) }),
  user: fc.oneof(fc.constant(null), fc.record({ tier: fc.constantFrom("gold", "silver", "none", "") })),
  coupon: fc.oneof(fc.constant(null), fc.constantFrom("SPRING20", "TAKE10", "FREESHIP", "SPRING21", ""), fc.string()),
  region: fc.oneof(fc.constantFrom("CA", "NY", "TX", "WA", "OR", "FL", ""), fc.string()),
  method: fc.constantFrom("standard", "express"),
  giftCard: fc.oneof(fc.constant(null), fc.integer({ min: 0, max: 20000 })),
});

