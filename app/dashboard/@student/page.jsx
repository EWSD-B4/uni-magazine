import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { canEditArticle } from "@/lib/article-access"
import { requireAuthSession } from "@/lib/auth"
import { listArticles } from "@/lib/mockArticles"

export default async function StudentDashboardPage() {
  const viewer = await requireAuthSession()
  const ownedArticles = listArticles().filter((article) =>
    canEditArticle(article, viewer)
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
          Student Submission
        </h2>
        <p className="text-sm text-muted-foreground">
          Draft your article, attach assets, and monitor review progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Current draft</CardTitle>
            <CardDescription>Outline and submission status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {ownedArticles.length ? (
              <div className="space-y-3">
                {ownedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="font-medium text-slate-800">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {article.section} • {article.readTime}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                No owned drafts available yet.
              </div>
            )}
            <Button className="w-full" asChild>
              <Link href="/articles">Browse articles</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">Submission checklist</CardTitle>
            <CardDescription>Before you share with editors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Confirm faculty approval</p>
            <p>• Add images and captions</p>
            <p>• Include required credits</p>
            <Button variant="secondary" className="mt-2 w-full">
              Request review
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/85">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Edit your drafts</CardTitle>
          <CardDescription>
            Editing is only available from the student dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ownedArticles.length ? (
            ownedArticles.map((article) => (
              <div
                key={article.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">{article.title}</p>
                  <p className="text-xs text-slate-500">
                    {article.faculty} • {article.section}
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/${article.id}/edit`}>Edit draft</Link>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              You do not have any editable drafts in the mocked dataset.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
