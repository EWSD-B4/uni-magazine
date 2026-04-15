"use server";

import { notFound } from "next/navigation";
import { requireAuthSession } from "@/lib/auth";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

const CONTRIBUTION_LIST_SCOPES = new Set(["student", "coordinator"]);

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
