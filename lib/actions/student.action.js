"use server";

import {
  loginAction as authLoginAction,
  logoutAction as authLogoutAction,
} from "@/lib/actions/auth";
import { requireAuthSession } from "@/lib/auth";
import { isDeadlinePassed } from "@/lib/helpers/deadline";

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
  return lower.endsWith(".docx");
}

function isValidImage(file) {
  const lower = String(file?.name || "").toLowerCase();
  return (
    lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")
  );
}

export async function loginAction(formData) {
  return authLoginAction(formData);
}

export async function logoutAction() {
  return authLogoutAction();
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
  return fetchCurrentAcademicYearDeadlines(token);
}

async function fetchCurrentAcademicYearDeadlines(token) {
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

    let deadlines = {
      closureDate: "",
      closureFinalDate: "",
    };
    try {
      deadlines = await fetchCurrentAcademicYearDeadlines(token);
    } catch {
      return {
        ok: false,
        message: "Unable to verify submission deadline. Please try again.",
      };
    }

    if (isDeadlinePassed(deadlines.closureDate)) {
      return {
        ok: false,
        message: "New submissions deadline has passed. You can no longer submit.",
      };
    }

    const title = String(formData.get("title") || "").trim();
    const wordFile = formData.get("wordFile");
    const images = formData
      .getAll("images")
      .filter((file) => isFileLike(file) && file.size > 0);
    const agreed = formData.get("agreed") === "on";

    if (!title) {
      return { ok: false, message: "Title is required." };
    }

    if (!isFileLike(wordFile) || wordFile.size <= 0) {
      return { ok: false, message: "Word document is required." };
    }

    if (!isWordFile(wordFile)) {
      return { ok: false, message: "Word file must be .docx." };
    }

    if (images.length > MAX_IMAGES) {
      return {
        ok: false,
        message: `Maximum ${MAX_IMAGES} photos are allowed.`,
      };
    }

    const invalidImage = images.find((photo) => !isValidImage(photo));
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
    payload.append("docx", wordFile);
    images.forEach((image) => payload.append("images", image));

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
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit contribution.",
    };
  }
}

function parseRemovedImageIds(raw) {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item || "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function buildEditPayload({ title, wordFile, images, removedImageIds }) {
  const payload = new FormData();
  payload.append("title", title);

  if (isFileLike(wordFile) && wordFile.size > 0) {
    payload.append("docx", wordFile);
  }

  images.forEach((image) => payload.append("images", image));

  if (removedImageIds.length) {
    payload.append("removedImageIds", JSON.stringify(removedImageIds));
    removedImageIds.forEach((id) => payload.append("removedImageIds[]", id));
  }

  return payload;
}

function toApiErrorMessage(parsedResponse) {
  if (!parsedResponse) return "";
  if (parsedResponse.isJson) {
    return String(parsedResponse.payload?.message || "").trim();
  }
  return String(parsedResponse.payload || "").trim();
}

export async function updateContribution(_prevState, formData) {
  try {
    const { token, role } = await requireAuthSession();

    if (role !== "student") {
      return { ok: false, message: "Only student can update contributions." };
    }

    let deadlines = {
      closureDate: "",
      closureFinalDate: "",
    };
    try {
      deadlines = await fetchCurrentAcademicYearDeadlines(token);
    } catch {
      return {
        ok: false,
        message: "Unable to verify edit deadline. Please try again.",
      };
    }

    if (isDeadlinePassed(deadlines.closureFinalDate)) {
      return {
        ok: false,
        message: "Final edit deadline has passed. You can no longer update this article.",
      };
    }

    const contributionId = String(formData.get("contributionId") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const wordFile = formData.get("docx");
    const images = formData
      .getAll("images")
      .filter((file) => isFileLike(file) && file.size > 0);
    const removedImageIds = parseRemovedImageIds(
      String(formData.get("removedImageIds") || "[]"),
    );

    if (!contributionId) {
      return { ok: false, message: "Missing contribution id." };
    }

    if (!title) {
      return { ok: false, message: "Title is required." };
    }

    if (isFileLike(wordFile) && wordFile.size > 0 && !isWordFile(wordFile)) {
      return { ok: false, message: "Word file must be .docx." };
    }

    if (images.length > MAX_IMAGES) {
      return {
        ok: false,
        message: `Maximum ${MAX_IMAGES} photos are allowed.`,
      };
    }

    const invalidImage = images.find((photo) => !isValidImage(photo));
    if (invalidImage) {
      return {
        ok: false,
        message: "Only .jpg, .jpeg, and .png images are allowed.",
      };
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return { ok: false, message: "Missing BASE_URL environment variable." };
    }

    const root = baseUrl.replace(/\/$/, "");
    const encodedContributionId = encodeURIComponent(contributionId);
    const endpoint = `${root}/student/contributions/${encodedContributionId}`;

    const doMultipartRequest = async (method) => {
      const payload = buildEditPayload({
        title,
        wordFile,
        images,
        removedImageIds,
      });
      return fetch(endpoint, {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          authToken: token,
        },
        body: payload,
        cache: "no-store",
      });
    };

    const parseResponse = async (res) => {
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await res.json() : await res.text();
      return { response: res, isJson, payload };
    };

    const methodAttempts = ["PUT", "PATCH"];

    let finalResponse = null;
    for (let index = 0; index < methodAttempts.length; index += 1) {
      const method = methodAttempts[index];
      const rawResponse = await doMultipartRequest(method);
      const parsed = await parseResponse(rawResponse);
      finalResponse = parsed;

      if (parsed.response.ok) {
        return {
          ok: true,
          message:
            (parsed.isJson && parsed.payload?.message) ||
            "Contribution updated successfully.",
        };
      }

      const status = parsed.response.status;
      const isRetryableStatus = [404, 405].includes(status);
      const hasNextAttempt = index < methodAttempts.length - 1;
      if (!hasNextAttempt || !isRetryableStatus) {
        break;
      }
    }

    if (!finalResponse || !finalResponse.response.ok) {
      return {
        ok: false,
        message: toApiErrorMessage(finalResponse) ||
          `Update failed with status ${finalResponse?.response?.status || "unknown"}.`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update contribution.",
    };
  }
}
