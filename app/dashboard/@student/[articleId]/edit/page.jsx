import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import StudentContributionEditForm from "@/components/student/StudentContributionEditForm";
import SubmissionDeadlinesSection from "@/components/student/SubmissionDeadlinesSection";
import { Button } from "@/components/ui/button";
import { getCurrentAcademicYearDeadlines } from "@/lib/actions/student.action";
import { getStudentContributionContentById } from "@/lib/actions/contribution.action";
import { requireAuthSession } from "@/lib/auth";
import { isDeadlinePassed } from "@/lib/helpers/deadline";
import { asString, unwrapPayload } from "@/lib/helpers/contribution";

function normalizeUploadedImages(contribution, fallbackTitle) {
  const documentEntry = Array.isArray(contribution?.documents)
    ? contribution.documents[0]
    : null;

  const candidates = [
    documentEntry?.uploadedImages,
    contribution?.uploadedImages,
    contribution?.images,
    contribution?.photos,
  ];
  const list =
    candidates.find((candidate) => Array.isArray(candidate) && candidate.length) ||
    [];

  return list
    .map((item, index) => {
      const src = asString(item?.url || item?.src || item?.path);
      if (!src) return null;

      return {
        id: asString(item?._id || item?.id || item?.s3Key || `${index}`),
        src,
        alt: asString(item?.alt || item?.title, `${fallbackTitle} image ${index + 1}`),
      };
    })
    .filter(Boolean);
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

export default async function StudentEditArticlePage({ params }) {
  noStore();
  const viewer = await requireAuthSession();
  if (viewer.role !== "student") {
    return null;
  }

  const { articleId } = await params;
  const payload = await getStudentContributionContentById(articleId);
  const contribution = unwrapPayload(payload);
  const documentEntry = Array.isArray(contribution?.documents)
    ? contribution.documents[0]
    : null;
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

  const authorId = asString(contribution?.author?.id);
  if (authorId && viewer.id && authorId !== asString(viewer.id)) {
    redirect("/dashboard");
  }

  const title = asString(contribution?.title, `Contribution #${articleId}`);
  const existingImages = normalizeUploadedImages(contribution, title);
  const wordFileLabel = asString(
    documentEntry?.originalFileName ||
      documentEntry?.fileName ||
      documentEntry?.filename ||
      documentEntry?.name,
    "Uploaded Word document",
  );
  const isEditLocked = isDeadlinePassed(deadlines?.closureFinalDate);

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
            Update title, replace the Word file, and manage uploaded photos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/${articleId}`}>Back to detail</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Student dashboard</Link>
          </Button>
        </div>
      </header>

      <SubmissionDeadlinesSection deadlines={deadlines} />

      {isEditLocked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Final edit deadline has passed ({toReadableDeadline(deadlines?.closureFinalDate)}). This article can no longer be updated.
        </div>
      ) : (
        <StudentContributionEditForm
          contributionId={asString(contribution?.contributionId, articleId)}
          initialTitle={title}
          existingImages={existingImages}
          wordFileLabel={wordFileLabel}
        />
      )}
    </div>
  );
}
