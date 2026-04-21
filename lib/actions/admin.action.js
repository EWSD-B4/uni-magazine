"use server";

import { revalidatePath } from "next/cache";
import {
  loginAction as authLoginAction,
  logoutAction as authLogoutAction,
} from "@/lib/actions/auth";
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
  const source = payload?.data ?? payload;
  const sourceCandidates = [
    source?.faculties,
    source?.items,
    source?.rows,
    source?.list,
    payload?.faculties,
    payload?.items,
    payload?.rows,
    payload?.list,
    source,
    payload,
  ];
  const rawFaculties = sourceCandidates.find((entry) => Array.isArray(entry)) || [];

  const normalized = rawFaculties
    .map((faculty) => {
      if (typeof faculty === "string") {
        return {
          id: "",
          code: "",
          name: faculty.trim(),
        };
      }

      if (faculty && typeof faculty === "object") {
        const id = asString(
          faculty.id ??
            faculty.faculty_id ??
            faculty.facultyId ??
            faculty.code ??
            faculty.facultyCode,
        );
        const code = asString(
          faculty.code ?? faculty.faculty_code ?? faculty.facultyCode,
        );
        const name = asString(
          faculty.name ??
            faculty.facultyName ??
            faculty.faculty_name ??
            faculty.faculty ??
            faculty.title,
        ).trim();

        if (!name) return null;
        return { id, code, name };
      }

      return null;
    })
    .filter(Boolean);

  const deduped = normalized.filter((item, index, array) => {
    const currentId = asString(item.id || item.code);
    const currentName = asString(item.name).toLowerCase();
    return (
      array.findIndex(
        (candidate) =>
          asString(candidate.id || candidate.code) === currentId &&
          asString(candidate.name).toLowerCase() === currentName,
      ) === index
    );
  });

  return deduped.sort((a, b) => a.name.localeCompare(b.name));
}

function extractMostViewedPages(payload) {
  const source = payload?.data ?? payload;
  const listCandidates = [
    source?.pages,
    source?.items,
    source?.list,
    source?.rows,
    source,
  ];
  const rows = listCandidates.find((candidate) => Array.isArray(candidate)) || [];

  return rows.map((item, index) => ({
    id: asString(item?.id ?? item?.pageId ?? index + 1, String(index + 1)),
    page: asString(
      item?.page ??
        item?.name ??
        item?.title ??
        item?.path ??
        item?.route,
      `Page ${index + 1}`,
    ),
    views: Number(
      item?.views ??
        item?.viewCount ??
        item?.count ??
        item?.totalViews ??
        item?.total,
    ) || 0,
  }));
}

const BROWSER_USAGE_COLORS = ["#FBBF24", "#EF4444", "#22C55E", "#3B82F6", "#A855F7"];
const FACULTY_DISTRIBUTION_COLORS = [
  "#F26454CC",
  "#22C55ECC",
  "#FBBF24CC",
  "#3B82F6CC",
  "#A855F7CC",
  "#14B8A6CC",
];

function extractBrowserUsage(payload) {
  const source = payload?.data ?? payload;
  const listCandidates = [
    source?.browsers,
    source?.browserUsage,
    source?.items,
    source?.list,
    source?.rows,
    source,
  ];
  const rows = listCandidates.find((candidate) => Array.isArray(candidate)) || [];

  return rows.map((item, index) => ({
    name: asString(item?.name ?? item?.browser ?? item?.label, `Browser ${index + 1}`),
    value:
      Number(
        item?.value ??
          item?.percentage ??
          item?.usage ??
          item?.count ??
          item?.total,
      ) || 0,
    color: asString(item?.color, BROWSER_USAGE_COLORS[index % BROWSER_USAGE_COLORS.length]),
  }));
}

