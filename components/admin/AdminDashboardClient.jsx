"use client";

import * as React from "react";
import { MostViewedPage } from "@/components/MostViewedPage";
import { MostActiveUsers } from "@/components/MostActiveUsers";
import { BrowserUsageChart } from "@/components/BrowserUsageChart";
import { ContributionBarChart } from "@/components/ContributionBarChart";

export default function AdminDashboardClient({
  mostViewedPages,
  mostActiveUsers,
  browserUsage,
  contributionChart,
  loadError,
}) {
  const [selectedPeriod, setSelectedPeriod] = React.useState("This Semester");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f6_60%,_#e2e8f0_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <div className="flex min-h-screen">
          <div className="flex-1 flex flex-col">
            <main className="flex-1 space-y-6 p-6">
              <h1 className="mb-15 text-3xl font-bold text-foreground">
                System Monitoring
              </h1>

              {loadError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {loadError}
                </p>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                <MostViewedPage data={mostViewedPages} />
                <MostActiveUsers data={mostActiveUsers} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <BrowserUsageChart data={browserUsage} />
                <ContributionBarChart
                  data={contributionChart}
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
