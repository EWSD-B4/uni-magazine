"use server";

import { redirect } from "next/navigation";

import {
  clearAuthCookies,
  getAuthFromCookies,
  setAuthCookies,
} from "@/lib/cookies";

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

function toLoginErrorRedirect(message) {
  const safeMessage =
    typeof message === "string" && message.trim()
      ? message.trim()
      : "Unable to login.";
  return `/login?error=${encodeURIComponent(safeMessage)}`;
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
      role_id:
        user.role_id === null || user.role_id === undefined
          ? ""
          : String(user.role_id),
    },
  };
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
    redirect(toLoginErrorRedirect(payload?.message || "Login failed."));
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
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.role_id,
  });

  redirect("/dashboard");
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
  redirect("/login");
}
