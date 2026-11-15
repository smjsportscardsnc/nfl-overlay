// Makes a new private key for the Stream Deck trigger links, saves it on
// Cloudflare (as the TRIGGER_KEY secret) and writes the links you paste into
// the Stream Deck app to stream-deck-links.txt (kept out of git).
// Run again any time to replace the key; old links stop working.
//   npm run stream-deck
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const name = (readFileSync(here("../wrangler.toml"), "utf8").match(/^name\s*=\s*"([^"]+)"/m) || [])[1] || "smj-whatnot";
const base = (process.argv[2] || `https://${name}.stevewagner.workers.dev`).replace(/\/$/, "");
const key = randomBytes(18).toString("base64url");

execFileSync("npx", ["wrangler", "secret", "put", "TRIGGER_KEY"], { input: key, stdio: ["pipe", "inherit", "inherit"], cwd: here("..") });

const links = [
  ["Spin 2 Choose 1", "spin-2-choose-1"],
  ["Stash or Pass", "stash-or-pass"],
  ["Auto-mark on/off (toggle)", "automark-toggle"],
  ["Undo last sale", "undo-last"],
];
const out =
  "SMJ Stream Deck links (private: anyone with these can trigger your overlay)\n\n" +
  "In the Stream Deck app: drag System > Website onto a key, paste one link,\n" +
  "and tick \"GET request in background\".\n\n" +
  links.map(([label, action]) => `${label}\n${base}/go/${action}?key=${key}\n`).join("\n") +
  "\nOther animations you can use the same way: free-respin, double-respin, see-3-take-2, last-spot\n";
writeFileSync(here("../stream-deck-links.txt"), out);
console.log(`\nSaved the key on Cloudflare and wrote ${here("../stream-deck-links.txt")}`);
