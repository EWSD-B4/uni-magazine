import CoorTable from "@/components/coor/CoorTable";
import {
  getContributionListing,
  getCoordinatorUrgentContributions,
} from "@/lib/actions/contribution.action";
import { getCurrentAcademicYearDeadlines } from "@/lib/actions/student.action";

export default async function CoordinatorDashboardPage() {
  const [data, urgentTasksPayload, deadlines] = await Promise.all([
    getContributionListing("coordinator"),
    getCoordinatorUrgentContributions(),
    getCurrentAcademicYearDeadlines(),
  ]);

  return (
    <CoorTable
      contributionsPayload={data}
      urgentTasksPayload={urgentTasksPayload}
      deadlines={deadlines}
    />
  );
}
