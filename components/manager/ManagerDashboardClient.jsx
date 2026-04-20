"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { ContributionBarChart } from "@/components/ContributionBarChart";
import { StatusCard } from "@/components/StatusCard";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { getContributionStatusBadgeClass } from "@/lib/helpers/contribution-status";

export default function ManagerDashboardClient({
  rows,
  chartData,
  articleStatuses,
  stats,
  loadError,
}) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = React.useState("This Week");
  const [downloadError, setDownloadError] = React.useState("");
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = React.useCallback(async () => {
    setDownloadError("");
    setIsDownloading(true);

    try {
      const response = await fetch(
        "/api/manager/contributions/selected/download",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const payload = await response.json();
          setDownloadError(
            payload?.message || "Failed to download selected contributions.",
          );
          return;
        }

        const text = await response.text();
        setDownloadError(text || "Failed to download selected contributions.");
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const fileNameMatch =
        disposition.match(/filename\*=UTF-8''([^;]+)/i) ||
        disposition.match(/filename=\"?([^\";]+)\"?/i);
      const rawFileName = fileNameMatch?.[1] || "selected-contributions";
      const fileName = decodeURIComponent(rawFileName);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Failed to download selected contributions.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const tableActions = React.useMemo(
    () => [
      {
        label: "View",
        onClick: (row) => router.push(`/dashboard/${row.id}`),
      },
    ],
    [router],
  );

  const columns = React.useMemo(
    () => [
      {
        key: "id",
        header: "No.",
        render: (_value, _row, index) => `${index + 1}.`,
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
        key: "status",
        header: "Status",
        render: (value) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              getContributionStatusBadgeClass(value)
            }`}
          >
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "date",
        header: "Submitted On",
      },
      {
        key: "faculty",
        header: "Faculty",
      },
    ],
    [],
  );

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 space-y-6">
          {loadError ? (
            <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </p>
          ) : null}

          {downloadError ? (
            <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {downloadError}
            </p>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Contributions" value={stats.totalContributions} />
            <StatCard label="Pending Reviews" value={stats.pendingReviews} />
            <StatCard label="Submitted Contributions" value={stats.selectedContributions} />
            <StatCard label="Total Faculties" value={stats.totalFaculties} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ContributionBarChart
                data={chartData}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            </div>
            <StatusCard statuses={articleStatuses} />
          </div>

          <div className="mb-8 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-foreground">Contributions</h3>
            <Button
              type="button"
              onClick={() => {
                void handleDownload();
              }}
              disabled={isDownloading}
              className="bg-[#f26b5b] text-white hover:bg-[#e55d4f]"
            >
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </div>
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
