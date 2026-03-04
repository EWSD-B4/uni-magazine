import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f3f4f6_65%,_#e2e8f0_100%)] px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Terms & Conditions
            </p>
            <h1 className="font-[var(--font-display)] text-3xl text-slate-900">
              Submission Guidelines
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/login">Return to login</Link>
          </Button>
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-lg">Editorial standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>
              Drafts must be original, properly cited, and aligned with the
              university magazine style guide. Contributors are responsible for
              verifying facts and sources.
            </p>
            <Separator />
            <p>
              All submissions are reviewed for clarity, inclusivity, and
              adherence to campus policies. Edits may be requested before
              publication.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-lg">Media permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <p>
              Contributors must secure written permission for interviews,
              photography, and external media usage. Rights documentation should
              be attached with each submission.
            </p>
            <Separator />
            <p>
              Any sensitive content or research data must follow institutional
              ethics policies and may require additional review.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
