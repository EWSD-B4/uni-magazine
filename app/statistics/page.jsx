import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const STAT_ITEMS = [
  { label: "Active submissions", value: "128" },
  { label: "Under review", value: "47" },
  { label: "Approved for export", value: "22" },
]

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f6_60%,_#e2e8f0_100%)] px-6 py-12">
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
          {STAT_ITEMS.map((item) => (
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
            <p>
              Activity metrics are displayed as placeholders until analytics are
              connected. This section will summarize trends across faculties,
              review times, and publication cadence.
            </p>
            <Separator />
            <p>
              Replace these figures with live data once the backend reporting
              pipeline is available.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
