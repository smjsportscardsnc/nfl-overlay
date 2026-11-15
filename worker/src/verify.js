// Checks Whatnot's webhook signature (Standard Webhooks format).
// Signed text is "{webhook-id}.{webhook-timestamp}.{raw body}", HMAC-SHA256,
// keyed with the base64 part of the dashboard secret (after "wn_wh_").

const TOLERANCE_S = 5 * 60;

export async function verifyWebhook(secret, headers, body, nowMs = Date.now()) {
  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sigs = headers.get("webhook-signature");
  if (!secret || !id || !ts || !sigs) return false;

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(nowMs / 1000 - tsNum) > TOLERANCE_S) return false;

  const keyB64 = secret.replace(/^wn_wh_/, "").replace(/^whsec_/, "");
  let keyBytes;
  try { keyBytes = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0)); } catch { return false; }

  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return sigs.split(" ").some((s) => {
    const [ver, val] = s.split(",");
    return ver === "v1" && val && safeEqual(val, expected);
  });
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
