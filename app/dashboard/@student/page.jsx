import StudentDashboardClient from "@/components/student/StudentDashboardClient";
import { getContributionListing } from "@/lib/actions/contribution.action";
import { getCurrentAcademicYearDeadlines } from "@/lib/actions/student.action";
import { requireAuthSession } from "@/lib/auth";
import { unwrapPayload } from "@/lib/helpers/contribution";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function normalizeStatus(value) {
  const normalized = asString(value).trim().toLowerCase();
  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "pending") return "Pending";
  return "Pending";
}

function formatSubmittedDate(value) {
  const raw = asString(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function extractContributionList(payload) {
  const source = unwrapPayload(payload);
  const candidates = [
    source?.contributions,
    source?.contributionList,
    source?.rows,
    source?.items,
    source?.list,
    source?.data,
    source?.results,
    source,
  ];
  const direct = candidates.find((candidate) => Array.isArray(candidate));
  if (direct) return direct;

  if (
    source &&
    typeof source === "object" &&
    (source.title || source.contributionId || source.id)
  ) {
    return [source];
  }

  const visited = new Set();
  const queue = [source];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) {
      if (
        current.length &&
        current.some(
          (item) =>
            item &&
            typeof item === "object" &&
            (item.title || item.contributionId || item.id || item.articleId),
        )
      ) {
        return current;
      }
      current.forEach((entry) => {
        if (entry && typeof entry === "object") queue.push(entry);
      });
      continue;
    }

    Object.values(current).forEach((value) => {
      if (value && typeof value === "object") queue.push(value);
    });
  }

  return [];
}

function normalizeContributionRow(item, index) {
  return {
    id: asString(item?.id ?? item?.contributionId ?? item?.articleId ?? index + 1),
    title: asString(item?.title ?? item?.name ?? item?.articleTitle, "Untitled"),
    statues: normalizeStatus(item?.status ?? item?.state),
    date: formatSubmittedDate(
      item?.submittedAt ?? item?.createdAt ?? item?.created_at ?? item?.date,
    ),
  };
}

export default async function StudentDashboardPage() {
  const [session, contributionsPayload, deadlines] = await Promise.all([
    requireAuthSession(),
    getContributionListing("student"),
    getCurrentAcademicYearDeadlines(),
  ]);

  const contributions = extractContributionList(contributionsPayload);
  const rows = contributions.map((item, index) =>
    normalizeContributionRow(item, index),
  );

  return (
    <StudentDashboardClient
      rows={rows}
      userName={session.name}
      deadlines={deadlines}
    />
  );
}
