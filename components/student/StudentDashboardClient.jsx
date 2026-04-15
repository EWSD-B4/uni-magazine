"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import SubmissionDeadlinesSection from "@/components/student/SubmissionDeadlinesSection";

const columns = [
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
        className="text-foreground font-medium hover:underline"
      >
        {String(value)}
      </Link>
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

export default function StudentDashboardClient({ rows, userName, deadlines }) {
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
        <main className="flex-1 p-6 space-y-6">
          <SubmissionDeadlinesSection deadlines={deadlines} />

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
