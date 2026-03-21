// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"

// export default function CoordinatorDashboardPage() {
//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
//           Coordinator Review
//         </h2>
//         <p className="text-sm text-muted-foreground">
//           Triage incoming submissions and assign editorial feedback.
//         </p>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <Card className="bg-white/80">
//           <CardHeader className="space-y-2">
//             <CardTitle className="text-base">Review queue</CardTitle>
//             <CardDescription>New drafts awaiting first pass.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4 text-sm text-muted-foreground">
//             <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
//               12 submissions ready for review
//             </div>
//             <Button className="w-full">Open review board</Button>
//           </CardContent>
//         </Card>

//         <Card className="bg-white/80">
//           <CardHeader className="space-y-2">
//             <CardTitle className="text-base">Faculty notes</CardTitle>
//             <CardDescription>Priority guidance from managers.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-2 text-sm text-muted-foreground">
//             <p>• Highlight interdisciplinary stories</p>
//             <p>• Ensure accessibility checks</p>
//             <p>• Confirm interview permissions</p>
//             <Button variant="secondary" className="mt-2 w-full">
//               Share feedback
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { ContributionBarChart } from "@/components/ContributionBarChart";
import { StatusCard } from "@/components/StatusCard";
import { DataTable } from "@/components/DataTable";
import { UrgentTasksBanner } from "@/components/UrgentTasksBanner";
import { StatusFilter } from "@/components/StatusFilter";

// ─── Sample chart data ────────────────────────────────────────────────────────
const chartData = [
  { name: "SUN",  contributions: 28, color: "#F26454CC" },
  { name: "MON",  contributions: 12, color: "#F26454CC" },
  { name: "TUE",  contributions: 15, color: "#F26454CC" },
  { name: "WED",  contributions: 32, color: "#F26454CC" },
  { name: "THUR", contributions: 24, color: "#F26454CC" },
  { name: "FRI",  contributions: 26, color: "#F26454CC" },
  { name: "SAT",  contributions: 26, color: "#F26454CC" },
];

// ─── Article status breakdown (donut / status card) ───────────────────────────
const articleStatuses = [
  { label: "Approved", percentage: 62, color: "#016630" },
  { label: "Pending",  percentage: 24, color: "#FFDF20" },
  { label: "Rejected", percentage: 14, color: "#9F0712" },
];

// ─── Seed rows ────────────────────────────────────────────────────────────────
const seedRows = [
  { id: 1, title: "The Future of Technology", statues: "Approved", date: "Feb 07, 2026" },
  { id: 2, title: "The Future of Technology", statues: "Approved", date: "Feb 07, 2026" },
  { id: 3, title: "The Future of Arts",        statues: "Rejected", date: "Feb 07, 2026" },
  { id: 4, title: "The Future of Physics",     statues: "Rejected", date: "Feb 07, 2026" },
  { id: 5, title: "The Future of Maths",       statues: "Pending",  date: "Feb 07, 2026" },
  { id: 6, title: "The Future of English",     statues: "Pending",  date: "Feb 07, 2026" },
];

// Generate filler rows so the table has realistic volume
const generateRows = () => {
  const titles  = ["The Future of Technology", "The Future of Arts", "The Future of Physics",
                   "The Future of Maths", "The Future of English", "The Future of Science"];
  const statuses = ["Approved", "Rejected", "Pending"];
  return Array.from({ length: 122 }, (_, i) => ({
    id:     i + 7,
    title:  titles[i % titles.length],
    statues: statuses[i % statuses.length],
    date:   "Feb 07, 2026",
  }));
};

const ALL_ROWS = [...seedRows, ...generateRows()];

// ─── Table columns ────────────────────────────────────────────────────────────
const columns = [
  {
    key:    "id",
    header: "No.",
    render: (_, __, index) => `${index + 1}.`,
  },
  {
    key:    "title",
    header: "Title",
    render: (value) => (
      <span className="font-medium text-foreground">{String(value)}</span>
    ),
  },
  {
    key:    "statues",
    header: "Status",
    render: (value) => {
      const map = {
        Approved: "bg-[#016630]/10 text-[#016630]",
        Pending:  "bg-[#FFDF20]/20 text-[#B8860B]",
        Rejected: "bg-[#9F0712]/10 text-[#9F0712]",
      };
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[value] ?? "bg-slate-100 text-slate-600"}`}
        >
          {value}
        </span>
      );
    },
  },
  {
    key:    "date",
    header: "Submitted On",
  },
];

const tableActions = [
  { label: "View",    onClick: (row) => console.log("View", row) },
  { label: "Comment", onClick: (row) => console.log("Comment", row) },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoordinatorDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("This Week");

  // ── Status filter state ──
  const [statusFilter, setStatusFilter] = React.useState("All Statuses");

  // ── Derived filtered rows ──
  const filteredRows = React.useMemo(
    () =>
      statusFilter === "All Statuses"
        ? ALL_ROWS
        : ALL_ROWS.filter((r) => r.statues === statusFilter),
    [statusFilter]
  );

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header userName="Yoh Yoh" />

        {/* Page Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome */}
          <h1 className="text-3xl font-bold text-foreground mb-15">
            Welcome, Yoh Yoh
          </h1>

          {/* 14-day deadline banner */}
          <UrgentTasksBanner
            title="14-Day Review Deadline"
            buttonText="View Urgent Tasks"
            submissionCount={8}
            message="are approaching the deadline. Please review them immediately."
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Contributions"   value={284} />
            <StatCard label="Pending Reviews"        value={12}  />
            <StatCard label="Selected Contributions" value={56}  />
            <StatCard label="Total Guests"           value={3}   />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                date:  "Apr 15, 2026",
              }}
            />
          </div>

          {/* ── Table section ── */}
          <div className="space-y-4">
            {/* Section header + filter */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">
                Selected Contributions
              </h3>

              {/* 🔴 Status filter dropdown — connected to table data */}
              <StatusFilter
                data={ALL_ROWS}
                statusKey="statues"
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            {/* Result count hint */}
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredRows.length}
              </span>{" "}
              {statusFilter === "All Statuses" ? "contributions" : `"${statusFilter}" contributions`}
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