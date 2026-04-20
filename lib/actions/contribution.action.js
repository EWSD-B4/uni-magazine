"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireAuthSession } from "@/lib/auth";
import { formatTimestampToMinute } from "@/lib/helpers/date";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

const CONTRIBUTION_LIST_SCOPES = new Set(["student", "coordinator", "manager"]);
const CONTRIBUTION_DETAIL_SCOPES = new Set(["student", "coordinator"]);

function normalizeScopeValue(scope) {
  return asString(scope).trim().toLowerCase();
}

function getContributionDetailEndpoints(scope, articleId, baseUrl) {
  const encodedId = encodeURIComponent(String(articleId));
  const root = baseUrl.replace(/\/$/, "");

  if (scope === "student") {
    return [
      `${root}/student/contributions/${encodedId}/content`,
      `${root}/student/contributions/${encodedId}`,
    ];
  }

  if (scope === "coordinator") {
    return [
      `${root}/coordinator/contributions/${encodedId}/content`,
      `${root}/coordinator/contributions/${encodedId}`,
    ];
  }

  return [`${root}/documents/content/contribution/${encodedId}`];
}

async function fetchContributionFromEndpoint(endpoint, token) {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  return {
    response,
    isJson,
    payload,
  };
}

export async function getContributionListing(scope) {
  const normalizedScope = asString(scope).trim().toLowerCase();
  if (!CONTRIBUTION_LIST_SCOPES.has(normalizedScope)) {
    throw new Error(`Unsupported contribution scope: ${scope}`);
  }

  const { token } = await requireAuthSession();

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/${normalizedScope}/contributions`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to load ${normalizedScope} contributions (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  return payload;
}

export async function getManagerSelectedContributionListing() {
  const { token, role } = await requireAuthSession();
  if (role !== "manager") {
    throw new Error("Only manager can load selected contributions.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/manager/contributions/selected`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to load manager selected contributions (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  return payload;
}

function resolveFacultyId(value) {
  const raw = asString(value).trim();
  if (!raw) return "";
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return String(parsed);
}

export async function getGuestSelectedContributionListing(facultyIdInput) {
  const { token, role, facultyId } = await requireAuthSession();
  if (role !== "guest") {
    throw new Error("Only guest can load guest selected contributions.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const resolvedFacultyId =
    resolveFacultyId(facultyIdInput) || resolveFacultyId(facultyId) || "1";

  const endpoint = `${baseUrl.replace(/\/$/, "")}/guest/faculties/${encodeURIComponent(
    resolvedFacultyId,
  )}/contributions/selected`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to load guest selected contributions (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  return payload;
}

function isContributionLike(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value.id || value.contributionId || value.articleId || value.title),
  );
}

function extractContributionItems(payload) {
  const source = payload?.data ?? payload;
  if (!source) return [];

  const directCandidates = [
    source?.contributions,
    source?.items,
    source?.rows,
    source?.list,
    source?.results,
    source?.overdue,
    source?.withoutComments,
    source?.without_comments,
    source?.data,
  ];

  const directList = directCandidates.find((entry) => Array.isArray(entry));
  if (directList) {
    return directList.filter((item) => item && typeof item === "object");
  }

  if (isContributionLike(source)) {
    return [source];
  }

  const visited = new Set();
  const queue = [source];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) {
      const records = current.filter((item) => item && typeof item === "object");
      if (records.some((item) => isContributionLike(item))) {
        return records;
      }
      records.forEach((item) => queue.push(item));
      continue;
    }

    Object.values(current).forEach((value) => {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    });
  }

  return [];
}

function normalizeUrgentContribution(item, tag) {
  const id = asString(item?.id ?? item?.contributionId ?? item?.articleId);
  if (!id) return null;

  const title =
    asString(item?.title ?? item?.name ?? item?.articleTitle) || `Contribution #${id}`;

  return {
    id,
    title,
    tags: [tag],
  };
}

