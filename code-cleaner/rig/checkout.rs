// checkout.rs — ported by Code Cleaner (port mode: TypeScript -> Rust)

#[derive(Clone)]
pub struct Item { pub sku: String, pub price: i64, pub qty: f64, pub category: String, pub on_sale: bool }

#[derive(Debug, PartialEq)]
pub struct Checkout { pub subtotal: i64, pub discount: i64, pub shipping: i64, pub tax: i64, pub total: i64, pub gift_card_applied: i64, pub amount_due: i64 }

fn bps(cents: i64, rate: f64) -> i64 { ((cents as f64 * rate) / 10000.0).round() as i64 }
fn sum<'a>(items: impl Iterator<Item = &'a Item>) -> i64 { items.map(|i| i.price * i.qty as i64).sum() }

fn tax_bps(region: &str) -> f64 {
    match region { "CA" => 725.0, "NY" => 887.5, "TX" => 625.0, "WA" => 650.0, "OR" => 0.0, _ => 500.0 }
}

pub fn calculate_checkout_total(
    items: Option<&[Item]>, tier: Option<&str>, coupon: Option<&str>,
    region: &str, express: bool, gift_card: Option<i64>,
) -> Result<Checkout, String> {
    let items = items.filter(|i| !i.is_empty()).ok_or("Cart is empty")?;
    if let Some(i) = items.iter().find(|i| i.qty.fract() != 0.0 || i.qty < 1.0 || i.qty > 99.0) {
        return Err(format!("Invalid quantity for {}", i.sku));
    }

    let goods: Vec<&Item> = items.iter().filter(|i| i.category != "gift").collect();
    let merch = sum(goods.iter().copied());

    let coupon_off = match coupon {
        Some("SPRING20") => bps(sum(goods.iter().copied().filter(|i| !i.on_sale)), 2000.0),
        Some("TAKE10") if merch >= 5000 => 1000.min(merch),
        _ => 0,
    };
    let member_off = bps(merch - coupon_off, match tier { Some("gold") => 500.0, Some("silver") => 200.0, _ => 0.0 });
    let taxable = merch - coupon_off - member_off;

    let free_ship = coupon == Some("FREESHIP");
    let shipping = if goods.is_empty() { 0 }
        else if express { if free_ship { 900 } else { 1499 } }
        else if free_ship || taxable >= 7500 || (tier == Some("gold") && taxable >= 2500) { 0 }
        else { 599 };

    let rate = tax_bps(region);
    let tax = bps(taxable, rate) + if region == "NY" && shipping > 0 { bps(shipping, rate) } else { 0 };

    let total = sum(items.iter()) - coupon_off - member_off + shipping + tax;
    let gift_card_applied = match gift_card { Some(g) if g > 0 => g.min(total), _ => 0 };

    Ok(Checkout { subtotal: sum(items.iter()), discount: coupon_off + member_off, shipping, tax, total, gift_card_applied, amount_due: total - gift_card_applied })
}
