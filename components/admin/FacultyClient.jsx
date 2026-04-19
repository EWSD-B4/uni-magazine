"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";

const columns = [
  { key: "id", header: "No.", render: (_, __, index) => `${index + 1}.` },
  { key: "code", header: "Code" },
  { key: "faculty", header: "Faculty" },
];

export function FacultyClient({ initialData = [] }) {
  const faculties = useMemo(
    () => (Array.isArray(initialData) ? initialData : []),
    [initialData],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <StatCard label="Faculty" value={faculties.length} />
      </div>

      <DataTable data={faculties} columns={columns} pageSize={6} actions={[]} />
    </div>
  );
}
