// SMJ Whatnot helper (Cloudflare Worker)
//
// Whatnot calls POST /whatnot/webhook on every new order (orders.created).
// For an auction win in a live show we read the listing title, find the team,
// and mark it sold in the same Firebase database the overlay already reads,
// so the SOLD takeover plays on its own. A once-a-minute check also catches
// any order whose webhook got lost.
//
// Secrets (set with `npx wrangler secret put NAME`):
//   WHATNOT_TOKEN           Whatnot personal access token (read:orders)
//   WHATNOT_WEBHOOK_SECRET  signing secret from the Whatnot developer dashboard (wn_wh_...)
//   FIREBASE_AUTH           optional: Firebase database secret, if your rules need one
// Vars (wrangler.toml): FIREBASE_URL, OVERLAY_PATH, WHATNOT_PATH

import { LEAGUES } from "./teams.js";
import { matchTeam, isSkippable, buyerName, pricePaid } from "./match.js";
import { verifyWebhook } from "./verify.js";

const API = "https://api.whatnot.com/seller-api/rest/v2";
const LOG_KEEP = 40;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return text("SMJ Whatnot helper is running.");
    }

    // Setup check: are the keys in, and can we reach Whatnot and Firebase?
    // Answers yes/no only, never the keys or any order data.
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json(await health(env), { headers: { "cache-control": "no-store" } });
    }

    if (request.method === "POST" && url.pathname === "/whatnot/webhook") {
      const body = await request.text();
      const ok = await verifyWebhook(env.WHATNOT_WEBHOOK_SECRET, request.headers, body);
      if (!ok) return text("bad signature", 401);

      let event;
      try { event = JSON.parse(body); } catch { return text("bad json", 400); }

      // Whatnot times out after 5 seconds, so answer now and work in the background.
      if (event.type === "orders.created" && event.data?.id) {
        ctx.waitUntil(handleOrder(env, String(event.data.id), "webhook").catch((e) => console.error(e)));
      }
      if (event.type === "shows.started" && event.data?.show_id) {
        ctx.waitUntil(fb(env, "PATCH", env.WHATNOT_PATH, { liveShowId: event.data.show_id, liveSince: Date.now() }));
      }
      return text("ok");
    }

    return text("not found", 404);
  },

  // Safety net: every minute, look at the newest orders and handle any we missed.
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(catchUp(env).catch((e) => console.error(e)));
  },
};

async function health(env) {
  const out = {
    whatnotTokenSet: !!env.WHATNOT_TOKEN,
    webhookSecretSet: !!env.WHATNOT_WEBHOOK_SECRET,
    whatnotApi: "not checked",
    firebaseRead: "not checked",
    firebaseWrite: "not checked",
    autoMarkOn: null,
  };
  if (env.WHATNOT_TOKEN) {
    try { await wn(env, "/shows?limit=1"); out.whatnotApi = "ok"; }
    catch (e) { out.whatnotApi = String(e.message || e).replace(/^Whatnot \S+: /, "error "); }
  }
  try {
    const overlay = await fb(env, "GET", env.OVERLAY_PATH + "/league");
    out.firebaseRead = "ok";
    out.league = overlay || null;
    out.autoMarkOn = !!(await fb(env, "GET", env.WHATNOT_PATH + "/settings/enabled"));
  } catch (e) { out.firebaseRead = String(e.message || e); }
  try { await fb(env, "PUT", env.WHATNOT_PATH + "/lastHealthCheck", Date.now()); out.firebaseWrite = "ok"; }
  catch (e) { out.firebaseWrite = String(e.message || e); }
  out.ready = out.whatnotTokenSet && out.whatnotApi === "ok" && out.firebaseRead === "ok" && out.firebaseWrite === "ok";
  return out;
}

async function catchUp(env) {
  const settings = (await fb(env, "GET", env.WHATNOT_PATH + "/settings")) || {};
  if (!settings.enabled) return;
  const res = await wn(env, "/orders?limit=20");
  const cutoff = Date.now() - 15 * 60 * 1000;
  const since = settings.enabledAt || 0;
  for (const o of res?.data || []) {
    const at = Date.parse(o.created_at);
    if (!(at > cutoff && at >= since)) continue;
    await handleOrder(env, String(o.id), "catch-up", o);
  }
}

