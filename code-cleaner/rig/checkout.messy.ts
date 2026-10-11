// checkout.ts
// Calculates the checkout total for the cart
// NOTE: this handles coupons, membership, shipping, tax and gift cards
// TODO: clean this up later

export function calculateCheckoutTotal(
  cart: any,
  user: any,
  couponCode: any,
  region: any,
  shippingMethod: any,
  giftCardBalance: any
): any {
  // Initialize all the variables we need
  let subtotal = 0;
  let discountableSubtotal = 0;
  let eligibleForSpringSubtotal = 0;
  let giftItemsSubtotal = 0;
  let hasPhysicalItems = false;
  let couponDiscount = 0;
  let memberDiscount = 0;
  let shipping = 0;
  let tax = 0;
  let total = 0;
  let giftCardApplied = 0;
  let amountDue = 0;
  let freeShippingFromCoupon = false;

  // Check if the cart is valid
  if (cart === null || cart === undefined) {
    throw new Error("Cart is empty");
  } else {
    if (cart.items === null || cart.items === undefined) {
      throw new Error("Cart is empty");
    } else {
      if (cart.items.length === 0) {
        throw new Error("Cart is empty");
      }
    }
  }

  // Loop through the items to validate them
  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    if (item.qty === null || item.qty === undefined) {
      throw new Error("Invalid quantity for " + item.sku);
    }
    if (Number.isInteger(item.qty) === false) {
      throw new Error("Invalid quantity for " + item.sku);
    }
    if (item.qty < 1) {
      throw new Error("Invalid quantity for " + item.sku);
    }
    if (item.qty > 99) {
      throw new Error("Invalid quantity for " + item.sku);
    }
  }

  // Calculate the subtotal
  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    const lineTotal = item.price * item.qty;
    subtotal = subtotal + lineTotal;
  }

  // Calculate the subtotal of gift items (gift cards are not discountable or taxable)
  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    if (item.category === "gift") {
      const lineTotal = item.price * item.qty;
      giftItemsSubtotal = giftItemsSubtotal + lineTotal;
    }
  }

  // Calculate the discountable subtotal
  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    if (item.category !== "gift") {
      const lineTotal = item.price * item.qty;
      discountableSubtotal = discountableSubtotal + lineTotal;
      hasPhysicalItems = true;
    }
  }

  // Calculate the subtotal that is eligible for the SPRING20 coupon
  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    if (item.category !== "gift") {
      if (item.onSale === false) {
        const lineTotal = item.price * item.qty;
        eligibleForSpringSubtotal = eligibleForSpringSubtotal + lineTotal;
      } else {
        // item is on sale, not eligible
      }
    }
  }

  // Apply the coupon code
  if (couponCode !== null && couponCode !== undefined) {
    if (couponCode === "SPRING20") {
      // 20% off items that are not on sale
      couponDiscount = Math.round((eligibleForSpringSubtotal * 2000) / 10000);
    } else if (couponCode === "TAKE10") {
      // $10 off orders over $50
      if (discountableSubtotal >= 5000) {
        couponDiscount = 1000;
        if (couponDiscount > discountableSubtotal) {
          couponDiscount = discountableSubtotal;
        }
      } else {
        couponDiscount = 0;
      }
    } else if (couponCode === "FREESHIP") {
      // free standard shipping
      freeShippingFromCoupon = true;
      couponDiscount = 0;
    } else {
      // invalid coupon, ignore it
      couponDiscount = 0;
    }
  } else {
    couponDiscount = 0;
  }

  // Apply the membership discount
  if (user !== null && user !== undefined) {
    if (user.tier === "gold") {
      const afterCoupon = discountableSubtotal - couponDiscount;
      memberDiscount = Math.round((afterCoupon * 500) / 10000);
    } else if (user.tier === "silver") {
      const afterCoupon = discountableSubtotal - couponDiscount;
      memberDiscount = Math.round((afterCoupon * 200) / 10000);
    } else {
      memberDiscount = 0;
    }
  } else {
    memberDiscount = 0;
  }

  // Calculate shipping
  const merchandiseAfterDiscounts = discountableSubtotal - couponDiscount - memberDiscount;
  if (hasPhysicalItems === false) {
    // only gift cards, they are emailed
    shipping = 0;
  } else {
    if (shippingMethod === "express") {
      if (freeShippingFromCoupon === true) {
        shipping = 900;
      } else {
        shipping = 1499;
      }
    } else {
      if (freeShippingFromCoupon === true) {
        shipping = 0;
      } else if (merchandiseAfterDiscounts >= 7500) {
        shipping = 0;
      } else if (user !== null && user !== undefined && user.tier === "gold" && merchandiseAfterDiscounts >= 2500) {
        shipping = 0;
      } else {
        shipping = 599;
      }
    }
  }

  // Calculate tax
  const taxableAmount = discountableSubtotal - couponDiscount - memberDiscount;
  if (region === "CA") {
    tax = Math.round((taxableAmount * 725) / 10000);
  } else if (region === "NY") {
    tax = Math.round((taxableAmount * 887.5) / 10000);
  } else if (region === "TX") {
    tax = Math.round((taxableAmount * 625) / 10000);
  } else if (region === "WA") {
    tax = Math.round((taxableAmount * 650) / 10000);
  } else if (region === "OR") {
    tax = 0;
  } else {
    tax = Math.round((taxableAmount * 500) / 10000);
  }

  // NY also taxes shipping
  if (region === "NY") {
    if (shipping > 0) {
      tax = tax + Math.round((shipping * 887.5) / 10000);
    }
  }

  // Calculate the total
  total = subtotal - couponDiscount - memberDiscount + shipping + tax;

  // Apply the gift card
  if (giftCardBalance !== null && giftCardBalance !== undefined) {
    if (giftCardBalance > 0) {
      if (giftCardBalance >= total) {
        giftCardApplied = total;
      } else {
        giftCardApplied = giftCardBalance;
      }
    } else {
      giftCardApplied = 0;
    }
  } else {
    giftCardApplied = 0;
  }

  // Calculate the amount due
  amountDue = total - giftCardApplied;

  // Return the result
  const result = {
    subtotal: subtotal,
    discount: couponDiscount + memberDiscount,
    shipping: shipping,
    tax: tax,
    total: total,
    giftCardApplied: giftCardApplied,
    amountDue: amountDue,
  };
  return result;
}
