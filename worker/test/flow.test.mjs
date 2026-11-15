// End-to-end: a signed orders.created webhook marks the team in (fake) Firebase.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const FB = "https://fb.test";
const env = { FIREBASE_URL: FB, OVERLAY_PATH: "smjOverlay/current", WHATNOT_PATH: "smjOverlay/whatnot", WHATNOT_TOKEN: "t" };

function fakeBackends(db, orders) {
  const at = (p) => p.split("/").filter(Boolean).reduce((o, k) => (o == null ? undefined : o[k]), db) ?? null;
  const set = (p, v) => {
    const ks = p.split("/").filter(Boolean); let o = db;
    for (const k of ks.slice(0, -1)) o = o[k] ??= {};
    if (v === null) delete o[ks.at(-1)]; else o[ks.at(-1)] = v;
  };
  globalThis.fetch = async (url, opt = {}) => {
    const u = new URL(url); const m = opt.method || "GET";
    if (u.origin === FB) {
      const p = u.pathname.replace(/\.json$/, "");
      if (m === "GET") return new Response(JSON.stringify(at(p)), { headers: { ETag: at(p) === null ? "null_etag" : "x" } });
      const body = JSON.parse(opt.body ?? "null");
      if (m === "PUT") { if (opt.headers?.["if-match"] && opt.headers["if-match"] !== (at(p) === null ? "null_etag" : "x")) return new Response("", { status: 412 }); set(p, body); }
      if (m === "PATCH") for (const [k, v] of Object.entries(body)) set(p + "/" + k, v);
      if (m === "DELETE") set(p, null);
      return new Response("null");
    }
    const id = u.pathname.match(/orders\/([^/]+)/)?.[1];
    if (u.pathname.endsWith("/items")) return Response.json({ data: [orders[id].item] });
    if (id) return Response.json(orders[id].order);
    return Response.json({ data: Object.values(orders).map((o) => o.order) });
  };
}

