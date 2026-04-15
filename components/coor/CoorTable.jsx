"use client";

import * as React from "react";
import { StatCard } from "@/components/StatCard";
import { ContributionBarChart } from "@/components/ContributionBarChart";
import { StatusCard } from "@/components/StatusCard";
import { DataTable } from "@/components/DataTable";
import { UrgentTasksBanner } from "@/components/UrgentTasksBanner";
import { StatusFilter } from "@/components/StatusFilter";

const chartData = [
  { name: "SUN", contributions: 28, color: "#F26454CC" },
  { name: "MON", contributions: 12, color: "#F26454CC" },
  { name: "TUE", contributions: 15, color: "#F26454CC" },
  { name: "WED", contributions: 32, color: "#F26454CC" },
  { name: "THUR", contributions: 24, color: "#F26454CC" },
  { name: "FRI", contributions: 26, color: "#F26454CC" },
  { name: "SAT", contributions: 26, color: "#F26454CC" },
];

const articleStatuses = [
  { label: "Approved", percentage: 62, color: "#016630" },
  { label: "Pending", percentage: 24, color: "#FFDF20" },
  { label: "Rejected", percentage: 14, color: "#9F0712" },
];

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function normalizeStatus(value) {
  const normalized = asString(value).toLowerCase();
  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "pending") return "Pending";
  return "Pending";
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

function normalizeContributionRow(item, index) {
  return {
    id: asString(item?.id ?? item?.contributionId ?? item?.articleId ?? index + 1),
    title: asString(item?.title ?? item?.name ?? item?.articleTitle, "Untitled"),
    statues: normalizeStatus(item?.status ?? item?.state),
    date: toDisplayDate(
      item?.submittedAt ?? item?.createdAt ?? item?.created_at ?? item?.date,
    ),
  };
}

const columns = [
  {
    key: "id",
    header: "No.",
    render: (_, __, index) => `${index + 1}.`,
  },
  {
    key: "title",
    header: "Title",
    render: (value) => (
      <span className="font-medium text-foreground">{String(value)}</span>
    ),
  },
  {
    key: "statues",
    header: "Status",
    render: (value) => {
      const map = {
        Approved: "bg-[#016630]/10 text-[#016630]",
        Pending: "bg-[#FFDF20]/20 text-[#B8860B]",
        Rejected: "bg-[#9F0712]/10 text-[#9F0712]",
      };
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            map[value] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {value}
        </span>
      );
    },
  },
  {
    key: "date",
    header: "Submitted On",
  },
];

const tableActions = [
  { label: "View", onClick: (row) => console.log("View", row) },
  { label: "Comment", onClick: (row) => console.log("Comment", row) },
];

export default function CoorTable({ contributionsPayload }) {
  const [selectedPeriod, setSelectedPeriod] = React.useState("This Week");
  const [statusFilter, setStatusFilter] = React.useState("All Statuses");

  const allRows = React.useMemo(() => {
    const list = extractContributionList(contributionsPayload);
    return list.map((item, index) => normalizeContributionRow(item, index));
  }, [contributionsPayload]);

  const filteredRows = React.useMemo(
    () =>
      statusFilter === "All Statuses"
        ? allRows
        : allRows.filter((row) => row.statues === statusFilter),
    [allRows, statusFilter],
  );

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 space-y-6 p-6">
          <h1 className="mb-15 text-3xl font-bold text-foreground">
            Welcome, Yoh Yoh
          </h1>

          <UrgentTasksBanner
            title="14-Day Review Deadline"
            buttonText="View Urgent Tasks"
            submissionCount={8}
            message="are approaching the deadline. Please review them immediately."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Contributions" value={allRows.length} />
            <StatCard
              label="Pending Reviews"
              value={allRows.filter((row) => row.statues === "Pending").length}
            />
            <StatCard
              label="Selected Contributions"
              value={allRows.filter((row) => row.statues === "Approved").length}
            />
            <StatCard label="Total Guests" value={3} />
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
            <StatusCard
              statuses={articleStatuses}
              deadline={{
                label: "Submission deadline for Issue #12:",
                date: "Apr 15, 2026",
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">
                Selected Contributions
              </h3>
              <StatusFilter
                data={allRows}
                statusKey="statues"
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length}
              </span>{" "}
              {statusFilter === "All Statuses"
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