function extractFacultyDistribution(payload) {
  const source = payload?.data ?? payload;
  const listCandidates = [
    source?.faculties,
    source?.facultyDistribution,
    source?.distribution,
    source?.items,
    source?.list,
    source?.rows,
    source?.data,
    source,
  ];

  const list = listCandidates.find((candidate) => Array.isArray(candidate));
  if (Array.isArray(list)) {
    return list
      .map((item, index) => ({
        name: asString(
          item?.facultyName ??
            item?.faculty_name ??
            item?.faculty ??
            item?.name ??
            item?.label ??
            item?.code,
          `Faculty ${index + 1}`,
        ),
        contributions:
          Number(
            item?.contributions ??
              item?.count ??
              item?.total ??
              item?.value ??
              item?.submissions ??
              item?.articleCount,
          ) || 0,
        color: asString(
          item?.color,
          FACULTY_DISTRIBUTION_COLORS[index % FACULTY_DISTRIBUTION_COLORS.length],
        ),
      }))
      .filter((item) => item.name)
      .sort((a, b) => b.contributions - a.contributions);
  }

  if (source && typeof source === "object") {
    return Object.entries(source)
      .filter(([, value]) => Number.isFinite(Number(value)))
      .map(([name, contributions], index) => ({
        name: asString(name, `Faculty ${index + 1}`),
        contributions: Number(contributions) || 0,
        color: FACULTY_DISTRIBUTION_COLORS[index % FACULTY_DISTRIBUTION_COLORS.length],
      }))
      .sort((a, b) => b.contributions - a.contributions);
  }

  return [];
}

function normalizeAcademicYear(item, fallbackId = "") {
  if (!item || typeof item !== "object") {
    return {
      id: asString(fallbackId),
      yearName: "",
      startDate: "",
      endDate: "",
      closureDate: "",
      closureFinalDate: "",
      status: "",
    };
  }

  return {
    id: asString(item.id ?? item.academicYearId ?? item.academic_year_id ?? fallbackId),
    yearName: asString(item.yearName ?? item.year_name ?? item.year ?? item.name),
    startDate: asString(item.startDate ?? item.start_date),
    endDate: asString(item.endDate ?? item.end_date),
    closureDate: asString(item.closureDate ?? item.closure_date ?? item.closeDate),
    closureFinalDate: asString(
      item.closureFinalDate ?? item.closure_final_date ?? item.finalClosureDate,
    ),
    status: asString(item.status ?? "Active"),
  };
}

function extractAcademicYears(payload) {
  const source = payload?.data ?? payload;
  const listCandidates = [
    source?.academicYears,
    source?.academic_years,
    source?.items,
    source,
  ];
  const list = listCandidates.find((candidate) => Array.isArray(candidate)) || [];

  return list.map((item, index) => normalizeAcademicYear(item, index + 1));
}

function extractCurrentAcademicYear(payload) {
  const source = payload?.data ?? payload;
  const recordCandidates = [
    source?.academicYear,
    source?.academic_year,
    source?.currentAcademicYear,
    source?.current,
    source,
  ];

  const record =
    recordCandidates.find(
      (candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate),
    ) || null;

  return record ? normalizeAcademicYear(record, "") : null;
}

export async function loginAction(formData) {
  return authLoginAction(formData);
}

export async function logoutAction() {
  return authLogoutAction();
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

export async function getMostViewedPagesAnalytics() {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    throw new Error("Only admin can load analytics.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/analytics/most-viewed-pages`;
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
      `Failed to load most viewed pages analytics (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return [];
  }

  return extractMostViewedPages(payload);
}

export async function getBrowserUsageAnalytics() {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    throw new Error("Only admin can load analytics.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/analytics/browser-usage`;
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
      `Failed to load browser usage analytics (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return [];
  }

  return extractBrowserUsage(payload);
}

export async function getFacultyDistributionAnalytics() {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    throw new Error("Only admin can load analytics.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/analytics/faculty-distribution`;
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
      `Failed to load faculty distribution analytics (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return [];
  }

  return extractFacultyDistribution(payload);
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

export async function getAcademicYears() {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    throw new Error("Only admin can load academic years.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/academic-years`;
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
      `Failed to load academic years (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return [];
  }

  return extractAcademicYears(payload);
}

export async function getCurrentAcademicYear() {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    throw new Error("Only admin can load current academic year.");
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing BASE_URL environment variable.");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/academic-years/current`;
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
      `Failed to load current academic year (${response.status}): ${
        isJson ? JSON.stringify(payload) : payload
      }`,
    );
  }

  if (!isJson) {
    return null;
  }

  return extractCurrentAcademicYear(payload);
}

function asNumber(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return null;
  return normalized;
}

