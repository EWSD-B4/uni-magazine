function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

const STATUS_STYLE_MAP = {
  pending: {
    key: "pending",
    label: "Pending",
    badgeClass: "bg-amber-100 text-amber-800",
  },
  under_review: {
    key: "under_review",
    label: "Under Review",
    badgeClass: "bg-sky-100 text-sky-800",
  },
  submitted: {
    key: "submitted",
    label: "Submitted",
    badgeClass: "bg-emerald-100 text-emerald-800",
  },
  flagged_plagiarism: {
    key: "flagged_plagiarism",
    label: "Flagged Plagiarism",
    badgeClass: "bg-rose-100 text-rose-800",
  },
  rejected: {
    key: "rejected",
    label: "Rejected",
    badgeClass: "bg-red-100 text-red-800",
  },
};

const STATUS_ALIASES = {
  pending: "pending",
  under_review: "under_review",
  "under review": "under_review",
  submitted: "submitted",
  flagged_plagiarism: "flagged_plagiarism",
  "flagged plagiarism": "flagged_plagiarism",
  rejected: "rejected",

  // Backward compatibility for older payloads
  approved: "submitted",
  selected: "submitted",
};

export function normalizeContributionStatusKey(value) {
  const normalized = asString(value).trim().toLowerCase();
  if (!normalized) return "";
  return STATUS_ALIASES[normalized] || normalized.replace(/\s+/g, "_");
}

export function getContributionStatusMeta(value) {
  const key = normalizeContributionStatusKey(value);
  const known = STATUS_STYLE_MAP[key];
  if (known) return known;

  if (!key) {
    return {
      key: "",
      label: "-",
      badgeClass: "bg-slate-100 text-slate-600",
    };
  }

  return {
    key,
    label: key
      .split("_")
      .filter(Boolean)
      .map((segment) => segment[0].toUpperCase() + segment.slice(1))
      .join(" "),
    badgeClass: "bg-slate-100 text-slate-700",
  };
}

export function getContributionStatusLabel(value, fallback = "-") {
  const meta = getContributionStatusMeta(value);
  return meta.label || fallback;
}

export function getContributionStatusBadgeClass(value) {
  return getContributionStatusMeta(value).badgeClass;
}

export const CONTRIBUTION_STATUS_OPTIONS = [
  STATUS_STYLE_MAP.pending,
  STATUS_STYLE_MAP.under_review,
  STATUS_STYLE_MAP.submitted,
  STATUS_STYLE_MAP.flagged_plagiarism,
  STATUS_STYLE_MAP.rejected,
];
