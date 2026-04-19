import { redirect } from "next/navigation";

import ManagerDashboardClient from "@/components/manager/ManagerDashboardClient";
import { getContributionListing } from "@/lib/actions/contribution.action";
import { requireAuthSession } from "@/lib/auth";
import { unwrapPayload } from "@/lib/helpers/contribution";

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

function normalizeStatus(value) {
  const normalized = asString(value).trim().toLowerCase();
  if (normalized === "approved" || normalized === "selected") return "Approved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "pending" || normalized === "under review") return "Pending";
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
  return [];
}

function normalizeContributionRow(item, index) {
  return {
    id: asString(item?.id ?? item?.contributionId ?? item?.articleId ?? index + 1),
    title: asString(item?.title ?? item?.name ?? item?.articleTitle, "Untitled"),
    status: normalizeStatus(item?.status ?? item?.state),
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
  const approved = rows.filter((row) => row.status === "Approved").length;
  const pending = rows.filter((row) => row.status === "Pending").length;
  const rejected = rows.filter((row) => row.status === "Rejected").length;

  return [
    {
      label: "Approved",
      percentage: Math.round((approved / total) * 100),
      color: "#016630",
    },
    {
      label: "Pending",
      percentage: Math.round((pending / total) * 100),
      color: "#FFDF20",
    },
    {
      label: "Rejected",
      percentage: Math.round((rejected / total) * 100),
      color: "#9F0712",
    },
  ];
}

export default async function ManagerDashboardPage() {
  const viewer = await requireAuthSession();
  if (viewer.role !== "manager") {
    redirect("/dashboard");
  }

  const payloadResult = await Promise.allSettled([getContributionListing("manager")]);
  const payload =
    payloadResult[0].status === "fulfilled" ? payloadResult[0].value : null;
  const loadError =
    payloadResult[0].status === "rejected"
      ? payloadResult[0].reason instanceof Error
        ? payloadResult[0].reason.message
        : "Failed to load manager contributions."
      : "";

  const rows = extractContributionList(payload).map((item, index) =>
    normalizeContributionRow(item, index),
  );

  return (
    <ManagerDashboardClient
      rows={rows}
      chartData={buildChartData(rows)}
      articleStatuses={buildStatusData(rows)}
      stats={{
        totalContributions: rows.length,
        pendingReviews: rows.filter((row) => row.status === "Pending").length,
        selectedContributions: rows.filter((row) => row.status === "Approved").length,
        totalFaculties: new Set(rows.map((row) => row.faculty)).size,
      }}
      loadError={loadError}
    />
  );
}
