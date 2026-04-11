"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/mockAuth";
import { clearAuthCookies, setAuthCookies } from "@/lib/cookies";
import { requireAuthSession } from "@/lib/auth";

const MAX_IMAGES = 5;

function isFileLike(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.size === "number"
  );
}

function isWordFile(file) {
  const lower = String(file?.name || "").toLowerCase();
  return lower.endsWith(".doc") || lower.endsWith(".docx");
}

function isValidImage(file) {
  const lower = String(file?.name || "").toLowerCase();
  return (
    lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")
  );
}

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const result = await login(email, password);
  await setAuthCookies(result);
  redirect("/dashboard");
}

export async function logoutAction() {
  await logout();
  await clearAuthCookies();
  redirect("/login");
}

export async function getContributionByStudent() {
  const { token } = await requireAuthSession();

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const res = await fetch(
    `${baseUrl.replace(/\/$/, "")}/student/contributions`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`API Failed (${res.status}): ${message}`);
  }

  return res.json();
}

function extractCurrentAcademicYear(payload) {
  const source =
    payload &&
    typeof payload === "object" &&
    payload.data &&
    typeof payload.data === "object"
      ? payload.data
      : payload;

  if (!source || typeof source !== "object") {
    return {
      closureDate: "",
      closureFinalDate: "",
    };
  }

  return {
    closureDate:
      typeof source.closureDate === "string" ? source.closureDate : "",
    closureFinalDate:
      typeof source.closureFinalDate === "string" ? source.closureFinalDate : "",
  };
}

export async function getCurrentAcademicYearDeadlines() {
  const { token } = await requireAuthSession();

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/academic-years/current`;
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(
      isJson
        ? payload?.message || `Failed to load current academic year (${res.status}).`
        : payload || `Failed to load current academic year (${res.status}).`,
    );
  }

  if (!isJson) {
    return {
      closureDate: "",
      closureFinalDate: "",
    };
  }

  return extractCurrentAcademicYear(payload);
}

export async function submitContribution(_prevState, formData) {
  try {
    const { token, role } = await requireAuthSession();

    if (role !== "student") {
      return { ok: false, message: "Only student can submit contributions." };
    }

    const title = String(formData.get("title") || "").trim();
    const wordFile = formData.get("wordFile");
    const photos = formData
      .getAll("photos")
      .filter((file) => isFileLike(file) && file.size > 0);
    const agreed = formData.get("agreed") === "on";

    if (!title) {
      return { ok: false, message: "Title is required." };
    }

    if (!isFileLike(wordFile) || wordFile.size <= 0) {
      return { ok: false, message: "Word document is required." };
    }

    if (!isWordFile(wordFile)) {
      return { ok: false, message: "Word file must be .doc or .docx." };
    }

    if (photos.length > MAX_IMAGES) {
      return {
        ok: false,
        message: `Maximum ${MAX_IMAGES} photos are allowed.`,
      };
    }

    const invalidImage = photos.find((photo) => !isValidImage(photo));
    if (invalidImage) {
      return {
        ok: false,
        message: "Only .jpg, .jpeg, and .png images are allowed.",
      };
    }

    if (!agreed) {
      return { ok: false, message: "Please agree to Terms & Conditions." };
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return { ok: false, message: "Missing BASE_URL environment variable." };
    }

    const endpoint = `${baseUrl.replace(/\/$/, "")}/student/contributions/submit`;
    const payload = new FormData();
    payload.append("title", title);
    payload.append("academicYearId", "2");
    payload.append("docx", wordFile);
    photos.forEach((photo) => payload.append("photos", photo));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      body: payload,
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    let data = null;
    let text = "";

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      text = await res.text();
    }

    if (!res.ok) {
      return {
        ok: false,
        message:
          data?.message || text || `Submit failed with status ${res.status}.`,
      };
    }

    return {
      ok: true,
      message: data?.message || "Contribution submitted successfully.",
    };
  } catch (error) {
    console.log("errorrrrrrrrrrrrrrrrrrrrrrrr", error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit contribution.",
    };
  }
}
