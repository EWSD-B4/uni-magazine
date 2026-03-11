import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { filterArticlesForViewer } from "@/lib/article-access"
import { requireAuthSession } from "@/lib/auth"
import { listArticles } from "@/lib/mockArticles"

export default async function ArticlesPage() {
  const viewer = await requireAuthSession()
  const articles = filterArticlesForViewer(listArticles(), viewer)

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Articles
            </p>
            <h1 className="font-[var(--font-display)] text-4xl text-slate-900">
              Faculty Article Listings
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Browse available articles in your access scope.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/statistics">Statistics</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {articles.length} articles
          </span>
        </div>

        <Separator />

        {articles.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article, index) => (
              <Card
                key={article.id}
                className="overflow-hidden border-slate-200/80 bg-white/90 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={article.images[0].src}
                    alt={article.images[0].alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                  />
                </div>
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      {article.faculty}
                    </span>
                    <span>{article.section}</span>
                  </div>
                  <CardTitle className="text-xl leading-snug">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/articles/${article.id}`}>Read article</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-slate-200/80 bg-white/90">
            <CardHeader>
              <CardTitle>No articles in scope</CardTitle>
              <CardDescription>
                This account does not currently have any mocked articles for the
                selected faculty.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