async function fetchCoordinatorUrgentItems(endpoint, token, tag) {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const details = isJson ? JSON.stringify(payload) : payload;
    throw new Error(`Failed to load ${tag} contributions (${response.status}): ${details}`);
  }

  return extractContributionItems(payload)
    .map((item) => normalizeUrgentContribution(item, tag))
    .filter(Boolean);
}

export async function getCoordinatorUrgentContributions() {
  const { token, role } = await requireAuthSession();
  if (role !== "coordinator") {
    throw new Error("Only coordinator can load urgent contributions.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const root = baseUrl.replace(/\/$/, "");
  const requests = [
    {
      key: "overdue",
      label: "Overdue",
      endpoint: `${root}/coordinator/contributions/overdue`,
    },
    {
      key: "withoutComments",
      label: "No Comment",
      endpoint: `${root}/coordinator/contributions/without-comments`,
    },
  ];

  const results = await Promise.allSettled(
    requests.map((request) =>
      fetchCoordinatorUrgentItems(request.endpoint, token, request.label),
    ),
  );

  const mergedById = new Map();
  const errors = [];
  const counts = {
    overdue: 0,
    withoutComments: 0,
  };

  results.forEach((result, index) => {
    const request = requests[index];
    if (result.status === "rejected") {
      errors.push(
        result.reason instanceof Error
          ? result.reason.message
          : `Failed to load ${request.key} contributions.`,
      );
      return;
    }

    if (request.key === "overdue") {
      counts.overdue = result.value.length;
    }
    if (request.key === "withoutComments") {
      counts.withoutComments = result.value.length;
    }

    result.value.forEach((item) => {
      const existing = mergedById.get(item.id);
      if (!existing) {
        mergedById.set(item.id, item);
        return;
      }

      const tags = Array.isArray(existing.tags) ? [...existing.tags] : [];
      item.tags.forEach((tag) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
      mergedById.set(item.id, {
        ...existing,
        tags,
      });
    });
  });

  const tasks = Array.from(mergedById.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return {
    tasks,
    counts,
    errors,
  };
}

export async function getContributionById(articleId, token) {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/documents/content/contribution/${articleId}`;
  const { response, isJson, payload } = await fetchContributionFromEndpoint(
    endpoint,
    token,
  );

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load contribution ${articleId} (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return { content: payload };
  }

  return payload;
}

export async function queryContributionById(articleId, scope) {
  const { token, role } = await requireAuthSession();
  const normalizedScope = normalizeScopeValue(scope) || normalizeScopeValue(role);

  if (!CONTRIBUTION_DETAIL_SCOPES.has(normalizedScope)) {
    throw new Error(`Unsupported contribution scope: ${scope || role}`);
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoints = getContributionDetailEndpoints(
    normalizedScope,
    articleId,
    baseUrl,
  );

  let lastFailure = null;
  let sawNotFound = false;

  for (const endpoint of endpoints) {
    const { response, isJson, payload } = await fetchContributionFromEndpoint(
      endpoint,
      token,
    );

    if (response.ok) {
      if (!isJson) {
        return { content: payload };
      }
      return payload;
    }

    if (response.status === 404) {
      sawNotFound = true;
      continue;
    }

    lastFailure = `Failed to load contribution ${articleId} (${response.status}): ${
      isJson ? JSON.stringify(payload) : payload
    }`;
  }

  if (sawNotFound && !lastFailure) {
    notFound();
  }

  throw new Error(
    lastFailure ||
      `Failed to load contribution ${articleId} for ${normalizedScope}.`,
  );
}

export async function getStudentContributionContentById(articleId) {
  const { token, role } = await requireAuthSession();

  if (role !== "student") {
    throw new Error("Only student can load student contribution content.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/student/contributions/${articleId}/content`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to load student contribution ${articleId} (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return { content: payload };
  }

  return payload;
}

export async function getStudentContributionById(articleId) {
  const { token, role } = await requireAuthSession();

  if (role !== "student") {
    throw new Error("Only student can load student contribution.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/student/contributions/${articleId}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to load student contribution ${articleId} (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return { data: payload };
  }

  return payload;
}

export async function getCommentsByContributionId(contributionId) {
  const { token } = await requireAuthSession();

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/comments/?contributionId=${encodeURIComponent(
    String(contributionId),
  )}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to load comments for contribution ${contributionId} (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return [];
  }

  return payload;
}

function extractCommentData(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.data && typeof payload.data === "object") return payload.data;
  if (payload.comment && typeof payload.comment === "object") return payload.comment;
  return payload;
}

function normalizeCommentFromPayload(payload, fallback) {
  const comment = extractCommentData(payload);
  const fallbackAuthor =
    fallback && typeof fallback === "object" ? fallback.author : "Coordinator";
  const fallbackBody =
    fallback && typeof fallback === "object" ? fallback.body : "";

  return {
    id: asString(comment?.id || comment?._id || comment?.commentId),
    body: asString(
      comment?.content || comment?.comment || comment?.message || comment?.text,
      fallbackBody,
    ),
    author: asString(
      comment?.author?.name ||
        comment?.user?.name ||
        comment?.createdBy?.name ||
        comment?.coordinator?.name ||
        comment?.author ||
        comment?.name,
      fallbackAuthor,
    ),
    date: asString(
      comment?.createdAt || comment?.updatedAt || comment?.timestamp || comment?.date,
      formatTimestampToMinute(new Date(), ""),
    ),
  };
}

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();
  return { isJson, payload };
}

async function sendCoordinatorDecisionRequest({
  baseUrl,
  token,
  contributionId,
  decision,
}) {
  const root = baseUrl.replace(/\/$/, "");
  const encodedId = encodeURIComponent(String(contributionId));

  if (decision === "selected") {
    const response = await fetch(
      `${root}/coordinator/contributions/${encodedId}/select`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          authToken: token,
        },
        cache: "no-store",
      },
    );
    const parsed = await parseApiResponse(response);
    return { response, ...parsed };
  }

  if (decision === "rejected") {
    const response = await fetch(
      `${root}/coordinator/contributions/${encodedId}/reject`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          authToken: token,
        },
        cache: "no-store",
      },
    );
    const parsed = await parseApiResponse(response);
    return { response, ...parsed };
  }

  const statusAttempts = [
    { status: "UNDER_REVIEW" },
    { status: "under_review" },
    { status: "Under Review" },
    { status: "PENDING" },
    { status: "pending" },
  ];

  let lastAttempt = null;
  for (const body of statusAttempts) {
    const response = await fetch(
      `${root}/coordinator/contributions/${encodedId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          authToken: token,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const parsed = await parseApiResponse(response);
    lastAttempt = { response, ...parsed };

    if (response.ok) {
      return lastAttempt;
    }

    if (response.status !== 400 && response.status !== 422) {
      return lastAttempt;
    }
  }

  return lastAttempt;
}

export async function createCommentAction(_prevState, formData) {
  try {
    const { token, role, name } = await requireAuthSession();
    if (role !== "coordinator") {
      return { ok: false, message: "Only coordinator can create comments." };
    }

    const contributionIdRaw = String(formData.get("contributionId") || "").trim();
    const content = String(formData.get("content") || "").trim();
    if (!contributionIdRaw) {
      return { ok: false, message: "Missing contribution id." };
    }
    if (!content) {
      return { ok: false, message: "Comment is required." };
    }

    const contributionIdNumber = Number(contributionIdRaw);
    const contributionId = Number.isFinite(contributionIdNumber)
      ? contributionIdNumber
      : contributionIdRaw;

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return { ok: false, message: "Missing BASE_URL environment variable." };
    }

    const endpoint = `${baseUrl.replace(/\/$/, "")}/comments`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      body: JSON.stringify({
        contributionId,
        content,
      }),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return {
        ok: false,
        message:
          (isJson && payload?.message) ||
          (!isJson && payload) ||
          `Create comment failed (${response.status}).`,
      };
    }

    return {
      ok: true,
      message: (isJson && payload?.message) || "Comment created.",
      comment: normalizeCommentFromPayload(payload, {
        body: content,
        author: name || "Coordinator",
      }),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to create comment.",
    };
  }
}

export async function updateCommentAction(_prevState, formData) {
  try {
    const { token, role, name } = await requireAuthSession();
    if (role !== "coordinator") {
      return { ok: false, message: "Only coordinator can update comments." };
    }

    const commentId = String(formData.get("commentId") || "").trim();
    const content = String(formData.get("content") || "").trim();
    if (!commentId) {
      return { ok: false, message: "Missing comment id." };
    }
    if (!content) {
      return { ok: false, message: "Comment is required." };
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return { ok: false, message: "Missing BASE_URL environment variable." };
    }

    const endpoint = `${baseUrl.replace(/\/$/, "")}/comments/${encodeURIComponent(
      commentId,
    )}`;
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      body: JSON.stringify({
        content,
      }),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return {
        ok: false,
        message:
          (isJson && payload?.message) ||
          (!isJson && payload) ||
          `Update comment failed (${response.status}).`,
      };
    }

    const normalized = normalizeCommentFromPayload(payload, {
      body: content,
      author: name || "Coordinator",
    });

    return {
      ok: true,
      message: (isJson && payload?.message) || "Comment updated.",
      comment: {
        ...normalized,
        id: normalized.id || commentId,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to update comment.",
    };
  }
}

export async function deleteCommentAction(_prevState, formData) {
  try {
    const { token, role } = await requireAuthSession();
    if (role !== "coordinator") {
      return { ok: false, message: "Only coordinator can delete comments." };
    }

    const commentId = String(formData.get("commentId") || "").trim();
    if (!commentId) {
      return { ok: false, message: "Missing comment id." };
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return { ok: false, message: "Missing BASE_URL environment variable." };
    }

    const endpoint = `${baseUrl.replace(/\/$/, "")}/comments/${encodeURIComponent(
      commentId,
    )}`;
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return {
        ok: false,
        message:
          (isJson && payload?.message) ||
          (!isJson && payload) ||
          `Delete comment failed (${response.status}).`,
      };
    }

    return {
      ok: true,
      message: (isJson && payload?.message) || "Comment deleted.",
      deletedId: commentId,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to delete comment.",
    };
  }
}

export async function updateCoordinatorContributionDecisionAction(
  _prevState,
  formData,
) {
  try {
    const { token, role } = await requireAuthSession();
    if (role !== "coordinator") {
      return { ok: false, message: "Only coordinator can review contributions." };
    }

    const contributionId = String(formData.get("contributionId") || "").trim();
    const decision = String(formData.get("decision") || "")
      .trim()
      .toLowerCase();
    const returnPath = String(formData.get("returnPath") || "").trim();

    if (!contributionId) {
      return { ok: false, message: "Missing contribution id." };
    }

    if (!["under_review", "selected", "rejected"].includes(decision)) {
      return { ok: false, message: "Invalid review decision." };
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return { ok: false, message: "Missing BASE_URL environment variable." };
    }

    const { response, isJson, payload } = await sendCoordinatorDecisionRequest({
      baseUrl,
      token,
      contributionId,
      decision,
    });

    if (!response?.ok) {
      return {
        ok: false,
        message:
          (isJson && payload?.message) ||
          (!isJson && payload) ||
          `Failed to update contribution decision (${response?.status || "unknown"}).`,
      };
    }

    if (returnPath.startsWith("/")) {
      revalidatePath(returnPath);
    }
    revalidatePath(`/dashboard/${contributionId}`);
    revalidatePath("/dashboard");
    revalidatePath("/articles");

    const defaultSuccessMessage =
      decision === "selected"
        ? "Contribution marked as selected."
        : decision === "rejected"
          ? "Contribution marked as rejected."
          : "Contribution marked as under review.";

    return {
      ok: true,
      message: (isJson && payload?.message) || defaultSuccessMessage,
      decision,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update contribution decision.",
    };
  }
}
