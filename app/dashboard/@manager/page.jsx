import ManagerDashboardClient from "@/components/manager/ManagerDashboardClient";
import { getManagerSelectedContributionListing } from "@/lib/actions/contribution.action";
import { requireAuthSession } from "@/lib/auth";
import { unwrapPayload } from "@/lib/helpers/contribution";
import { getContributionStatusLabel } from "@/lib/helpers/contribution-status";

const chartColors = [
  "#F26454CC",
  "#22C55ECC",
  "#FBBF24CC",
  "#3B82F6CC",
  "#A855F7CC",
  "#14B8A6CC",
];

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
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
    source?.selectedContributions,
    source?.selected,
    source?.approvedContributions,
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
    (source.title || source.id || source.contributionId || source.articleId)
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
      const records = current.filter((item) => item && typeof item === "object");
      if (
        records.some(
          (item) => item.title || item.id || item.contributionId || item.articleId,
        )
      ) {
        return records;
      }
      records.forEach((item) => queue.push(item));
      continue;
    }

    Object.values(current).forEach((value) => {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    });
  }

  return [];
}

function normalizeContributionRow(item, index) {
  return {
    id: asString(item?.id ?? item?.contributionId ?? item?.articleId ?? index + 1),
    title: asString(item?.title ?? item?.name ?? item?.articleTitle, "Untitled"),
    status: getContributionStatusLabel(item?.status ?? item?.state),
    date: formatSubmittedDate(
      item?.submittedAt ?? item?.createdAt ?? item?.created_at ?? item?.date,
    ),
    faculty: asString(item?.faculty?.facultyName ?? item?.faculty, "N/A"),
  };
}

function buildChartData(rows) {
  const byFaculty = new Map();
  rows.forEach((row) => {
    const key = asString(row.faculty, "N/A").toUpperCase();
    byFaculty.set(key, (byFaculty.get(key) || 0) + 1);
  });

  return Array.from(byFaculty.entries())
    .map(([name, contributions], index) => ({
      name,
      contributions,
      color: chartColors[index % chartColors.length],
    }))
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 6);
}

function buildStatusData(rows) {
  const total = rows.length || 1;
  const selected = rows.filter((row) => row.status === "Selected").length;
  const underReview = rows.filter(
    (row) => row.status === "Under Review" || row.status === "Pending",
  ).length;
  const rejected = rows.filter((row) => row.status === "Rejected").length;

  return [
    {
      label: "Selected",
      percentage: Math.round((selected / total) * 100),
      color: "#059669",
    },
    {
      label: "Under Review",
      percentage: Math.round((underReview / total) * 100),
      color: "#0EA5E9",
    },
    {
      label: "Rejected",
      percentage: Math.round((rejected / total) * 100),
      color: "#DC2626",
    },
  ];
}

export default async function ManagerDashboardPage() {
  const viewer = await requireAuthSession();
  if (viewer.role !== "manager") {
    return null;
  }

  const payloadResult = await Promise.allSettled([
    getManagerSelectedContributionListing(),
  ]);
  const selectedPayload =
    payloadResult[0].status === "fulfilled" ? payloadResult[0].value : null;

  const loadErrors = [];
  if (payloadResult[0].status === "rejected") {
    loadErrors.push(
      payloadResult[0].reason instanceof Error
        ? payloadResult[0].reason.message
        : "Failed to load manager selected contributions.",
    );
  }

  const tableRows = extractContributionList(selectedPayload).map((item, index) =>
    normalizeContributionRow(item, index),
  );

  return (
    <ManagerDashboardClient
      rows={tableRows}
      chartData={buildChartData(tableRows)}
      articleStatuses={buildStatusData(tableRows)}
      stats={{
        totalContributions: tableRows.length,
        pendingReviews: tableRows.filter(
          (row) => row.status === "Under Review" || row.status === "Pending",
        ).length,
        selectedContributions: tableRows.filter((row) => row.status === "Selected").length,
        totalFaculties: new Set(tableRows.map((row) => row.faculty)).size,
      }}
      loadError={loadErrors.join(" ")}
    />
  );
}
