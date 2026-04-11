"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/mockAuth";
import { clearAuthCookies, setAuthCookies } from "@/lib/cookies";
import { requireAuthSession } from "@/lib/auth";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function toTitleCase(value) {
  return asString(value)
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function toDisplayDate(value) {
  const raw = asString(value);
  if (!raw) return "-";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function toDisplayStatus(value) {
  const status = asString(value, "Active");
  if (!status) return "Active";
  if (status.toLowerCase() === "inactive") return "Inactive";
  return toTitleCase(status);
}

function toDisplayRole(value) {
  const normalized = asString(value).trim().toLowerCase();

  const roleMap = {
    student: "Student",
    coordinator: "Marketing Coordinator",
    manager: "Marketing Manager",
    admin: "Admin",
    guest: "Guest",
    "marketing coordinator": "Marketing Coordinator",
    "marketing manager": "Marketing Manager",
  };

  if (roleMap[normalized]) {
    return roleMap[normalized];
  }

  return toTitleCase(value || "Unknown");
}

function extractUsers(payload) {
  const sources = [payload?.data?.users, payload?.data, payload?.users, payload];
  const rawUsers = sources.find((source) => Array.isArray(source)) || [];

  return rawUsers.map((user, index) => ({
    id: asString(user?.id ?? user?.userId ?? index + 1, String(index + 1)),
    name: asString(user?.name ?? user?.full_name ?? user?.username, "Unknown"),
    email: asString(user?.email, "-"),
    role: toDisplayRole(user?.role ?? user?.role_name ?? "Unknown"),
    roleId: asString(user?.role_id ?? user?.roleId),
    faculty: asString(user?.faculty, "N/A"),
    date: toDisplayDate(
      user?.created_at ?? user?.createdAt ?? user?.submittedAt ?? user?.date,
    ),
    status: toDisplayStatus(user?.status ?? user?.account_status),
  }));
}

function extractFaculties(payload) {
  const sourceCandidates = [
    payload?.data?.faculties,
    payload?.data,
    payload?.faculties,
    payload,
  ];
  const rawFaculties =
    sourceCandidates.find((source) => Array.isArray(source)) || [];

  const normalized = rawFaculties
    .map((faculty) => {
      if (typeof faculty === "string") {
        return {
          id: "",
          name: faculty.trim(),
        };
      }

      if (faculty && typeof faculty === "object") {
        const id = asString(faculty.id ?? faculty.faculty_id ?? faculty.facultyId);
        const name = asString(
          faculty.name ??
            faculty.faculty_name ??
            faculty.faculty ??
            faculty.title,
        ).trim();

        if (!name) return null;
        return { id, name };
      }

      return null;
    })
    .filter(Boolean);

  const deduped = normalized.filter((item, index, array) => {
    return (
      array.findIndex(
        (candidate) =>
          candidate.id === item.id &&
          candidate.name.toLowerCase() === item.name.toLowerCase(),
      ) === index
    );
  });

  return deduped.sort((a, b) => a.name.localeCompare(b.name));
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

export async function getUsers() {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    throw new Error("Only admin can load users.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/users`;
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
      `Failed to load users (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return [];
  }

  return extractUsers(payload);
}

export async function getFaculties() {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    throw new Error("Only admin can load faculties.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/faculties`;
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
      `Failed to load faculties (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return [];
  }

  return extractFaculties(payload);
}

function asNumber(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return null;
  return normalized;
}

export async function createUserAction(_previousState, formData) {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    return {
      ok: false,
      message: "Only admin can create users.",
    };
  }

  const email = asString(formData.get("email")).trim();
  const name = asString(formData.get("name")).trim();
  const password = asString(formData.get("password"));
  const roleId = asNumber(formData.get("role_id"));
  const facultyId = asNumber(formData.get("faculty_id"));

  if (!email || !name || !password || roleId === null || facultyId === null) {
    return {
      ok: false,
      message:
        "Required fields: email, name, password, role_id and faculty_id.",
    };
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      message: "Missing BASE_URL environment variable.",
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/users/create`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    body: JSON.stringify({
      email,
      name,
      password,
      role_id: roleId,
      faculty_id: facultyId,
    }),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    return {
      ok: false,
      message: isJson
        ? asString(payload?.message, "Failed to create user.")
        : asString(payload, "Failed to create user."),
    };
  }

  if (isJson && payload?.success === false) {
    return {
      ok: false,
      message: asString(payload?.message, "Failed to create user."),
    };
  }

  return {
    ok: true,
    message: isJson
      ? asString(payload?.message, "Account Have Been Created!")
      : "Account Have Been Created!",
  };
}
