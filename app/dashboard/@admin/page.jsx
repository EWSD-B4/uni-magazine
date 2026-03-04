import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
          Admin Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure roles, schedules, and editorial standards.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Roles & access</CardTitle>
            <CardDescription>Manage editor permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
              42 active contributors across 6 faculties
            </div>
            <Button className="w-full">Review access list</Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Editorial settings</CardTitle>
            <CardDescription>Adjust submission policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Set submission deadlines</p>
            <p>• Update policy acknowledgements</p>
            <p>• Define export naming rules</p>
            <Button variant="secondary" className="mt-2 w-full">
              Open settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
