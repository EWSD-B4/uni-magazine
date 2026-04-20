function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function formatTimestampToMinute(value, fallback = "N/A") {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return fallback;
    return value.toISOString().slice(0, 16).replace("T", " ");
  }

  const raw = asString(value).trim();
  if (!raw) return fallback;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toISOString().slice(0, 16).replace("T", " ");
}
