import Link from "next/link"
import { notFound } from "next/navigation"

import ArticleEditorForm from "@/components/ArticleEditorForm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { canEditArticle, canViewArticle } from "@/lib/article-access"
import { requireAuthSession } from "@/lib/auth"
import { getArticleById } from "@/lib/mockArticles"

export default async function StudentEditArticlePage({ params }) {
  const viewer = await requireAuthSession()
  const { articleId } = await params
  const article = getArticleById(articleId)

  if (!article || !canViewArticle(article, viewer) || !canEditArticle(article, viewer)) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Student Editor
          </p>
          <h1 className="font-[var(--font-display)] text-4xl leading-tight text-slate-900">
            Edit Your Article
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Update copy, refine the excerpt, and preview the draft layout.
            Saving is intentionally disabled until a real backend is added.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/articles/${article.id}`}>Back to detail</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Student dashboard</Link>
          </Button>
        </div>
      </header>

      <Card className="border-slate-200/80 bg-amber-50/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Mock editor notice</CardTitle>
          <CardDescription>
            This editor is local-only and does not submit data anywhere. It
            exists to model the student editing workflow without backend
            assumptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="rounded-full border border-amber-200 bg-white px-3 py-1 font-medium">
              Faculty: {article.faculty}
            </span>
            <span className="rounded-full border border-amber-200 bg-white px-3 py-1 font-medium">
              Author: {article.author}
            </span>
          </div>
        </CardContent>
      </Card>

      <ArticleEditorForm article={article} />
    </div>
  )
}