async function signed(secretKey, body) {
  const id = "m1", ts = String(Math.floor(Date.now() / 1000));
  const key = await crypto.subtle.importKey("raw", secretKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`)))));
  return new Request("https://w.test/whatnot/webhook", { method: "POST", body, headers: { "webhook-id": id, "webhook-timestamp": ts, "webhook-signature": `v1,${sig}` } });
}

async function run(req, e) {
  const jobs = []; const res = await worker.fetch(req, e, { waitUntil: (p) => jobs.push(p) });
  await Promise.all(jobs); return res;
}

const order = (id, title, extra = {}) => ({
  order: { id, show_id: "s1", transaction_type: "auction", status: "pending_fulfillment", created_at: new Date().toISOString(), buyer: { username: "ryanbreaks", display_name: "Ryan" }, amounts: { total: { amount: "13.50" }, subtotal: { amount: "12.58" } }, ...extra },
  item: { purchased_item: { title }, unit_price: { amount: "12.58" } },
});

test("webhook marks the team once, ignores repeats and giveaways", async () => {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const e = { ...env, WHATNOT_WEBHOOK_SECRET: "wn_wh_" + btoa(String.fromCharCode(...keyBytes)) };
  const db = { smjOverlay: { current: { league: "nfl", sold: {}, buyers: {}, prices: {} }, whatnot: { settings: { enabled: true, enabledAt: Date.now() - 60000 } } } };
  const orders = { "1": order("1", "2025 PRIZM HOBBY BOX - Dallas Cowboys"), "2": order("2", "SMJ Sticker!!! #1", { transaction_type: "giveaway" }), "3": order("3", "PRIZM - Random Spot") };
  fakeBackends(db, orders);

  const body = (id) => JSON.stringify({ type: "orders.created", timestamp: "x", data: { id }, version: "v2", seller_id: "1" });
  assert.equal((await run(await signed(keyBytes, body("1")), e)).status, 200);
  const cur = db.smjOverlay.current;
  assert.equal(cur.sold.dal, true); assert.equal(cur.buyers.dal, "ryanbreaks"); assert.equal(cur.prices.dal, 12.58); assert.equal(cur.lastSold, "dal");

  cur.lastSold = "x"; // a retry of the same delivery must not write again
  await run(await signed(keyBytes, body("1")), e);
  assert.equal(cur.lastSold, "x");

  await run(await signed(keyBytes, body("2")), e);
  await run(await signed(keyBytes, body("3")), e);
  const log = db.smjOverlay.whatnot.log;
  assert.equal(log["1"].result, "marked");
  assert.equal(log["2"].result, "skipped");
  assert.equal(log["3"].result, "no match");

  // bad signature is refused
  const bad = await signed(crypto.getRandomValues(new Uint8Array(32)), body("1"));
  assert.equal((await run(bad, e)).status, 401);
});

test("does nothing while auto-mark is off; catch-up handles missed orders", async () => {
  const db = { smjOverlay: { current: { league: "mlb", sold: {} }, whatnot: { settings: { enabled: false } } } };
  fakeBackends(db, { "9": order("9", "1X TOPPS SERIES 2 HOBBY BOX - Houston Astros") });
  const jobs = []; await worker.scheduled({}, env, { waitUntil: (p) => jobs.push(p) }); await Promise.all(jobs);
  assert.equal(db.smjOverlay.current.sold.hou, undefined);
  db.smjOverlay.whatnot.settings = { enabled: true, enabledAt: Date.now() - 60000 };
  jobs.length = 0; await worker.scheduled({}, env, { waitUntil: (p) => jobs.push(p) }); await Promise.all(jobs);
  assert.equal(db.smjOverlay.current.sold.hou, true);
});

test("health check reports keys and connections without leaking them", async () => {
  const db = { smjOverlay: { current: { league: "nfl" }, whatnot: { settings: { enabled: true } } } };
  fakeBackends(db, {});
  const res = await worker.fetch(new Request("https://w.test/health"), { ...env, WHATNOT_WEBHOOK_SECRET: "wn_wh_x" }, { waitUntil() {} });
  const h = await res.json();
  assert.equal(h.ready, true);
  assert.equal(h.whatnotApi, "ok"); assert.equal(h.firebaseWrite, "ok"); assert.equal(h.league, "nfl"); assert.equal(h.autoMarkOn, true);
  assert.ok(!JSON.stringify(h).includes("wn_wh_x"));
  const noKey = await (await worker.fetch(new Request("https://w.test/health"), { ...env, WHATNOT_TOKEN: "" }, { waitUntil() {} })).json();
  assert.equal(noKey.ready, false); assert.equal(noKey.whatnotTokenSet, false);
});

test("Stream Deck triggers: key check, animations with cooldown, auto-mark, undo", async () => {
  const db = { smjOverlay: { current: { league: "nfl", sold: { dal: true }, buyers: { dal: "ryan" }, prices: { dal: 12 }, lastSold: "dal" }, whatnot: { settings: { enabled: false } } } };
  fakeBackends(db, {});
  const e = { ...env, TRIGGER_KEY: "k123" };
  const go = async (path, key = "k123") => {
    const res = await worker.fetch(new Request(`https://w.test/go/${path}?key=${key}`), e, { waitUntil() {} });
    return { status: res.status, body: await res.json() };
  };
  assert.equal((await go("stash-or-pass", "nope")).status, 403);
  assert.equal((await go("stash-or-pass", "")).status, 403);

  assert.equal((await go("stash-or-pass")).body.ok, true);
  assert.equal(db.smjOverlay.current.moment.id, "stash-or-pass");
  const at = db.smjOverlay.current.moment.at;
  assert.match((await go("spin-2-choose-1")).body.did, /ignored/); // double press within 4.6s
  assert.equal(db.smjOverlay.current.moment.at, at);
  db.smjOverlay.current.moment.at = Date.now() - 10000;
  await go("spin-2-choose-1");
  assert.equal(db.smjOverlay.current.moment.id, "spin-2-choose-1");

  assert.equal((await go("automark-toggle")).body.did, "auto-mark on");
  assert.equal(db.smjOverlay.whatnot.settings.enabled, true);
  assert.equal((await go("automark-off")).body.did, "auto-mark off");
  assert.equal(db.smjOverlay.whatnot.settings.enabled, false);

  await go("undo-last");
  assert.equal(db.smjOverlay.current.sold.dal, false);
  assert.equal(db.smjOverlay.current.lastSold, "");
  assert.equal((await go("undo-last")).body.did, "nothing to undo");

  const bad = await go("explode");
  assert.equal(bad.body.ok, false);
});
