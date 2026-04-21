import { OrangeCircleLoader } from "@/components/ui/orange-circle-loader";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8e3dc]">
      <div className="flex flex-col items-center gap-3 text-slate-700">
        <OrangeCircleLoader size="xl" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
