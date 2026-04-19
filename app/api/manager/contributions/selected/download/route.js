import { NextResponse } from "next/server";

import { getAuthFromCookies } from "@/lib/cookies";

export async function GET() {
  const { token, role } = await getAuthFromCookies();

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required. Please log in again.",
      },
      { status: 401 },
    );
  }

  if (String(role || "").toLowerCase() !== "manager") {
    return NextResponse.json(
      {
        success: false,
        message: "Only manager can download selected contributions.",
      },
      { status: 403 },
    );
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing BASE_URL environment variable.",
      },
      { status: 500 },
    );
  }

  const endpoint = `${baseUrl.replace(
    /\/$/,
    "",
  )}/manager/contributions/selected/download`;

  let response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reach download service.",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    return NextResponse.json(
      {
        success: false,
        message: isJson
          ? payload?.message || "Failed to download selected contributions."
          : payload || "Failed to download selected contributions.",
      },
      { status: response.status },
    );
  }

  const body = await response.arrayBuffer();
  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const contentDisposition =
    response.headers.get("content-disposition") ||
    'attachment; filename="selected-contributions"';

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
      "Cache-Control": "no-store",
    },
  });
}
