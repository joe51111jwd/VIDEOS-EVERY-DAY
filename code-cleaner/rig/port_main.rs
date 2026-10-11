// Reads hex-field lines from stdin, prints one result per line (harness side of the port proof).
mod checkout;
use checkout::*;
use std::io::{self, BufRead};
fn unhex(s: &str) -> String { (0..s.len()).step_by(2).map(|i| u8::from_str_radix(&s[i..i + 2], 16).unwrap()).collect::<Vec<u8>>().iter().map(|&b| b as char).collect() }
fn opt(s: &str) -> Option<String> { if s == "~" { None } else { Some(unhex(s)) } }
fn main() {
    for line in io::stdin().lock().lines() {
        let line = line.unwrap();
        let f: Vec<&str> = line.split('|').collect();
        let items: Option<Vec<Item>> = if f[0] == "~" { None } else if f[0].is_empty() { Some(vec![]) } else {
            Some(f[0].split(';').map(|it| { let p: Vec<&str> = it.split(',').collect();
                Item { sku: unhex(p[0]), price: p[1].parse().unwrap(), qty: p[2].parse().unwrap(), category: unhex(p[3]), on_sale: p[4] == "1" } }).collect())
        };
        let tier = opt(f[1]); let coupon = opt(f[2]); let region = unhex(f[3]);
        let gift: Option<i64> = if f[5] == "~" { None } else { Some(f[5].parse().unwrap()) };
        let r = calculate_checkout_total(items.as_deref(), tier.as_deref(), coupon.as_deref(), &region, f[4] == "express", gift);
        match r {
            Ok(c) => println!("ok {} {} {} {} {} {} {}", c.subtotal, c.discount, c.shipping, c.tax, c.total, c.gift_card_applied, c.amount_due),
            Err(e) => println!("err {}", e),
        }
    }
}