export async function createFacultyAction(_previousState, formData) {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    return {
      ok: false,
      message: "Only admin can create faculties.",
      faculty: null,
    };
  }

  const name = asString(formData.get("name")).trim();
  const code = asString(formData.get("code")).trim();
  const description = asString(formData.get("description")).trim();

  if (!name || !code || !description) {
    return {
      ok: false,
      message: "Required fields: name, code and description.",
      faculty: null,
    };
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      message: "Missing BASE_URL environment variable.",
      faculty: null,
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/faculties`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    body: JSON.stringify({
      name,
      code,
      description,
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
        ? asString(payload?.message, "Failed to create faculty.")
        : asString(payload, "Failed to create faculty."),
      faculty: null,
    };
  }

  if (isJson && payload?.success === false) {
    return {
      ok: false,
      message: asString(payload?.message, "Failed to create faculty."),
      faculty: null,
    };
  }

  const data =
    isJson && payload && typeof payload === "object"
      ? payload?.data ?? payload?.faculty ?? payload
      : null;

  const faculty = {
    id: asString(data?.id ?? data?.facultyId ?? data?.faculty_id),
    code: asString(
      data?.facultyCode ?? data?.faculty_code ?? data?.code,
      code,
    ),
    name: asString(
      data?.facultyName ?? data?.faculty_name ?? data?.name,
      name,
    ),
  };

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/faculty-management");

  return {
    ok: true,
    message: isJson
      ? asString(payload?.message, "Faculty created.")
      : "Faculty created.",
    faculty,
  };
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

export async function createAcademicYearAction(_previousState, formData) {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    return {
      ok: false,
      message: "Only admin can create academic years.",
      academicYear: null,
    };
  }

  const yearName = asString(formData.get("yearName")).trim();
  const startDate = asString(formData.get("startDate")).trim();
  const endDate = asString(formData.get("endDate")).trim();
  const closureDate = asString(formData.get("closureDate")).trim();
  const closureFinalDate = asString(formData.get("closureFinalDate")).trim();

  if (
    !yearName ||
    !startDate ||
    !endDate ||
    !closureDate ||
    !closureFinalDate
  ) {
    return {
      ok: false,
      message:
        "Required fields: yearName, startDate, endDate, closureDate, closureFinalDate.",
      academicYear: null,
    };
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      message: "Missing BASE_URL environment variable.",
      academicYear: null,
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/academic-years`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    body: JSON.stringify({
      yearName,
      startDate,
      endDate,
      closureDate,
      closureFinalDate,
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
        ? asString(payload?.message, "Failed to create academic year.")
        : asString(payload, "Failed to create academic year."),
      academicYear: null,
    };
  }

  if (isJson && payload?.success === false) {
    return {
      ok: false,
      message: asString(payload?.message, "Failed to create academic year."),
      academicYear: null,
    };
  }

  const data =
    isJson && payload && typeof payload === "object" && payload.data
      ? payload.data
      : isJson
        ? payload
        : null;

  revalidatePath("/dashboard", "layout");

  return {
    ok: true,
    message: isJson
      ? asString(payload?.message, "Academic year created.")
      : "Academic year created.",
    academicYear: {
      id: asString(
        data?.id ?? data?.academicYearId ?? data?.academic_year_id ?? "",
      ),
      yearName,
      startDate,
      endDate,
      closureDate,
      closureFinalDate,
      status: asString(data?.status, "Active"),
    },
  };
}

export async function updateAcademicYearAction(_previousState, formData) {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    return {
      ok: false,
      message: "Only admin can update academic years.",
      academicYear: null,
    };
  }

  const id = asString(formData.get("id")).trim();
  const yearName = asString(formData.get("yearName")).trim();
  const closureDate = asString(formData.get("closureDate")).trim();
  const closureFinalDate = asString(formData.get("closureFinalDate")).trim();

  if (!id || !yearName || !closureDate || !closureFinalDate) {
    return {
      ok: false,
      message: "Required fields: id, yearName, closureDate, closureFinalDate.",
      academicYear: null,
    };
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      message: "Missing BASE_URL environment variable.",
      academicYear: null,
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/academic-years/${id}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      authToken: token,
    },
    body: JSON.stringify({
      yearName,
      closureDate,
      closureFinalDate,
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
        ? asString(payload?.message, "Failed to update academic year.")
        : asString(payload, "Failed to update academic year."),
      academicYear: null,
    };
  }

  if (isJson && payload?.success === false) {
    return {
      ok: false,
      message: asString(payload?.message, "Failed to update academic year."),
      academicYear: null,
    };
  }

  const data =
    isJson && payload && typeof payload === "object" && payload.data
      ? payload.data
      : isJson
        ? payload
        : null;

  revalidatePath("/dashboard", "layout");

  return {
    ok: true,
    message: isJson
      ? asString(payload?.message, "Academic year updated.")
      : "Academic year updated.",
    academicYear: {
      id,
      yearName,
      startDate: asString(data?.startDate ?? data?.start_date),
      endDate: asString(data?.endDate ?? data?.end_date),
      closureDate,
      closureFinalDate,
      status: asString(data?.status, "Active"),
    },
  };
}

