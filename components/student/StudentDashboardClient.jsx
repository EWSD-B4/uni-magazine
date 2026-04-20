"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import SubmissionDeadlinesSection from "@/components/student/SubmissionDeadlinesSection";
import { getContributionStatusBadgeClass } from "@/lib/helpers/contribution-status";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export default function StudentDashboardClient({ rows, userName, deadlines }) {
  const router = useRouter();
  const hasStatusField = React.useMemo(
    () => rows.some((row) => Boolean(row?.hasStatusField)),
    [rows],
  );
  const showPlagiarismStatus = React.useMemo(
    () =>
      rows.some((row) => {
        const value = asString(row?.plagiarismStatus).trim();
        return Boolean(value);
      }),
    [rows],
  );
  const showStatus = hasStatusField;

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
            className="text-foreground font-medium hover:underline"
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
        render: (value) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              getContributionStatusBadgeClass(value)
            }`}
          >
            {asString(value, "-")}
          </span>
        ),
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
          {rows.length ? (
            <DataTable
              data={rows}
              columns={columns}
              pageSize={6}
              actions={tableActions}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-base font-medium text-slate-800">
                You have no contributions yet.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Start your first submission now.
              </p>
              <Button asChild className="mt-5 bg-[#f26b5b] hover:bg-[#e55d4f]">
                <Link href="/dashboard/submit">Create one</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
