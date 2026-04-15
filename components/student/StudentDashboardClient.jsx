"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { DeadlineCard } from "@/components/DeadLineCard";
import { DataTable } from "@/components/DataTable";

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
      <span className="text-foreground font-medium">{String(value)}</span>
    ),
  },
  {
    key: "statues",
    header: "Statues",
  },
  {
    key: "date",
    header: "Submitted On",
  },
];

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function StudentDashboardClient({
  rows,
  userName,
  deadlines,
}) {
  const router = useRouter();

  const tableActions = React.useMemo(
    () => [
      {
        label: "View",
        onClick: (row) => router.push(`/dashboard/${row.id}`),
      },
      {
        label: "Edit",
        onClick: (row) => router.push(`/dashboard/${row.id}/edit`),
      },
    ],
    [router],
  );

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <Header userName={userName || "Student"} />

        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-3xl font-bold text-foreground mb-15">
            Welcome, {userName || "Student"}
          </h1>

          <div className="w-full max-w-2xl space-y-4 mb-15 rounded-lg shadow-sm border bg-background p-6">
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Submission & Updates Deadlines
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <DeadlineCard
                title="New Submissions Deadline:"
                date={formatDate(deadlines?.closureDate)}
                description="Final Date for New Submissions!"
                variant="submission"
                className="flex-1"
              />
              <DeadlineCard
                title="Final Deadline:"
                date={formatDate(deadlines?.closureFinalDate)}
                description="Last Date for Article Editions!"
                variant="update"
                className="flex-1"
              />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-8">
            My Articles
          </h3>
          <DataTable
            data={rows}
            columns={columns}
            pageSize={6}
            actions={tableActions}
          />
        </main>
      </div>
    </div>
  );
}
