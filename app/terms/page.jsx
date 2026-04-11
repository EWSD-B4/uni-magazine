import Link from "next/link";
import ArticleRichContent from "@/components/ArticleRichContent";
import { getAuthFromCookies } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function formatDateLabel(value) {
  const raw = asString(value);
  if (!raw) return "";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function pickTermRecord(payload) {
  const data = payload?.data ?? payload;
  const candidates = [
    data?.active_term,
    data?.activeTerm,
    data?.term,
    Array.isArray(data?.terms) ? data.terms[0] : null,
    Array.isArray(data?.items) ? data.items[0] : null,
    Array.isArray(data) ? data[0] : null,
    data,
  ];

  return (
    candidates.find(
      (candidate) => candidate && typeof candidate === "object",
    ) || null
  );
}

function normalizeTerm(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  return {
    title: asString(record.title || record.name, "Terms & Conditions"),
    version: asString(record.version || record.term_version || record.code),
    effectiveAt: asString(
      record.effective_date ||
        record.effectiveDate ||
        record.updated_at ||
        record.updatedAt ||
        record.created_at ||
        record.createdAt,
    ),
    content:
      record.content ??
      record.body ??
      record.description ??
      record.terms ??
      record.editor_content ??
      record.editorContent ??
      record.document ??
      "",
  };
}

async function getActiveTerms() {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return {
      term: null,
      error: "Missing BASE_URL environment variable.",
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/terms/active`;
  const { token } = await getAuthFromCookies();

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
            authToken: token,
          }
        : {}),
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    return {
      term: null,
      error: isJson
        ? asString(payload?.message, "Failed to load terms.")
        : asString(payload, "Failed to load terms."),
    };
  }

  if (!isJson) {
    return {
      term: {
        title: "Terms & Conditions",
        version: "",
        effectiveAt: "",
        content: payload,
      },
      error: "",
    };
  }

  const record = pickTermRecord(payload);
  const term = normalizeTerm(record);

  if (!term) {
    return {
      term: null,
      error: "No active terms found.",
    };
  }

  return {
    term,
    error: "",
  };
}

export default async function TermsPage() {
  const { term, error } = await getActiveTerms();
  const effectiveDate = formatDateLabel(term?.effectiveAt);

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Terms & Conditions
            </p>
            <h1 className="font-[var(--font-display)] text-3xl text-slate-900">
              {term?.title || "Active Terms"}
            </h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/login">Return to login</Link>
          </Button>
        </div>

        {term ? (
          <Card className="bg-white/90">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
                {term.version ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Version {term.version}
                  </span>
                ) : null}
                {effectiveDate ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Effective {effectiveDate}
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <ArticleRichContent
                source={{ content: term.content, body: term.content }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg">Latest active terms</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-red-700">
              {error || "No active terms found."}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
