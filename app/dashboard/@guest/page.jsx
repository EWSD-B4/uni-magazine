import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function GuestDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
          Guest Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Browse public highlights and submission guidance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Submission windows</CardTitle>
            <CardDescription>Open calls and deadlines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
              Spring edition submissions close in 10 days
            </div>
            <Button className="w-full">View guidelines</Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Featured stories</CardTitle>
            <CardDescription>Spotlighted campus voices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Research that changes local communities</p>
            <p>• Design studio showcases</p>
            <p>• Alumni impact interviews</p>
            <Button variant="secondary" className="mt-2 w-full">
              Explore archive
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
