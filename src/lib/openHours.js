const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function dayMatches(range, day) {
  for (const part of range.split(",")) {
    const p = part.trim();
    if (p.includes("-")) {
      const [a, b] = p.split("-");
      const ai = DAY_NAMES.indexOf(a.trim());
      const bi = DAY_NAMES.indexOf(b.trim());
      const di = DAY_NAMES.indexOf(day);
      if (ai < 0 || bi < 0 || di < 0) continue;
      if (ai <= bi ? (di >= ai && di <= bi) : (di >= ai || di <= bi)) return true;
    } else if (p === day) {
      return true;
    }
  }
  return false;
}

// Best-effort evaluator for common OSM opening_hours formats.
// Returns true if clearly open now, false if clearly closed, null if unknown.
export function evalOpenNow(hours) {
  if (!hours) return null;
  const s = String(hours).trim();
  if (!s || s.toLowerCase() === "off") return false;
  if (s.toLowerCase().includes("24/7")) return true;
  const now = new Date();
  const day = DAY_NAMES[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  const re = /([A-Za-z]{2}(?:-[A-Za-z]{2})?(?:,[A-Za-z]{2}(?:-[A-Za-z]{2})?)*)?\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const dr = m[1];
    const sh = +m[2], sm = +m[3], eh = +m[4], em = +m[5];
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (end <= start) continue;
    if (!dr || dayMatches(dr, day)) {
      if (mins >= start && mins <= end) return true;
    }
  }
  return false;
}
