"use server";

import { redirect } from "next/navigation";

import {
  clearAuthCookies,
  getAuthFromCookies,
  setAuthCookies,
} from "@/lib/cookies";
import { requireAuthSession } from "@/lib/auth";

function getLoginUrl() {
  const explicitLoginUrl =
    process.env.AUTH_LOGIN_URL || process.env.NEXT_PUBLIC_AUTH_LOGIN_URL;

  if (explicitLoginUrl) {
    return explicitLoginUrl;
  }

  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing auth endpoint. Set AUTH_LOGIN_URL or BASE_URL.");
  }

  return `${baseUrl.replace(/\/$/, "")}/auth/login`;
}

function getLogoutUrl() {
  return (
    process.env.AUTH_LOGOUT_URL ||
    process.env.NEXT_PUBLIC_AUTH_LOGOUT_URL ||
    null
  );
}

function getApiBaseUrl() {
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  return baseUrl.replace(/\/$/, "");
}

function toLoginErrorRedirect(message) {
  const safeMessage =
    typeof message === "string" && message.trim()
      ? message.trim()
      : "Unable to login.";
  return `/login?error=${encodeURIComponent(safeMessage)}`;
}

function normalizeLoginErrorMessage(message, statusCode) {
  const raw = typeof message === "string" ? message.trim() : "";
  const firstLine = raw.split("\n")[0]?.trim() || "";
  const lowered = firstLine.toLowerCase();

  if (lowered.includes("invalid email or password")) {
    return "Invalid email or password";
  }

  if (statusCode === 401) {
    return "Invalid email or password";
  }

  if (!firstLine) {
    return statusCode && statusCode >= 500
      ? "Auth server error. Please try again."
      : "Login failed.";
  }

  return firstLine;
}

function parseLoginResponse(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid server response.");
  }

  if (payload.success !== true) {
    throw new Error(payload.message || "Login failed.");
  }

  if (!payload.data || typeof payload.data !== "object") {
    throw new Error("Missing response data.");
  }

  const user = payload.data.user;
  const token = payload.data.token;

  if (!user || typeof user !== "object") {
    throw new Error("Missing user object.");
  }

  if (typeof token !== "string" || !token) {
    throw new Error("Missing token.");
  }

  if (
    typeof user.id !== "string" &&
    typeof user.id !== "number" &&
    user.id !== null
  ) {
    throw new Error("Invalid user.id.");
  }

  if (typeof user.role !== "string" || !user.role.trim()) {
    throw new Error("Invalid user.role.");
  }

  return {
    token,
    user: {
      id: user.id == null ? "" : String(user.id),
      email: typeof user.email === "string" ? user.email : "",
      name: typeof user.name === "string" ? user.name : "",
      role: user.role,
      faculty: typeof user.faculty === "string" ? user.faculty : "N/A",
      faculty_id:
        user.faculty_id === null || user.faculty_id === undefined
          ? user.facultyId === null || user.facultyId === undefined
            ? user.faculty && typeof user.faculty === "object"
              ? user.faculty.id == null
                ? ""
                : String(user.faculty.id)
              : ""
            : String(user.facultyId)
          : String(user.faculty_id),
      role_id:
        user.role_id === null || user.role_id === undefined
          ? ""
          : String(user.role_id),
    },
  };
}

function toServerActionErrorMessage(response, payload, isJson, fallback) {
  if (isJson) {
    return (
      String(payload?.message || "").trim() ||
      String(fallback || "").trim() ||
      `Request failed with status ${response.status}.`
    );
  }

  const message = String(payload || "").trim();
  if (message) return message;
  const fallbackMessage = String(fallback || "").trim();
  if (fallbackMessage) return fallbackMessage;
  return `Request failed with status ${response.status}.`;
}

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect(toLoginErrorRedirect("Email and password are required."));
  }
  const url = getLoginUrl();
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    redirect(toLoginErrorRedirect("Cannot reach auth server."));
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    redirect(toLoginErrorRedirect("Invalid server response."));
  }

  if (!response.ok || payload?.success !== true) {
    redirect(
      toLoginErrorRedirect(
        normalizeLoginErrorMessage(payload?.message, response.status),
      ),
    );
  }

  let parsed;
  try {
    parsed = parseLoginResponse(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid server response.";
    redirect(toLoginErrorRedirect(message));
  }
  const { user, token } = parsed;

  await setAuthCookies({
    token,
    role: user.role.trim().toLowerCase(),
    faculty: user.faculty,
    facultyId: user.faculty_id,
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.role_id,
  });

  const normalizedRole = user.role.trim().toLowerCase();
  redirect(normalizedRole === "guest" ? "/articles" : "/dashboard");
}

export async function forgetPasswordAction(_previousState, formData) {
  try {
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      return {
        ok: false,
        message: "Email is required.",
      };
    }

    const endpoint = `${getApiBaseUrl()}/auth/password/forget`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok || (isJson && payload?.success === false)) {
      return {
        ok: false,
        message: toServerActionErrorMessage(
          response,
          payload,
          isJson,
          "Failed to send password reset request.",
        ),
      };
    }

    return {
      ok: true,
      message: isJson
        ? String(payload?.message || "").trim() ||
          "If the email exists, reset instructions have been sent."
        : "If the email exists, reset instructions have been sent.",
    };
  } catch {
    return {
      ok: false,
      message: "Unable to send password reset request right now.",
    };
  }
}

export async function changePasswordAction(_previousState, formData) {
  try {
    const { token } = await requireAuthSession();

    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        ok: false,
        message: "Please fill in all password fields.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        ok: false,
        message: "Passwords do not match.",
      };
    }

    const endpoint = `${getApiBaseUrl()}/auth/password`;
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        authToken: token,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok || (isJson && payload?.success === false)) {
      return {
        ok: false,
        message: toServerActionErrorMessage(
          response,
          payload,
          isJson,
          "Failed to change password.",
        ),
      };
    }

    return {
      ok: true,
      message: isJson
        ? String(payload?.message || "").trim() || "Password changed successfully."
        : "Password changed successfully.",
    };
  } catch {
    return {
      ok: false,
      message: "Unable to change password right now.",
    };
  }
}

export async function logoutAction() {
  const logoutUrl = getLogoutUrl();

  if (logoutUrl) {
    const session = await getAuthFromCookies();
    try {
      await fetch(logoutUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(session.token
            ? { Authorization: `Bearer ${session.token}` }
            : {}),
        },
        cache: "no-store",
      });
    } catch {
      // Clear local auth state even if backend logout endpoint is unreachable.
    }
  }

  await clearAuthCookies();
  redirect("/");
}
