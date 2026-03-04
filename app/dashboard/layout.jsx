import Link from "next/link"

import { logoutAction as adminLogout } from "@/lib/actions/admin.action"
import { logoutAction as coordinatorLogout } from "@/lib/actions/coordinator.action"
import { logoutAction as guestLogout } from "@/lib/actions/guest.action"
import { logoutAction as managerLogout } from "@/lib/actions/manager.action"
import { logoutAction as studentLogout } from "@/lib/actions/student.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { isFacultyScopedRole, requireAuthSession, ROLE_LABELS } from "@/lib/auth"

const ROLE_TO_LOGOUT = {
  student: studentLogout,
  coordinator: coordinatorLogout,
  manager: managerLogout,
  admin: adminLogout,
  guest: guestLogout,
}

export default async function DashboardLayout({
  student,
  coordinator,
  manager,
  admin,
  guest,
}) {
  const { role, faculty } = await requireAuthSession()

  const normalizedRole = role
  const logoutAction = ROLE_TO_LOGOUT[normalizedRole] || guestLogout
  const content =
    {
      student,
      coordinator,
      manager,
      admin,
      guest,
    }[normalizedRole] || guest
  const resolvedContent = content ?? (
    <Card className="border-slate-200/80 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle>This dashboard page is not available for your role.</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-600">
        Open an allowed dashboard page or return to the article listings.
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f6_60%,_#e2e8f0_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="font-[var(--font-display)] text-3xl text-slate-900">
              University Magazine
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Role: {ROLE_LABELS[normalizedRole]}
            </span>
            {isFacultyScopedRole(normalizedRole) && faculty ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                Faculty: {faculty}
              </span>
            ) : null}
            <Button variant="ghost" asChild>
              <Link href="/articles">Articles</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/statistics">Statistics</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </div>
        </header>

        <Separator className="my-6" />
        <main className="flex-1">{resolvedContent}</main>
      </div>
    </div>
  )
}
