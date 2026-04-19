import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import {
  getBrowserUsageAnalytics,
  getFacultyDistributionAnalytics,
  getMostViewedPagesAnalytics,
  getUsers,
} from "@/lib/actions/admin.action";
import { requireAuthSession } from "@/lib/auth";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapMostActiveUsers(users) {
  return users
    .map((user, index) => ({
      id: asString(user?.id, String(index + 1)),
      username: asString(user?.name, "Unknown"),
      contributions: asNumber(
        user?.contributions ??
          user?.totalContributions ??
          user?.submissionCount ??
          user?.articleCount,
        0,
      ),
      avatar: asString(user?.avatar ?? user?.imageUrl ?? user?.photo),
    }))
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 5);
}

export default async function AdminDashboardPage() {
  const session = await requireAuthSession();
  if (session.role !== "admin") {
    return null;
  }

  const [usersResult, mostViewedResult, browserUsageResult, facultyDistributionResult] =
    await Promise.allSettled([
    getUsers(),
    getMostViewedPagesAnalytics(),
    getBrowserUsageAnalytics(),
    getFacultyDistributionAnalytics(),
  ]);

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const mostViewedPages =
    mostViewedResult.status === "fulfilled" ? mostViewedResult.value : [];
  const browserUsage =
    browserUsageResult.status === "fulfilled" ? browserUsageResult.value : [];
  const facultyDistribution =
    facultyDistributionResult.status === "fulfilled"
      ? facultyDistributionResult.value
      : [];

  const loadErrors = [];
  if (usersResult.status === "rejected") {
    loadErrors.push(
      usersResult.reason instanceof Error
        ? usersResult.reason.message
        : "Failed to load users.",
    );
  }
  if (mostViewedResult.status === "rejected") {
    loadErrors.push(
      mostViewedResult.reason instanceof Error
        ? mostViewedResult.reason.message
        : "Failed to load most viewed pages analytics.",
    );
  }
  if (browserUsageResult.status === "rejected") {
    loadErrors.push(
      browserUsageResult.reason instanceof Error
        ? browserUsageResult.reason.message
        : "Failed to load browser usage analytics.",
    );
  }
  if (facultyDistributionResult.status === "rejected") {
    loadErrors.push(
      facultyDistributionResult.reason instanceof Error
        ? facultyDistributionResult.reason.message
        : "Failed to load faculty distribution analytics.",
    );
  }

  const mostActiveUsers = mapMostActiveUsers(users);

  return (
    <AdminDashboardClient
      mostViewedPages={mostViewedPages}
      mostActiveUsers={mostActiveUsers}
      browserUsage={browserUsage}
      contributionChart={facultyDistribution}
      loadError={loadErrors.join(" ")}
    />
  );
}
