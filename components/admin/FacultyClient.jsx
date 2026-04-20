"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createFacultyAction } from "@/lib/actions/admin.action";
import { CreateFacultyModal } from "@/components/admin/CreateFacultyModal";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";

const INITIAL_FORM_STATE = {
  name: "",
  code: "",
  description: "",
};

const columns = [
  { key: "id", header: "No.", render: (_, __, index) => `${index + 1}.` },
  { key: "code", header: "Code" },
  { key: "faculty", header: "Faculty" },
];

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function buildFacultyRow(faculty, fallbackIndex) {
  const name = asString(
    faculty?.name ?? faculty?.facultyName ?? faculty?.faculty,
    "N/A",
  );
  const code = asString(
    faculty?.code ?? faculty?.facultyCode ?? faculty?.faculty_code,
    "-",
  );
  const id = asString(
    faculty?.id ?? faculty?.facultyId ?? faculty?.faculty_id,
    String(fallbackIndex),
  );

  return {
    id,
    code,
    faculty: name,
  };
}

export function FacultyClient({ initialData = [] }) {
  const [rows, setRows] = useState(() =>
    (Array.isArray(initialData) ? initialData : []).map((item, index) =>
      buildFacultyRow(item, index + 1),
    ),
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [feedback, setFeedback] = useState({
    ok: false,
    message: "",
  });
  const [isPending, startTransition] = useTransition();

  const handleSave = (event) => {
    event.preventDefault();

    const name = asString(formData.name).trim();
    const code = asString(formData.code).trim();
    const description = asString(formData.description).trim();

    if (!name || !code || !description) {
      setFeedback({
        ok: false,
        message: "Required fields: name, code and description.",
      });
      return;
    }

    setFeedback({ ok: false, message: "" });

    startTransition(async () => {
      const payload = new FormData();
      payload.set("name", name);
      payload.set("code", code);
      payload.set("description", description);

      const result = await createFacultyAction(null, payload);
      if (!result?.ok) {
        setFeedback({
          ok: false,
          message: asString(result?.message, "Failed to create faculty."),
        });
        return;
      }

      if (result.faculty) {
        const nextRow = buildFacultyRow(result.faculty, rows.length + 1);
        setRows((previous) => {
          const exists = previous.some((item) => {
            const sameId = asString(item.id) === asString(nextRow.id);
            const sameIdentity =
              asString(item.code).toLowerCase() === asString(nextRow.code).toLowerCase() &&
              asString(item.faculty).toLowerCase() === asString(nextRow.faculty).toLowerCase();
            return sameId || sameIdentity;
          });

          if (exists) {
            return previous;
          }

          return [...previous, nextRow].sort((a, b) =>
            asString(a.faculty).localeCompare(asString(b.faculty)),
          );
        });
      }

      setFeedback({
        ok: true,
        message: asString(result.message, "Faculty created."),
      });
      setFormData(INITIAL_FORM_STATE);
      setIsCreateOpen(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <StatCard label="Faculty" value={rows.length} />
        <Button
          type="button"
          className="flex items-center gap-2 bg-[#f26b5b] text-white hover:bg-[#e55d4f]"
          onClick={() => {
            setFeedback({ ok: false, message: "" });
            setIsCreateOpen(true);
          }}
        >
          <Plus size={18} />
          Add Faculty
        </Button>
      </div>

      {feedback.message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            feedback.ok
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <DataTable data={rows} columns={columns} pageSize={6} actions={[]} />

      <CreateFacultyModal
        isOpen={isCreateOpen}
        onClose={() => {
          if (isPending) return;
          setIsCreateOpen(false);
        }}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        isPending={isPending}
      />
    </div>
  );
}
