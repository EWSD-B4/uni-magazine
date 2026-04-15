"use server";

import { notFound } from "next/navigation";
import { requireAuthSession } from "@/lib/auth";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

const CONTRIBUTION_LIST_SCOPES = new Set(["student", "coordinator"]);
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
      new Date().toISOString(),
    ),
  };
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
