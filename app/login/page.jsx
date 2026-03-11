import Link from "next/link"

import CredentialLoginForm from "@/components/CredentialLoginForm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link href="/" className="text-base font-semibold tracking-tight">
            University Magazine
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/statistics">Statistics</Link>
            </Button>
          </nav>
        </header>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Contribution System
            </span>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-slate-900 md:text-6xl">
              Publish student stories with a clear editorial flow.
            </h1>
            <p className="max-w-xl text-base text-slate-600 md:text-lg">
              Review drafts, manage deadlines, and align every article with the
              university magazine standard. This frontend is fully mocked for
              production-ready UI and flows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">Back to overview</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/terms">Submission policy</Link>
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-600 shadow-sm">
              Demo hint: use emails like `student@university.edu`,
              `coordinator@university.edu`, `manager@university.edu`,
              `admin@university.edu`, or `guest@university.edu`. You can also
              include a faculty keyword such as `engineering` or `business` in
              the email to change the mocked faculty response.
            </div>
          </div>

          <Card className="border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-right-6 duration-700">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Sign in with your campus email and password. The mocked backend
                returns role and faculty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CredentialLoginForm />
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Access is provisioned by faculty coordinators. Contact your
              coordinator if you need an account.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
