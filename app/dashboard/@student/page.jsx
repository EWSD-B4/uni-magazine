import { getContributionByStudent } from "@/lib/actions/student.action";

export default async function Page() {
  const data = await getContributionByStudent();

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Student Dashboard</h1>
      <pre className="max-h-[70vh] overflow-auto rounded-md border p-4 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
