# SMJ Whatnot helper

A small Cloudflare Worker that watches your Whatnot sales and marks the team
sold on the overlay board by itself, with the buyer's username and the price.
The overlay pages don't move: the helper writes into the same Firebase database
the control panel uses, so the SOLD takeover plays exactly as if you tapped it.

## How it decides the team

The team is the text after the last " - " in the listing title, matched against
the teams of the league picked in the control panel:

    1X TOPPS SERIES 2 HOBBY BOX - Houston Astros   ->  Astros
    2025 PRIZM HOBBY BOX - Dallas Cowboys          ->  Cowboys

It ignores giveaways, $0 orders, cancelled orders, orders that aren't from a
show, and anything placed before Auto-mark was switched on. If no team is found
(for example "Random Spot"), the sale shows in the control panel as
"Needs a tap" with a **Use buyer** button that fills in the buyer and price.

## One-time setup (about 15 minutes)

You need Node.js on your Mac (https://nodejs.org, the LTS download).

### 1. Whatnot: create a key

1. Open https://www.whatnot.com/dashboard/developer
2. **Personal access tokens** → create one with **read:orders** and
   **read:shows**, expiry "no expiration" (or a long one). Copy it now; it's
   shown only once. It starts with `wn_pat_tk_`.

### 2. Cloudflare: put the helper online

In Terminal:

    cd path/to/nfl-overlay/worker
    npm install
    npx wrangler login          # opens the browser, sign in to Cloudflare
    npx wrangler deploy

The last line prints your helper's address, something like
`https://smj-whatnot.YOURNAME.workers.dev`. Open it in a browser: it should say
"SMJ Whatnot helper is running."

To check the keys are in and it can reach Whatnot and Firebase, open
`https://smj-whatnot.YOURNAME.workers.dev/health`. Every line should say
`ok`/`true`, and `ready` should be `true`.

Then store the Whatnot key (paste it when asked):

    npx wrangler secret put WHATNOT_TOKEN

### 3. Whatnot: send sales to the helper

1. Back in https://www.whatnot.com/dashboard/developer, go to **Webhooks**.
2. Add the address from step 2 with `/whatnot/webhook` on the end, e.g.
   `https://smj-whatnot.YOURNAME.workers.dev/whatnot/webhook`
3. Pick the topics **orders.created** and **shows.started**.
4. Copy the webhook's signing secret (starts with `wn_wh_`) and store it:

       npx wrangler secret put WHATNOT_WEBHOOK_SECRET

If your dashboard doesn't offer webhooks, skip this step. The helper also
checks your newest orders once a minute, so sales still get marked, just up to
a minute later.

### 4. Turn it on

Open the control panel and press **Auto-mark is off** in the Whatnot Auto-Mark
box so it turns green. Sales from then on mark themselves. Turn it off between
shows or whenever you want to mark teams by hand.

## Day to day

- Pick the right league in the control panel before the break. The helper only
  matches teams of the league on the board.
- Name your listings "<product> - <City Team>", as you already do.
- `npm run logs` (in this folder) shows the helper's live log if something looks off.
- If you change the team list in `js/leagues.js`, run `npm run sync-teams` and
  `npx wrangler deploy` again.

## Settings

`wrangler.toml` holds the Firebase address and paths. Secrets:

| Name | What |
|---|---|
| `WHATNOT_TOKEN` | Whatnot personal access token (read:orders, read:shows) |
| `WHATNOT_WEBHOOK_SECRET` | Webhook signing secret from the Whatnot dashboard |
| `FIREBASE_AUTH` | Optional. Only needed if you lock down your Firebase rules later |

Firebase data the helper uses, under `smjOverlay/whatnot`: `settings`
(enabled, enabledAt), `log` (last 40 sales it saw), `orders` (order ids
already handled, so nothing is marked twice).

## Tests

    npm test
