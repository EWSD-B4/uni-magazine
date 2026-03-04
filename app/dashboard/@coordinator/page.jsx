import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CoordinatorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
          Coordinator Review
        </h2>
        <p className="text-sm text-muted-foreground">
          Triage incoming submissions and assign editorial feedback.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Review queue</CardTitle>
            <CardDescription>New drafts awaiting first pass.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
              12 submissions ready for review
            </div>
            <Button className="w-full">Open review board</Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Faculty notes</CardTitle>
            <CardDescription>Priority guidance from managers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Highlight interdisciplinary stories</p>
            <p>• Ensure accessibility checks</p>
            <p>• Confirm interview permissions</p>
            <Button variant="secondary" className="mt-2 w-full">
              Share feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
