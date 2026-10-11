// Times the Rust port over the same encoded inputs as the TS bench (port mode's "speed" number).
mod checkout;
use checkout::*;
use std::io::{self, BufRead};
use std::time::Instant;
fn unhex(s: &str) -> String { (0..s.len()).step_by(2).map(|i| u8::from_str_radix(&s[i..i + 2], 16).unwrap() as char).collect() }
fn opt(s: &str) -> Option<String> { if s == "~" { None } else { Some(unhex(s)) } }
fn main() {
    let reps: usize = std::env::args().nth(1).unwrap().parse().unwrap();
    let mut cases = vec![];
    for line in io::stdin().lock().lines() {
        let line = line.unwrap();
        let f: Vec<&str> = line.split('|').collect();
        let items: Option<Vec<Item>> = if f[0] == "~" { None } else if f[0].is_empty() { Some(vec![]) } else {
            Some(f[0].split(';').map(|it| { let p: Vec<&str> = it.split(',').collect();
                Item { sku: unhex(p[0]), price: p[1].parse().unwrap(), qty: p[2].parse().unwrap(), category: unhex(p[3]), on_sale: p[4] == "1" } }).collect()) };
        cases.push((items, opt(f[1]), opt(f[2]), unhex(f[3]), f[4] == "express", if f[5] == "~" { None } else { Some(f[5].parse::<i64>().unwrap()) }));
    }
    let t = Instant::now();
    let mut acc = 0i64;
    for _ in 0..reps { for c in &cases {
        if let Ok(r) = calculate_checkout_total(c.0.as_deref(), c.1.as_deref(), c.2.as_deref(), &c.3, c.4, c.5) { acc = acc.wrapping_add(r.amount_due); }
    } }
    let ns = t.elapsed().as_nanos() as f64 / (reps * cases.len()) as f64;
    println!("{{\"nsPerCall\":{:.1},\"acc\":{}}}", ns, acc);
}
