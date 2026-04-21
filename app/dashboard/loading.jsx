import { OrangeCircleLoader } from "@/components/ui/orange-circle-loader";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-700">
        <OrangeCircleLoader size="lg" />
        <p className="text-sm font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
}
