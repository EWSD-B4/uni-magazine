function isDateOnlyString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (![year, month, day].every(Number.isFinite)) return null;

  return { year, month, day };
}

function toLocalEndOfDay(parts) {
  if (!parts) return null;
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    23,
    59,
    59,
    999,
  );
}

function isIsoMidnightUtc(value) {
  return /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?Z$/i.test(value);
}

export function parseDeadline(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;

  if (isDateOnlyString(raw)) {
    return toLocalEndOfDay(parseDateParts(raw));
  }

  if (isIsoMidnightUtc(raw)) {
    const dateOnly = raw.slice(0, 10);
    return toLocalEndOfDay(parseDateParts(dateOnly));
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function isDeadlinePassed(value, now = Date.now()) {
  const deadline = parseDeadline(value);
  if (!deadline) return false;
  return now > deadline.getTime();
}
