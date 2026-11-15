import { test } from "node:test";
import assert from "node:assert/strict";
import { LEAGUES } from "../src/teams.js";
import { matchTeam, isSkippable, teamPartOfTitle } from "../src/match.js";
import { verifyWebhook } from "../src/verify.js";

const abbr = (title, league) => matchTeam(title, LEAGUES[league])?.team.abbr ?? null;

test("real titles from the June 2026 shows", () => {
  const mlb = {
    "1X TOPPS SERIES 2 HOBBY BOX - Pittsburgh Pirates": "pit",
    "1X TOPPS SERIES 2 HOBBY BOX - Cleveland Guardians": "cle",
    "1X TOPPS SERIES 2 HOBBY BOX - Houston Astros": "hou",
    "1X TOPPS SERIES 2 HOBBY BOX - Milwaukee Brewers": "mil",
    "1X TOPPS SERIES 2 HOBBY BOX - Boston Red Sox": "bos",
    "1X TOPPS SERIES 2 HOBBY BOX - Miami Marlins": "mia",
    "1X TOPPS SERIES 2 HOBBY BOX - Los Angeles Dodgers": "lad",
    "1X TOPPS SERIES 2 HOBBY BOX - Detroit Tigers": "det",
    "1X TOPPS SERIES 2 HOBBY BOX - St. Louis Cardinals": "stl",
    "1X TOPPS SERIES 2 HOBBY BOX - Chicago White Sox": "chw",
    "1X TOPPS SERIES 2 HOBBY BOX - Arizona Diamondbacks": "ari",
  };
  for (const [title, want] of Object.entries(mlb)) {
    assert.equal(abbr(title, "mlb"), want, title);
  }
  assert.equal(abbr("2026 NBA Hoops Hobby Box - Detroit Pistons", "nba"), "det");
});

test("Chicago and New York teams are not confused", () => {
  const sox = matchTeam("BOX - Chicago White Sox", LEAGUES.mlb).team;
  const cubs = matchTeam("BOX - Chicago Cubs", LEAGUES.mlb).team;
  assert.notEqual(sox.abbr, cubs.abbr);
  assert.notEqual(abbr("Prizm - New York Giants", "nfl"), abbr("Prizm - New York Jets", "nfl"));
});

test("LA spellings and nickname-only titles", () => {
  assert.equal(matchTeam("Hoops - Los Angeles Clippers", LEAGUES.nba).team.name, "Clippers");
  assert.equal(matchTeam("Hoops - LA Lakers", LEAGUES.nba).team.name, "Lakers");
  assert.equal(matchTeam("Prizm Football - Cowboys", LEAGUES.nfl).team.name, "Cowboys");
  assert.equal(matchTeam("Mosaic Football Hobby Box - Dallas Cowboys", LEAGUES.nfl).team.name, "Cowboys");
});

test("every board team matches its own full name", () => {
  for (const [league, teams] of Object.entries(LEAGUES)) {
    for (const t of teams) {
      const got = matchTeam(`SOME PRODUCT - ${t.city} ${t.name}`, teams);
      assert.equal(got?.team.abbr, t.abbr, `${league} ${t.city} ${t.name}`);
    }
  }
});

test("non-team titles do not match", () => {
  assert.equal(matchTeam("SMJ Sticker!!! #1", LEAGUES.nfl), null);
  assert.equal(matchTeam("Random team spot", LEAGUES.nfl), null);
  assert.equal(matchTeam("1X TOPPS SERIES 2 HOBBY BOX - Houston Astros", LEAGUES.nfl), null);
});

test("team part is after the last dash", () => {
  assert.equal(teamPartOfTitle("2025 Prizm - Hobby - Green Bay Packers"), "Green Bay Packers");
});

test("giveaways and $0 orders are skipped", () => {
  assert.equal(isSkippable({ transaction_type: "giveaway", show_id: "x" }), "giveaway");
  assert.equal(isSkippable({ transaction_type: "auction", show_id: "x", amounts: { total: { amount: "0.00" } } }), "$0 order");
  assert.equal(isSkippable({ transaction_type: "auction", show_id: null, amounts: { total: { amount: "9" } } }), "not from a show");
  assert.equal(isSkippable({ transaction_type: "auction", show_id: "x", amounts: { total: { amount: "6.73" } } }), "");
});

test("webhook signature check", async () => {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const secret = "wn_wh_" + btoa(String.fromCharCode(...keyBytes));
  const id = "msg_1", ts = String(Math.floor(Date.now() / 1000)), body = '{"type":"orders.created","data":{"id":"1"}}';
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`)))));
  const h = (s, t = ts) => new Headers({ "webhook-id": id, "webhook-timestamp": t, "webhook-signature": s });
  assert.equal(await verifyWebhook(secret, h(`v1,${sig}`), body), true);
  assert.equal(await verifyWebhook(secret, h(`v1,bogus v1,${sig}`), body), true);
  assert.equal(await verifyWebhook(secret, h(`v1,${sig}`), body + " "), false);
  assert.equal(await verifyWebhook(secret, h(`v1,${sig}`, String(Number(ts) - 3600)), body), false);
});
