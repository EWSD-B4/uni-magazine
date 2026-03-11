import Link from "next/link"
import { notFound } from "next/navigation"

import ArticleCarousel from "@/components/ArticleCarousel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { canViewArticle } from "@/lib/article-access"
import { requireAuthSession, ROLE_LABELS } from "@/lib/auth"
import { getArticleById } from "@/lib/mockArticles"

export default async function ArticleDetailPage({ params }) {
  const viewer = await requireAuthSession()
  const { articleId } = await params
  const article = getArticleById(articleId)

  if (!article || !canViewArticle(article, viewer)) {
    notFound()
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Article Detail
            </p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-slate-900">
              {article.title}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              {article.excerpt}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/articles">Back to articles</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
            {article.faculty}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
            {article.section}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
            {article.readTime}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
            Viewer: {ROLE_LABELS[viewer.role]}
          </span>
        </div>

        <ArticleCarousel images={article.images} title={article.title} />

        <Card className="border-slate-200/80 bg-white/95 shadow-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Article Copy</CardTitle>
            <CardDescription>
              By {article.author} • Published {article.publishedAt}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            <div className="space-y-5 text-base leading-8 text-slate-700">
              {article.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
