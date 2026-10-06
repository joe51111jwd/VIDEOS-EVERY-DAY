import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const name = String(body?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const email = String(body?.email ?? "").trim().toLowerCase();
  // Honeypot field: real people never fill it in.
  if (body?.company) return res.status(200).json({ ok: true });
  if (!name) {
    return res.status(400).json({ ok: false, error: "Please add your name." });
  }
  if (!EMAIL.test(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  }

  const record = {
    name,
    email,
    joinedAt: new Date().toISOString(),
    referrer: String(req.headers.referer ?? "").slice(0, 300),
    userAgent: String(req.headers["user-agent"] ?? "").slice(0, 300),
    country: String(req.headers["x-vercel-ip-country"] ?? ""),
  };

  const stamp = record.joinedAt.replace(/[:.]/g, "-");
  await put(`signups/${stamp}-${randomUUID().slice(0, 8)}.json`, JSON.stringify(record, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  return res.status(200).json({ ok: true });
}