export async function deleteAcademicYearAction(_previousState, formData) {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    return {
      ok: false,
      message: "Only admin can delete academic years.",
      id: "",
    };
  }

  const id = asString(formData.get("id")).trim();
  if (!id) {
    return {
      ok: false,
      message: "Missing academic year id.",
      id: "",
    };
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      message: "Missing BASE_URL environment variable.",
      id,
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/academic-years/${id}`;
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
      message: isJson
        ? asString(payload?.message, "Failed to delete academic year.")
        : asString(payload, "Failed to delete academic year."),
      id,
    };
  }

  if (isJson && payload?.success === false) {
    return {
      ok: false,
      message: asString(payload?.message, "Failed to delete academic year."),
      id,
    };
  }

  revalidatePath("/dashboard", "layout");

  return {
    ok: true,
    message: isJson
      ? asString(payload?.message, "Academic year deleted.")
      : "Academic year deleted.",
    id,
  };
}

export async function setCurrentAcademicYearAction(_previousState, formData) {
  const { token, role } = await requireAuthSession();

  if (role !== "admin") {
    return {
      ok: false,
      message: "Only admin can set the current academic year.",
      id: "",
    };
  }

  const id = asString(formData.get("id")).trim();
  if (!id) {
    return {
      ok: false,
      message: "Missing academic year id.",
      id: "",
    };
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      message: "Missing BASE_URL environment variable.",
      id,
    };
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/academic-years/${id}/set-current`;
  const response = await fetch(endpoint, {
    method: "PUT",
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
      message: isJson
        ? asString(payload?.message, "Failed to set current academic year.")
        : asString(payload, "Failed to set current academic year."),
      id,
    };
  }

  if (isJson && payload?.success === false) {
    return {
      ok: false,
      message: asString(payload?.message, "Failed to set current academic year."),
      id,
    };
  }

  revalidatePath("/dashboard", "layout");

  return {
    ok: true,
    message: isJson
      ? asString(payload?.message, "Current academic year updated.")
      : "Current academic year updated.",
    id,
  };
}

function parseHttpResponseMessage(response, payload, isJson, fallback) {
  if (isJson) {
    const message = asString(payload?.message).trim();
    if (message) return message;
    const fallbackMessage = asString(fallback).trim();
    if (fallbackMessage) return fallbackMessage;
    return `Request failed with status ${response.status}.`;
  }

  const text = asString(payload).trim();
  if (text) return text;
  const fallbackMessage = asString(fallback).trim();
  if (fallbackMessage) return fallbackMessage;
  return `Request failed with status ${response.status}.`;
}

export async function resetUserPasswordAction(userIdInput) {
  try {
    const { token, role } = await requireAuthSession();

    if (role !== "admin") {
      return {
        ok: false,
        message: "Only admin can reset passwords.",
      };
    }

    const userId = asString(userIdInput).trim();
    if (!userId) {
      return {
        ok: false,
        message: "Missing user id.",
      };
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      return {
        ok: false,
        message: "Missing BASE_URL environment variable.",
      };
    }

    const endpoint = `${baseUrl.replace(/\/$/, "")}/admin/users/${encodeURIComponent(
      userId,
    )}/password/reset`;
    const methodAttempts = ["POST", "PUT"];

    let latestError = null;

    for (let index = 0; index < methodAttempts.length; index += 1) {
      const method = methodAttempts[index];
      const response = await fetch(endpoint, {
        method,
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

      if (response.ok && (!isJson || payload?.success !== false)) {
        revalidatePath("/dashboard/user-management");
        return {
          ok: true,
          message: parseHttpResponseMessage(
            response,
            payload,
            isJson,
            "Password reset successfully.",
          ),
        };
      }

      latestError = parseHttpResponseMessage(
        response,
        payload,
        isJson,
        "Failed to reset password.",
      );

      const hasNextAttempt = index < methodAttempts.length - 1;
      const retryableStatus = [404, 405].includes(response.status);
      if (!hasNextAttempt || !retryableStatus) {
        break;
      }
    }

    return {
      ok: false,
      message: latestError || "Failed to reset password.",
    };
  } catch {
    return {
      ok: false,
      message: "Unable to reset password right now.",
    };
  }
}
