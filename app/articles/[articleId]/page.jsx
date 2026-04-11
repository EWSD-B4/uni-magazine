import Link from "next/link";

import ArticleCarousel from "@/components/ArticleCarousel";
import ArticleRichContent from "@/components/ArticleRichContent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getContributionById } from "@/lib/actions/contribution.action";
import { requireAuthSession } from "@/lib/auth";
import {
  asString,
  normalizeImages,
  unwrapPayload,
} from "@/lib/helpers/contribution";

export default async function ArticleDetailPage({ params }) {
  const viewer = await requireAuthSession();
  const { articleId } = await params;
  const payload = await getContributionById(articleId, viewer.token);

  const contribution = unwrapPayload(payload);
  const title = asString(contribution?.title) || `Contribution #${articleId}`;
  const excerpt =
    asString(
      contribution?.excerpt ||
        contribution?.summary ||
        contribution?.description,
    ) || "No summary provided.";
  const faculty = asString(contribution?.faculty) || "N/A";
  const section =
    asString(contribution?.section || contribution?.category) || "N/A";
  const readTime = asString(contribution?.readTime) || "N/A";
  const author =
    asString(
      contribution?.author || contribution?.authorName || contribution?.name,
    ) || "Unknown";
  const publishedAt =
    asString(
      contribution?.publishedAt ||
        contribution?.publishDate ||
        contribution?.createdAt,
    ) || "N/A";
  const images = normalizeImages(contribution, title);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Article Detail
            </p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-slate-900">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              {excerpt}
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
            {faculty}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
            {section}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
            {readTime}
          </span>
        </div>

        {images.length ? <ArticleCarousel images={images} title={title} /> : null}

        <Card className="border-slate-200/80 bg-white/95 shadow-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Article Copy</CardTitle>
            <CardDescription>
              By {author} • Published {publishedAt}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            <ArticleRichContent source={contribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
