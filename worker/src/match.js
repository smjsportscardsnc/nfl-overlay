// Turns a Whatnot listing title into a team on the board.
// Titles look like "1X TOPPS SERIES 2 HOBBY BOX - Houston Astros":
// the team is the text after the last " - ".

export function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\bst\.?\s/g, "saint ")
    .replace(/\bl\.?a\.?\s/g, "los angeles ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// The part of the title that names the team, or the whole title if there is no dash.
export function teamPartOfTitle(title) {
  const t = String(title || "");
  const m = t.match(/\s[-–—|]\s(?!.*\s[-–—|]\s)(.+)$/);
  return (m ? m[1] : t).trim();
}

// Returns { team, how } or null.
// Tries, in order: exact "City Name", the part ends with "City Name",
// then the nickname alone when only one team in the league has it.
export function matchTeam(title, teams) {
  const part = normalize(teamPartOfTitle(title));
  const whole = normalize(title);
  if (!part) return null;

  const full = (t) => normalize(`${t.city} ${t.name}`);
  const nick = (t) => normalize(t.name);
  const endsWithWord = (s, w) => s === w || s.endsWith(" " + w);

  let hit = teams.find((t) => part === full(t));
  if (hit) return { team: hit, how: "full name" };

  hit = teams.find((t) => endsWithWord(part, full(t)));
  if (hit) return { team: hit, how: "full name" };

  const byNick = teams.filter((t) => endsWithWord(part, nick(t)));
  if (byNick.length === 1) return { team: byNick[0], how: "nickname" };

  // Last resort: the whole title ends with a full team name (no dash in the title).
  const tail = teams.filter((t) => endsWithWord(whole, full(t)));
  if (tail.length === 1) return { team: tail[0], how: "full name" };

  return null;
}

// Giveaways and $0 orders never mark a team.
export function isSkippable(order) {
  if (!order) return "no order";
  if (order.transaction_type === "giveaway") return "giveaway";
  if (order.cancelled_at || order.status === "cancelled") return "cancelled";
  const total = parseFloat(order.amounts?.total?.amount ?? order.amounts?.subtotal?.amount ?? "NaN");
  if (total === 0) return "$0 order";
  if (!order.show_id) return "not from a show";
  return "";
}

export function buyerName(order) {
  const b = order?.buyer;
  return (b && (b.username || b.display_name)) || "";
}

export function pricePaid(order, item) {
  const n = parseFloat(item?.unit_price?.amount ?? order?.amounts?.subtotal?.amount ?? "");
  return Number.isFinite(n) ? n : 0;
}
