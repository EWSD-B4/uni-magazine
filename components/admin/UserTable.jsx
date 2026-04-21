"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { resetUserPasswordAction } from "@/lib/actions/admin.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [resetFeedback, setResetFeedback] = useState({
    type: "",
    message: "",
  });

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

  function openResetPasswordModal(row) {
    const targetId = String(row?.id || "").trim();
    if (!targetId) return;
    setResetTargetUser({
      id: targetId,
      name: String(row?.name || "").trim(),
      email: String(row?.email || "").trim(),
    });
    setResetModalOpen(true);
  }

  async function handleConfirmResetPassword() {
    const targetId = String(resetTargetUser?.id || "").trim();
    if (!targetId) {
      setResetFeedback({
        type: "error",
        message: "Missing user id.",
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const result = await resetUserPasswordAction(targetId);
      setResetFeedback({
        type: result?.ok ? "success" : "error",
        message: result?.message || "Failed to reset password.",
      });
      if (result?.ok) {
        setResetModalOpen(false);
      }
    } catch {
      setResetFeedback({
        type: "error",
        message: "Failed to reset password.",
      });
    } finally {
      setIsResettingPassword(false);
    }
  }

  const tableActions = [
    {
      label: "Reset Password",
      onClick: (row) => {
        if (isResettingPassword) return;
        openResetPasswordModal(row);
      },
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

      {resetFeedback.message ? (
        <p
          className={`rounded-md border px-4 py-2 text-sm ${
            resetFeedback.type === "success"
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {resetFeedback.message}
        </p>
      ) : null}

      <DataTable
        data={filteredUsers}
        columns={columns}
        pageSize={6}
        actions={tableActions}
      />

      <Dialog
        open={resetModalOpen}
        onOpenChange={(open) => {
          if (isResettingPassword) return;
          setResetModalOpen(open);
        }}
      >
        <DialogContent className="max-w-md border-slate-300 bg-[#f8f4ec]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription className="text-slate-600">
              This will generate a new password/reset flow for this user.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">User ID:</span>{" "}
              {resetTargetUser?.id || "-"}
            </p>
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {resetTargetUser?.name || "-"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {resetTargetUser?.email || "-"}
            </p>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isResettingPassword}
              className="border-slate-300"
              onClick={() => setResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isResettingPassword}
              className="bg-[#f26b5b] text-white hover:bg-[#e55d4f]"
              onClick={() => {
                void handleConfirmResetPassword();
              }}
            >
              {isResettingPassword ? "Resetting..." : "Confirm Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
