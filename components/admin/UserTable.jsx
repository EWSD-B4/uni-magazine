"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";

const columns = [
  { key: "id", header: "No.", render: (_, __, index) => `${index + 1}.` },
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "faculty", header: "Faculty" },
  { key: "date", header: "Submitted On" },
  {
    key: "status",
    header: "Status",
    render: (value) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          value === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {value}
      </span>
    ),
  },
];

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}

export default function UserTable({ initialUsers = [], faculties = [] }) {
  const router = useRouter();
  const users = useMemo(
    () => (Array.isArray(initialUsers) ? initialUsers : []),
    [initialUsers],
  );
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedFaculty, setSelectedFaculty] = useState("All Faculties");

  const roles = useMemo(
    () => ["All Roles", ...uniqueSorted(users.map((user) => user.role))],
    [users],
  );
  const facultyOptions = useMemo(() => {
    const fromApiOnly = uniqueSorted(
      faculties.map((faculty) =>
        typeof faculty === "string" ? faculty : faculty?.name,
      ),
    );
    return ["All Faculties", ...fromApiOnly];
  }, [faculties]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const roleMatch =
          selectedRole === "All Roles" || user.role === selectedRole;
        const facultyMatch =
          selectedFaculty === "All Faculties" ||
          user.faculty === selectedFaculty;
        return roleMatch && facultyMatch;
      }),
    [users, selectedRole, selectedFaculty],
  );

  const tableActions = [
    {
      label: "Reset Password",
      onClick: (row) => router.push(`/dashboard/reset-password/${row.id}`),
    },
    {
      label: "Edit Account",
      onClick: (row) => router.push(`/dashboard/edit-account/${row.id}`),
    },
  ];

  const studentCount = users.filter((user) => user.role === "Student").length;
  const coordinatorCount = users.filter(
    (user) => user.role === "Marketing Coordinator",
  ).length;
  const managerCount = users.filter(
    (user) => user.role === "Marketing Manager",
  ).length;
  const guestCount = users.filter((user) => user.role === "Guest").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <Button
          type="button"
          onClick={() => router.push("/dashboard/user-management/create-user")}
          className="rounded-full bg-[#f26b5b] px-5 text-white hover:bg-[#e55d4f]"
        >
          <Plus className="size-4" />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={studentCount} />
        <StatCard label="Marketing Coordinators" value={coordinatorCount} />
        <StatCard label="Marketing Managers" value={managerCount} />
        <StatCard label="Guests" value={guestCount} />
      </div>

      <div className="my-4 flex flex-col gap-4 sm:flex-row">
        <select
          className="rounded border bg-white px-4 py-2"
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          className="rounded border bg-white px-4 py-2"
          value={selectedFaculty}
          onChange={(event) => setSelectedFaculty(event.target.value)}
        >
          {facultyOptions.map((faculty) => (
            <option key={faculty} value={faculty}>
              {faculty}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        pageSize={6}
        actions={tableActions}
      />
    </div>
  );
}
