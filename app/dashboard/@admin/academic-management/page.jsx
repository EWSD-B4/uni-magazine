import AcademicYearPage from "./academic";
import {
  getAcademicYears,
  getCurrentAcademicYear,
} from "@/lib/actions/admin.action";

export default async function AcademicManagementPage() {
  const [yearsResult, currentResult] = await Promise.allSettled([
    getAcademicYears(),
    getCurrentAcademicYear(),
  ]);

  const initialAcademicYears =
    yearsResult.status === "fulfilled" ? yearsResult.value : [];
  const currentAcademicYear =
    currentResult.status === "fulfilled" ? currentResult.value : null;

  const loadErrors = [];
  if (yearsResult.status === "rejected") {
    loadErrors.push(
      yearsResult.reason instanceof Error
        ? yearsResult.reason.message
        : "Failed to load academic years.",
    );
  }
  if (currentResult.status === "rejected") {
    loadErrors.push(
      currentResult.reason instanceof Error
        ? currentResult.reason.message
        : "Failed to load current academic year.",
    );
  }

  return (
    <AcademicYearPage
      initialAcademicYears={initialAcademicYears}
      currentAcademicYear={currentAcademicYear}
      loadError={loadErrors.join(" ")}
    />
  );
}