async function handleOrder(env, orderId, source, orderFromList) {
  const settings = (await fb(env, "GET", env.WHATNOT_PATH + "/settings")) || {};
  if (!settings.enabled) return;

  // Claim the order first so a retry or the catch-up never marks it twice.
  const claimed = await claim(env, orderId);
  if (!claimed) return;

  const entry = { orderId, at: Date.now(), source };
  try {
    const order = orderFromList || (await wn(env, `/orders/${encodeURIComponent(orderId)}`));
    entry.buyer = buyerName(order);
    entry.orderedAt = order.created_at || "";
    if (settings.enabledAt && Date.parse(order.created_at) < settings.enabledAt) {
      return await log(env, { ...entry, result: "skipped", note: "placed before auto-mark was turned on" });
    }

    const skip = isSkippable(order);
    if (skip) return await log(env, { ...entry, result: "skipped", note: skip });

    const items = await wn(env, `/orders/${encodeURIComponent(orderId)}/items?limit=10`);
    const item = items?.data?.[0];
    const title = item?.purchased_item?.title || "";
    entry.title = title;
    entry.price = pricePaid(order, item);

    const overlay = (await fb(env, "GET", env.OVERLAY_PATH)) || {};
    const league = overlay.league || "nfl";
    const hit = matchTeam(title, LEAGUES[league] || []);
    if (!hit) return await log(env, { ...entry, result: "no match", note: `no ${league.toUpperCase()} team found in the title` });

    const abbr = hit.team.abbr;
    entry.team = abbr;
    entry.teamName = `${hit.team.city} ${hit.team.name}`;
    if (overlay.sold?.[abbr]) {
      return await log(env, { ...entry, result: "already sold", note: `${entry.teamName} was already marked sold` });
    }

    // Same single write the control panel makes, so the overlay gets team and buyer together.
    await fb(env, "PATCH", env.OVERLAY_PATH, {
      [`sold/${abbr}`]: true,
      [`buyers/${abbr}`]: entry.buyer,
      [`prices/${abbr}`]: entry.price,
      lastSold: abbr,
    });
    await log(env, { ...entry, result: "marked" });
  } catch (e) {
    // Release the claim so the catch-up can try again.
    await fb(env, "DELETE", `${env.WHATNOT_PATH}/orders/${orderId}`).catch(() => {});
    await log(env, { ...entry, result: "error", note: String(e.message || e).slice(0, 200) });
  }
}

// Create-if-absent using Firebase ETags. Returns true if this call claimed the order.
async function claim(env, orderId) {
  const path = `${env.WHATNOT_PATH}/orders/${orderId}`;
  const head = await fetch(fbUrl(env, path), { headers: { "X-Firebase-ETag": "true" } });
  const existing = await head.json();
  if (existing !== null) return false;
  const etag = head.headers.get("ETag");
  const put = await fetch(fbUrl(env, path), {
    method: "PUT",
    headers: { "if-match": etag || "null_etag", "content-type": "application/json" },
    body: JSON.stringify(Date.now()),
  });
  return put.ok;
}

async function log(env, entry) {
  await fb(env, "PUT", `${env.WHATNOT_PATH}/log/${entry.orderId}`, entry);
  // Trim the log to the newest LOG_KEEP entries.
  const all = (await fb(env, "GET", `${env.WHATNOT_PATH}/log`)) || {};
  const old = Object.values(all).sort((a, b) => b.at - a.at).slice(LOG_KEEP);
  if (old.length) {
    const patch = {};
    for (const e of old) patch[e.orderId] = null;
    await fb(env, "PATCH", `${env.WHATNOT_PATH}/log`, patch);
  }
}

function fbUrl(env, path) {
  const base = env.FIREBASE_URL.replace(/\/$/, "");
  const auth = env.FIREBASE_AUTH ? `?auth=${encodeURIComponent(env.FIREBASE_AUTH)}` : "";
  return `${base}/${path}.json${auth}`;
}

async function fb(env, method, path, body) {
  const res = await fetch(fbUrl(env, path), {
    method,
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Firebase ${method} ${path}: ${res.status}`);
  return res.json();
}

async function wn(env, path) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(API + path, {
      headers: { Authorization: `Bearer ${env.WHATNOT_TOKEN}`, Accept: "application/json" },
    });
    if (res.status === 429) {
      const wait = Math.min(5, parseFloat(res.headers.get("Retry-After")) || 1);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`Whatnot ${path.split("?")[0]}: ${res.status}`);
    return res.json();
  }
  throw new Error("Whatnot rate limit");
}

function text(body, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
}
