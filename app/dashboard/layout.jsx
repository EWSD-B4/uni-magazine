import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAuthSession } from "@/lib/auth"

export default async function DashboardLayout({
  student,
  coordinator,
  manager,
  admin,
  guest,
}) {
  const { role } = await requireAuthSession()

  const normalizedRole = role
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
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
      <main className="flex-1">{resolvedContent}</main>
    </div>
  )
}
