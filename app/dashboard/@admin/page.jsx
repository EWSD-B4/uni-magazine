import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import {
  getBrowserUsageAnalytics,
  getMostViewedPagesAnalytics,
  getUsers,
} from "@/lib/actions/admin.action";

const chartColors = [
  "#F26454CC",
  "#22C55ECC",
  "#FBBF24CC",
  "#3B82F6CC",
  "#A855F7CC",
  "#14B8A6CC",
];

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

function mapContributionChart(users) {
  const buckets = new Map();

  users.forEach((user) => {
    const faculty = asString(user?.faculty, "N/A").toUpperCase();
    const contributionCount = asNumber(
      user?.contributions ??
        user?.totalContributions ??
        user?.submissionCount ??
        user?.articleCount,
      0,
    );
    const current = buckets.get(faculty) || { contributionCount: 0 };
    current.contributionCount += contributionCount;
    buckets.set(faculty, current);
  });

  const chart = Array.from(buckets.entries())
    .map(([name, value], index) => ({
      name,
      contributions: value.contributionCount,
      color: chartColors[index % chartColors.length],
    }))
    .filter((item) => item.contributions > 0)
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 6);

  return chart;
}

export default async function AdminDashboardPage() {
  const [usersResult, mostViewedResult, browserUsageResult] = await Promise.allSettled([
    getUsers(),
    getMostViewedPagesAnalytics(),
    getBrowserUsageAnalytics(),
  ]);

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const mostViewedPages =
    mostViewedResult.status === "fulfilled" ? mostViewedResult.value : [];
  const browserUsage =
    browserUsageResult.status === "fulfilled" ? browserUsageResult.value : [];

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

  const mostActiveUsers = mapMostActiveUsers(users);
  const contributionChart = mapContributionChart(users);

  return (
    <AdminDashboardClient
      mostViewedPages={mostViewedPages}
      mostActiveUsers={mostActiveUsers}
      browserUsage={browserUsage}
      contributionChart={contributionChart}
      loadError={loadErrors.join(" ")}
    />
  );
}
