"use server";

import { notFound } from "next/navigation";

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
