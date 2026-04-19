import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

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
import {
  getCommentsByContributionId,
  queryContributionById,
} from "@/lib/actions/contribution.action";
import { getCurrentAcademicYearDeadlines } from "@/lib/actions/student.action";
import { requireAuthSession } from "@/lib/auth";
import { isDeadlinePassed } from "@/lib/helpers/deadline";
import {
  asString,
  normalizeImages,
  unwrapPayload,
} from "@/lib/helpers/contribution";

function extractComments(payload) {
  const source = unwrapPayload(payload);
  const candidates = [
    source?.comments,
    source?.items,
    source?.list,
    source?.rows,
    source?.data,
    source,
  ];
  const direct = candidates.find((candidate) => Array.isArray(candidate));
  if (direct) return direct;

  if (
    source &&
    typeof source === "object" &&
    (source.comment || source.content || source.message || source.text)
  ) {
    return [source];
  }

  return [];
}

function toReadableDate(value) {
  const raw = asString(value);
  if (!raw) return "N/A";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toISOString();
}

function toReadableDeadline(value) {
  const raw = asString(value);
  if (!raw) return "N/A";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeComment(item, index) {
  const body = asString(
    item?.comment || item?.content || item?.message || item?.text,
  );
  if (!body) return null;

  return {
    id: asString(item?.id || item?._id || item?.commentId, `${index + 1}`),
    body,
    author: asString(
      item?.author?.name ||
        item?.user?.name ||
        item?.createdBy?.name ||
        item?.coordinator?.name ||
        item?.author ||
        item?.name,
      "Coordinator",
    ),
    date: toReadableDate(
      item?.createdAt || item?.updatedAt || item?.timestamp || item?.date,
    ),
  };
}

export default async function StudentContributionDetailPage({ params }) {
  noStore();
  const viewer = await requireAuthSession();
  if (viewer.role !== "student") {
    return null;
  }

  const { articleId } = await params;
  const payload = await queryContributionById(articleId, "student");
  const contribution = unwrapPayload(payload);
  const contributionId = asString(
    contribution?.contributionId || contribution?.id || articleId,
  );
  let deadlines = {
    closureDate: "",
    closureFinalDate: "",
  };
  try {
    deadlines = await getCurrentAcademicYearDeadlines();
  } catch {
    deadlines = {
      closureDate: "",
      closureFinalDate: "",
    };
  }
  const isEditLocked = isDeadlinePassed(deadlines?.closureFinalDate);
  const commentsPayload = await getCommentsByContributionId(contributionId);
  const comments = extractComments(commentsPayload)
    .map((item, index) => normalizeComment(item, index))
    .filter(Boolean);
  const documentEntry = Array.isArray(contribution?.documents)
    ? contribution.documents[0]
    : null;
  const docContent = documentEntry?.data || contribution?.content || "";
  const metadata = documentEntry?.metadata || {};

  const title = asString(contribution?.title) || `Contribution #${articleId}`;
  const excerpt = asString(contribution?.message) || "No summary provided.";
  const faculty =
    asString(contribution?.faculty?.facultyName || contribution?.faculty) || "N/A";
  const facultyCode = asString(contribution?.faculty?.facultyCode);
  const section =
    asString(contribution?.section || contribution?.category) || "N/A";
  const readTime = asString(contribution?.readTime) || "N/A";
  const author = asString(
    [
      asString(contribution?.author?.firstName),
      asString(contribution?.author?.lastName),
    ]
      .filter(Boolean)
      .join(" ") ||
      contribution?.author?.email ||
      contribution?.author ||
      contribution?.authorName ||
      contribution?.name,
    "Unknown",
  );
  const publishedAt =
    asString(
      contribution?.timestamp ||
        metadata?.processedAt ||
        contribution?.publishedAt ||
        contribution?.publishDate ||
        contribution?.createdAt,
    ) || "N/A";
  const images = normalizeImages(
    {
      ...contribution,
      content: docContent,
    },
    title,
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Student Contribution
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
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          {comments.length ? (
            <Button variant="ghost" asChild>
              <Link href="#coordinator-comments">
                View coordinator comments ({comments.length})
              </Link>
            </Button>
          ) : null}
          {!isEditLocked ? (
            <Button asChild>
              <Link href={`/dashboard/${articleId}/edit`}>Edit article</Link>
            </Button>
          ) : (
            <span className="text-sm font-medium text-amber-700">
              Edit deadline has passed ({toReadableDeadline(deadlines?.closureFinalDate)})
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
          {facultyCode ? `${faculty} (${facultyCode})` : faculty}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
          {section}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
          {readTime}
        </span>
        {metadata?.wordCount ? (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">
            {metadata.wordCount} words
          </span>
        ) : null}
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
          <ArticleRichContent source={{ ...contribution, content: docContent }} />
        </CardContent>
      </Card>

      {comments.length ? (
        <Card
          id="coordinator-comments"
          className="border-slate-200/80 bg-white/95 shadow-lg"
        >
          <CardHeader>
            <CardTitle className="text-xl">Coordinator Comments</CardTitle>
            <CardDescription>
              Feedback linked to this contribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
              >
                <p className="text-sm leading-6 text-slate-700">{comment.body}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {comment.author} • {comment.date}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
