import CoorTable from "@/components/coor/CoorTable";
import { getContributionListing } from "@/lib/actions/contribution.action";

export default async function CoordinatorDashboardPage() {
  const data = await getContributionListing("coordinator");
  return <CoorTable contributionsPayload={data} />;
}
