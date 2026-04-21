import Image from "next/image";
import Link from "next/link";

import {
  getContributionListing,
  getGuestSelectedContributionListing,
} from "@/lib/actions/contribution.action";
import { requireAuthSession } from "@/lib/auth";
import { asString, normalizeImages, unwrapPayload } from "@/lib/helpers/contribution";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const FALLBACK_IMAGE = "/article-images/campus-dawn.svg";

function extractContributionList(payload) {
  const source = unwrapPayload(payload);
  const candidates = [
    source?.contributions,
    source?.items,
    source?.list,
    source,
  ];

  return candidates.find((candidate) => Array.isArray(candidate)) || [];
}

function toArticleCard(item, index) {
  const title = asString(item?.title || item?.name, `Contribution ${index + 1}`);
  const images = normalizeImages(item, title);
  const firstImage = images[0];
  const imageSrc = asString(firstImage?.src, FALLBACK_IMAGE);

  return {
    id: asString(item?.id ?? item?.contributionId ?? item?.articleId, `item-${index + 1}`),
    title,
    excerpt:
      asString(item?.excerpt || item?.summary || item?.description) ||
      "No summary provided.",
    faculty: asString(item?.faculty, "N/A"),
    section: asString(item?.section || item?.category, "N/A"),
    author: asString(item?.author || item?.authorName || item?.name, "Unknown"),
    readTime: asString(item?.readTime, "N/A"),
    image: {
      src: imageSrc,
      alt: asString(firstImage?.alt, `${title} image`),
    },
  };
}

export default async function ArticlesPage() {
  const viewer = await requireAuthSession();
  const isGuestView = viewer.role === "guest";

  const payload =
    isGuestView
      ? await getGuestSelectedContributionListing()
      : await getContributionListing("student");
  const rawList = extractContributionList(payload);
  const articles = rawList.map((item, index) => toArticleCard(item, index));

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
            {viewer.role !== "guest" ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : null}
            {viewer.role !== "guest" ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/statistics">Statistics</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/terms">Terms</Link>
                </Button>
              </>
            ) : null}
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
              isGuestView ? (
                <Card
                  key={article.id}
                  className="animate-in slide-in-from-bottom-4 overflow-hidden rounded-2xl border-slate-200/90 bg-white/95 shadow-sm fade-in duration-700 transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="h-1 w-full bg-gradient-to-r from-[#f26b5b] via-[#f8a18e] to-[#f26b5b]" />
                  <CardHeader className="space-y-4 pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2 text-slate-600">
                        <span className="rounded-full bg-[#f26b5b]/10 px-2.5 py-1 font-semibold text-[#c65345]">
                          {article.faculty}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                          {article.section}
                        </span>
                      </div>
                      <span className="text-slate-500">{article.readTime}</span>
                    </div>
                    <CardTitle className="text-xl leading-snug text-slate-900">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3 pt-1">
                    <span className="truncate text-xs text-slate-500">
                      {article.author}
                    </span>
                    <Button
                      className="rounded-full bg-[#f26b5b] px-5 text-white hover:bg-[#e55d4f]"
                      asChild
                    >
                      <Link href={`/articles/${article.id}`}>Read article</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  key={article.id}
                  className="animate-in slide-in-from-bottom-4 overflow-hidden border-slate-200/80 bg-white/90 shadow-lg fade-in duration-700"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={article.image.src}
                      alt={article.image.alt}
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
              )
            ))}
          </div>
        ) : (
          <Card className="border-slate-200/80 bg-white/90">
            <CardHeader>
              <CardTitle>No articles in scope</CardTitle>
              <CardDescription>
                There are no contributions returned from student listing right
                now.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
