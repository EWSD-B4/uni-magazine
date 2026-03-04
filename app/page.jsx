import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const HIGHLIGHTS = [
  {
    title: "Submission pipeline",
    description: "Track drafts from student pitch to final publication.",
  },
  {
    title: "Editorial checkpoints",
    description: "Coordinate reviews, approvals, and archive-ready exports.",
  },
  {
    title: "Faculty visibility",
    description: "Share progress snapshots with coordinators and managers.",
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#fdfcfb,_#f4efe8_35%,_#eef2f6_75%)]">
      <div className="pointer-events-none absolute left-10 top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(14,116,144,0.25),_transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(251,146,60,0.3),_transparent_70%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            University Magazine
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/statistics">Statistics</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </header>

        <main className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-slate-900 md:text-6xl">
              A focused workspace for magazine contributors.
            </h1>
            <p className="max-w-xl text-base text-slate-600 md:text-lg">
              Manage submissions, editorial review, and publishing readiness in
              one clean interface. Built to support student voices and faculty
              guidance with clarity.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/login">Enter dashboard</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/terms">Read guidelines</Link>
              </Button>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-4 md:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <Card key={item.title} className="bg-white/80">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {item.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="self-start border-slate-200/80 bg-white/90 shadow-xl animate-in fade-in slide-in-from-right-6 duration-700">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">Magazine timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                Pitch window opens each Monday with weekly topic prompts.
              </div>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                Editors review submissions on Thursdays and schedule revisions.
              </div>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                Final exports compile every Friday afternoon.
              </div>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/statistics">See submission stats</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
