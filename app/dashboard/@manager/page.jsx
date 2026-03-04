import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
          Manager ZIP Downloads
        </h2>
        <p className="text-sm text-muted-foreground">
          Package approved submissions for archival and publishing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Latest export</CardTitle>
            <CardDescription>All approved articles this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
              18 stories ready for ZIP export
            </div>
            <Button className="w-full">Download ZIP</Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Publishing checklist</CardTitle>
            <CardDescription>Final QA before release.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Metadata and tags verified</p>
            <p>• Image rights documented</p>
            <p>• Accessibility review completed</p>
            <Button variant="secondary" className="mt-2 w-full">
              Mark ready
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
