"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { ContributionBarChart } from "@/components/ContributionBarChart";
import { StatusCard } from "@/components/StatusCard";
import { DataTable } from "@/components/DataTable";
import { UrgentTasksBanner } from "@/components/UrgentTasksBanner";
import { StatusFilter } from "@/components/StatusFilter";
import SubmissionDeadlinesSection from "@/components/student/SubmissionDeadlinesSection";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function normalizeStatus(value) {
  const raw = asString(value).trim();
  if (!raw) return "-";

  const normalized = raw.toLowerCase();
  if (normalized === "approved" || normalized === "selected") return "Selected";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "pending" || normalized === "under review") return "Under Review";
  return raw;
}

function normalizePlagiarismStatus(value) {
  if (typeof value === "boolean") {
    return value ? "Flagged" : "Clear";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return asString(value).trim();
}

function toDisplayDate(value) {
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
  const source = payload?.data ?? payload;
  const candidates = [
    source?.contributions,
    source?.items,
    source?.list,
    source,
  ];
  return candidates.find((candidate) => Array.isArray(candidate)) || [];
}

function extractTotalGuests(payload) {
  const source = payload?.data ?? payload;
  const candidate =
    source?.totalGuests ??
    source?.guests ??
    source?.guestCount ??
    source?.totals?.guests ??
    source?.summary?.guests;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeContributionRow(item, index) {
  const hasStatusField =
    item && typeof item === "object" && Object.prototype.hasOwnProperty.call(item, "status");
  const plagiarismStatus = normalizePlagiarismStatus(
    item?.plagiarismStatus ??
      item?.plagiarism_status ??
      item?.plagiarismResult ??
      item?.plagiarism_result ??
      item?.similarityStatus ??
      item?.similarity_status ??
      item?.plagiarism?.status,
  );

  return {
    id: asString(item?.id ?? item?.contributionId ?? item?.articleId ?? index + 1),
    title: asString(item?.title ?? item?.name ?? item?.articleTitle, "Untitled"),
    faculty: asString(item?.faculty?.facultyName ?? item?.faculty ?? "N/A"),
    statues: hasStatusField ? normalizeStatus(item?.status) : "",
    hasStatusField,
    plagiarismStatus,
    date: toDisplayDate(
      item?.submittedAt ?? item?.createdAt ?? item?.created_at ?? item?.date,
    ),
  };
}

export default function CoorTable({
  contributionsPayload,
  urgentTasksPayload,
  deadlines,
}) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = React.useState("This Week");
  const [statusFilter, setStatusFilter] = React.useState("All Statuses");

  const allRows = React.useMemo(() => {
    const list = extractContributionList(contributionsPayload);
    return list.map((item, index) => normalizeContributionRow(item, index));
  }, [contributionsPayload]);

  const hasStatusField = React.useMemo(
    () => allRows.some((row) => Boolean(row?.hasStatusField)),
    [allRows],
  );

  const showPlagiarismStatus = React.useMemo(
    () =>
      allRows.some((row) => {
        const value = asString(row?.plagiarismStatus).trim();
        return Boolean(value);
      }),
    [allRows],
  );

  const showStatus = hasStatusField;

  const filteredRows = React.useMemo(
    () =>
      !showStatus
        ? allRows
        : statusFilter === "All Statuses"
        ? allRows
        : allRows.filter((row) => row.statues === statusFilter),
    [allRows, showStatus, statusFilter],
  );

  const columns = React.useMemo(() => {
    const mapped = [
      {
        key: "id",
        header: "No.",
        render: (_, __, index) => `${index + 1}.`,
      },
      {
        key: "title",
        header: "Title",
        render: (value, row) => (
          <Link
            href={`/dashboard/${row.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {String(value)}
          </Link>
        ),
      },
    ];

    if (showStatus) {
      mapped.push({
        key: "statues",
        header: "Status",
        render: (value) => {
          const map = {
            Selected: "bg-[#016630]/10 text-[#016630]",
            "Under Review": "bg-[#FFDF20]/20 text-[#B8860B]",
            Rejected: "bg-[#9F0712]/10 text-[#9F0712]",
          };
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                map[value] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {asString(value, "-")}
            </span>
          );
        },
      });
    }

    if (showPlagiarismStatus) {
      mapped.push({
        key: "plagiarismStatus",
        header: "Plagiarism Status",
        render: (value) => asString(value, "-"),
      });
    }

    mapped.push({
      key: "date",
      header: "Submitted On",
    });

    return mapped;
  }, [showPlagiarismStatus, showStatus]);

  const chartData = React.useMemo(() => {
    const colorPalette = ["#F26454CC", "#22C55ECC", "#FBBF24CC", "#3B82F6CC", "#A855F7CC"];
    const byFaculty = new Map();

    allRows.forEach((row) => {
      const key = asString(row.faculty, "N/A");
      byFaculty.set(key, (byFaculty.get(key) || 0) + 1);
    });

    return Array.from(byFaculty.entries())
      .map(([name, contributions], index) => ({
        name,
        contributions,
        color: colorPalette[index % colorPalette.length],
      }))
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 6);
  }, [allRows]);

  const articleStatuses = React.useMemo(() => {
    const total = allRows.length || 1;
    const selected = allRows.filter((row) => row.statues === "Selected").length;
    const underReview = allRows.filter((row) => row.statues === "Under Review").length;
    const rejected = allRows.filter((row) => row.statues === "Rejected").length;

    return [
      {
        label: "Selected",
        percentage: Math.round((selected / total) * 100),
        color: "#016630",
      },
      {
        label: "Under Review",
        percentage: Math.round((underReview / total) * 100),
        color: "#FFDF20",
      },
      {
        label: "Rejected",
        percentage: Math.round((rejected / total) * 100),
        color: "#9F0712",
      },
    ];
  }, [allRows]);

  const totalGuests = React.useMemo(
    () => extractTotalGuests(contributionsPayload),
    [contributionsPayload],
  );

  const urgentTasks = React.useMemo(
    () =>
      Array.isArray(urgentTasksPayload?.tasks)
        ? urgentTasksPayload.tasks.filter((item) => item?.id && item?.title)
        : [],
    [urgentTasksPayload],
  );
  const urgentTasksError = React.useMemo(
    () =>
      Array.isArray(urgentTasksPayload?.errors)
        ? urgentTasksPayload.errors.filter(Boolean).join(" ")
        : "",
    [urgentTasksPayload],
  );

  const tableActions = React.useMemo(
    () => [
      { label: "View", onClick: (row) => router.push(`/dashboard/${row.id}`) },
      {
        label: "Comment",
        onClick: (row) => router.push(`/dashboard/${row.id}#coordinator-comments`),
      },
    ],
    [router],
  );

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 space-y-6 p-6">
          <SubmissionDeadlinesSection deadlines={deadlines} />

          <UrgentTasksBanner
            title="14-Day Review Deadline"
            buttonText="View Urgent Tasks"
            submissionCount={urgentTasks.length}
            message={
              urgentTasks.length
                ? "need your review. Open task list and continue review."
                : "No urgent submissions right now."
            }
            urgentTasks={urgentTasks}
            urgentTasksError={urgentTasksError}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Contributions" value={allRows.length} />
            <StatCard
              label="Under Review"
              value={allRows.filter((row) => row.statues === "Under Review").length}
            />
            <StatCard
              label="Selected Contributions"
              value={allRows.filter((row) => row.statues === "Selected").length}
            />
            <StatCard label="Total Guests" value={totalGuests} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ContributionBarChart
                title="Weekly Contribution Distribution"
                data={chartData}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            </div>
            <StatusCard statuses={articleStatuses} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">
                Selected Contributions
              </h3>
              {showStatus ? (
                <StatusFilter
                  data={allRows}
                  statusKey="statues"
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length}
              </span>{" "}
              {!showStatus || statusFilter === "All Statuses"
                ? "contributions"
                : `"${statusFilter}" contributions`}
            </p>

            <DataTable
              data={filteredRows}
              columns={columns}
              pageSize={6}
              actions={tableActions}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
