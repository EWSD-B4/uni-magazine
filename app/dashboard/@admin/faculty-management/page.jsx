import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faculties = [
  "Arts & Humanities",
  "Business & Economics",
  "Engineering & Design",
  "Health & Life Sciences",
  "Law & Governance",
  "Science & Technology",
]

export default function FacultyManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Faculty Management</h1>

      <Card className="border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Configured Faculties</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {faculties.map((faculty) => (
            <div
              key={faculty}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
            >
              {faculty}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
