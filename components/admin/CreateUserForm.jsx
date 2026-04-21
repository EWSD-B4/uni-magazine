"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createUserAction } from "@/lib/actions/admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrangeCircleLoader } from "@/components/ui/orange-circle-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INITIAL_ACTION_STATE = {
  ok: false,
  message: "",
};

function uniqueSorted(items) {
  return [...new Set(items.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}

function roleRequiresFacultyByLabel(roleLabel) {
  const normalized = String(roleLabel || "").trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === "admin") return false;
  if (normalized.includes("manager")) return false;
  return true;
}

export default function CreateUserForm({ faculties = [], roleOptions = [] }) {
  const router = useRouter();

  const [actionState, formAction, isPending] = useActionState(
    createUserAction,
    INITIAL_ACTION_STATE,
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState("");

  const facultyOptions = useMemo(() => {
    const normalized = faculties
      .map((faculty) => {
        if (!faculty || typeof faculty !== "object") return null;
        const id = String(faculty.id ?? "").trim();
        const name = String(faculty.name ?? "").trim();
        if (!name) return null;
        return { id, name };
      })
      .filter(Boolean);

    return normalized.sort((a, b) => a.name.localeCompare(b.name));
  }, [faculties]);

  const roleSelectOptions = useMemo(() => {
    const normalized = roleOptions
      .map((role) => {
        if (!role || typeof role !== "object") return null;
        const id = String(role.id ?? "").trim();
        const label = String(role.label ?? "").trim();
        if (!id || !label) return null;
        return { id, label };
      })
      .filter(Boolean);

    return normalized.sort((a, b) => a.label.localeCompare(b.label));
  }, [roleOptions]);

  const facultyNameLookup = useMemo(() => {
    return new Map(
      facultyOptions.map((item) => [item.id, item.name]),
    );
  }, [facultyOptions]);

  const roleLabelLookup = useMemo(() => {
    return new Map(roleSelectOptions.map((item) => [item.id, item.label]));
  }, [roleSelectOptions]);
  const selectedRoleLabel = roleLabelLookup.get(roleId) || "";
  const isFacultyRequired = roleRequiresFacultyByLabel(selectedRoleLabel);

  const fallbackFacultyNames = useMemo(
    () =>
      uniqueSorted(
        faculties
          .map((faculty) =>
            typeof faculty === "string" ? faculty : faculty?.name,
          )
          .map((name) => String(name || "").trim()),
      ),
    [faculties],
  );

  const handleSubmit = (event) => {
    setClientError("");

    if (!fullName || !email || !password || !confirmPassword) {
      event.preventDefault();
      setClientError("Please fill all required fields.");
      return;
    }

    if (!roleId) {
      event.preventDefault();
      setClientError("Please select role_id.");
      return;
    }

    if (isFacultyRequired && !facultyId) {
      event.preventDefault();
      setClientError("Please select faculty_id.");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setClientError("Password and confirm password must match.");
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e3dc] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Button
          type="button"
          onClick={() => router.back()}
          className="mb-8 rounded-full bg-[#f26b5b] px-6 text-white hover:bg-[#e55d4f]"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <h1 className="mb-8 text-3xl font-semibold text-slate-900">
          Create Account
        </h1>

        <form action={formAction} onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="create-user-name">Full Name</Label>
                <Input
                  id="create-user-name"
                  name="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-user-email">Email</Label>
                <Input
                  id="create-user-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@gmail.com"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-user-password">Password</Label>
                <div className="relative">
                  <Input
                    id="create-user-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    aria-label={
                      showPassword ? "Hide password value" : "Show password value"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  Password must be at least 6 characters and include letters and
                  numbers.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Faculty</Label>
                {facultyOptions.some((item) => item.id) ? (
                  <>
                    <Select
                      value={facultyId}
                      onValueChange={setFacultyId}
                      disabled={!isFacultyRequired}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {facultyOptions
                          .filter((item) => item.id)
                          .map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="faculty_id"
                      value={isFacultyRequired ? facultyId : ""}
                    />
                  </>
                ) : (
                  <Input
                    name="faculty_id"
                    type="number"
                    min="1"
                    value={facultyId}
                    onChange={(event) => setFacultyId(event.target.value)}
                    placeholder="Enter faculty_id"
                    className="bg-white"
                    disabled={!isFacultyRequired}
                  />
                )}
                {!isFacultyRequired ? (
                  <p className="text-xs text-slate-600">
                    Faculty is optional for this role.
                  </p>
                ) : null}
                {!facultyOptions.some((item) => item.id) &&
                fallbackFacultyNames.length ? (
                  <p className="text-xs text-slate-600">
                    Faculties from API: {fallbackFacultyNames.join(", ")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                {roleSelectOptions.length ? (
                  <>
                    <Select value={roleId} onValueChange={setRoleId}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {roleSelectOptions.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="role_id" value={roleId} />
                    <input type="hidden" name="role_label" value={selectedRoleLabel} />
                  </>
                ) : (
                  <Input
                    name="role_id"
                    type="number"
                    min="1"
                    value={roleId}
                    onChange={(event) => setRoleId(event.target.value)}
                    placeholder="Enter role_id"
                    className="bg-white"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-user-confirm-password">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="create-user-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password value"
                        : "Show confirm password value"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {clientError ? (
            <div className="max-w-md rounded-xl border border-red-300 bg-white p-3 text-sm text-red-700">
              {clientError}
            </div>
          ) : null}

          {actionState?.message ? (
            <div
              className={`max-w-md rounded-xl border bg-white p-3 text-sm ${
                actionState.ok
                  ? "border-emerald-200 text-emerald-700"
                  : "border-red-300 text-red-700"
              }`}
            >
              {actionState.message}
            </div>
          ) : null}

          {roleId && roleLabelLookup.has(roleId) ? (
            <p className="text-xs text-slate-600">
              Selected Role: {roleLabelLookup.get(roleId)} (role_id: {roleId})
            </p>
          ) : null}

          {facultyId && facultyNameLookup.has(facultyId) ? (
            <p className="text-xs text-slate-600">
              Selected Faculty: {facultyNameLookup.get(facultyId)} (faculty_id:{" "}
              {facultyId})
            </p>
          ) : null}

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#f26b5b] px-10 text-lg text-black hover:bg-[#e55d4f]"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <OrangeCircleLoader size="sm" />
                  Creating...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
