import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getBrowserUsageAnalytics,
  getMostViewedPagesAnalytics,
} from "@/lib/actions/admin.action";

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function StatisticsPage() {
  const [mostViewedResult, browserUsageResult] = await Promise.allSettled([
    getMostViewedPagesAnalytics(),
    getBrowserUsageAnalytics(),
  ]);

  const mostViewed =
    mostViewedResult.status === "fulfilled" ? mostViewedResult.value : [];
  const browserUsage =
    browserUsageResult.status === "fulfilled" ? browserUsageResult.value : [];
  const loadError =
    mostViewedResult.status === "rejected" || browserUsageResult.status === "rejected"
      ? "Unable to load full statistics from backend."
      : "";

  const totalViews = mostViewed.reduce(
    (sum, item) => sum + asNumber(item?.views ?? item?.count ?? item?.total),
    0,
  );
  const totalBrowsers = browserUsage.length;
  const topBrowser =
    browserUsage
      .slice()
      .sort((a, b) => asNumber(b?.value) - asNumber(a?.value))[0]?.name || "-";

  const statItems = [
    { label: "Tracked pages", value: String(mostViewed.length) },
    { label: "Total page views", value: String(totalViews) },
    { label: "Top browser", value: topBrowser },
  ];

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Statistics
            </p>
            <h1 className="font-[var(--font-display)] text-3xl text-slate-900">
              Submission Snapshot
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/login">Return to login</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statItems.map((item) => (
            <Card key={item.label} className="bg-white/90">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base text-muted-foreground">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold text-slate-900">
                {item.value}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-lg">Weekly activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {loadError ? <p>{loadError}</p> : null}
            <Separator />
            <p>
              Browser groups received from backend: {totalBrowsers}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
