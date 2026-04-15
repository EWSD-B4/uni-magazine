"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  createAcademicYearAction,
  deleteAcademicYearAction,
  updateAcademicYearAction,
} from "@/lib/actions/admin.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";

const INITIAL_CREATE_STATE = {
  ok: false,
  message: "",
  academicYear: null,
};

const INITIAL_UPDATE_STATE = {
  ok: false,
  message: "",
  academicYear: null,
};

const initialForm = {
  id: "",
  yearName: "",
  startDate: "",
  endDate: "",
  closureDate: "",
  closureFinalDate: "",
  status: "Active",
};

const columns = [
  {
    key: "id",
    header: "No.",
    render: (_value, _row, index) => `${index + 1}.`,
  },
  { key: "yearName", header: "Academic Year" },
  { key: "startDate", header: "Submission Open" },
  { key: "closureDate", header: "Closure Date" },
  { key: "closureFinalDate", header: "Final Closure" },
  {
    key: "status",
    header: "Status",
    render: (value) => {
      const isActive = String(value).toLowerCase() === "active";
      return (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {value || "N/A"}
        </span>
      );
    },
  },
];

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function toInputDate(value) {
  const raw = asString(value);
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(value) {
  const inputDate = toInputDate(value);
  if (!inputDate) return "-";

  const date = new Date(`${inputDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return inputDate;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toRow(item, fallbackId) {
  return {
    id: asString(item?.id, fallbackId),
    yearName: asString(item?.yearName),
    startDate: toInputDate(item?.startDate),
    endDate: toInputDate(item?.endDate),
    closureDate: toInputDate(item?.closureDate),
    closureFinalDate: toInputDate(item?.closureFinalDate),
    status: asString(item?.status, "Active"),
  };
}

function validateCreateForm(formData) {
  if (
    !formData.yearName ||
    !formData.startDate ||
    !formData.endDate ||
    !formData.closureDate ||
    !formData.closureFinalDate
  ) {
    return "All fields are required.";
  }
  return "";
}

function validateUpdateForm(formData) {
  if (!formData.id || !formData.yearName || !formData.closureDate || !formData.closureFinalDate) {
    return "Required fields: year name, closure date and final closure date.";
  }
  return "";
}

export default function AcademicYearPage({
  initialAcademicYears = [],
  currentAcademicYear = null,
  loadError = "",
}) {
  const [rows, setRows] = React.useState(
    initialAcademicYears.map((item, index) => toRow(item, index + 1)),
  );
  const [showModal, setShowModal] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState(null);
  const [formData, setFormData] = React.useState(initialForm);
  const [clientError, setClientError] = React.useState("");
  const [clientSuccess, setClientSuccess] = React.useState("");
  const [isDeletePending, startDeleteTransition] = React.useTransition();

  const [createState, createFormAction, isCreatePending] = React.useActionState(
    createAcademicYearAction,
    INITIAL_CREATE_STATE,
  );
  const [updateState, updateFormAction, isUpdatePending] = React.useActionState(
    updateAcademicYearAction,
    INITIAL_UPDATE_STATE,
  );

  const isPending = isCreatePending || isUpdatePending;

  React.useEffect(() => {
    if (!createState?.message) return;

    if (createState.ok && createState.academicYear) {
      setRows((previous) => [
        ...previous,
        toRow(createState.academicYear, previous.length + 1),
      ]);
      setClientError("");
      setClientSuccess(createState.message);
      setShowModal(false);
      setEditingRow(null);
      setFormData(initialForm);
      return;
    }

    setClientSuccess("");
    setClientError(createState.message);
  }, [createState]);

  React.useEffect(() => {
    if (!updateState?.message) return;

    if (updateState.ok && updateState.academicYear) {
      setRows((previous) =>
        previous.map((row) =>
          row.id === asString(updateState.academicYear.id)
            ? {
                ...row,
                yearName: toRow(updateState.academicYear, row.id).yearName,
                closureDate: toRow(updateState.academicYear, row.id).closureDate,
                closureFinalDate: toRow(updateState.academicYear, row.id)
                  .closureFinalDate,
                status: toRow(updateState.academicYear, row.id).status || row.status,
              }
            : row,
        ),
      );
      setClientError("");
      setClientSuccess(updateState.message);
      setShowModal(false);
      setEditingRow(null);
      setFormData(initialForm);
      return;
    }

    setClientSuccess("");
    setClientError(updateState.message);
  }, [updateState]);

  const current = currentAcademicYear ? toRow(currentAcademicYear, "") : null;

  const openCreate = () => {
    setEditingRow(null);
    setFormData(initialForm);
    setClientError("");
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setFormData({
      id: asString(row.id),
      yearName: asString(row.yearName),
      startDate: asString(row.startDate),
      endDate: asString(row.endDate),
      closureDate: asString(row.closureDate),
      closureFinalDate: asString(row.closureFinalDate),
      status: asString(row.status, "Active"),
    });
    setClientError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (isPending) return;
    setShowModal(false);
    setClientError("");
  };

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${row.yearName}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setClientSuccess("");
    setClientError("");

    startDeleteTransition(async () => {
      const payload = new FormData();
      payload.set("id", asString(row.id));
      const result = await deleteAcademicYearAction(null, payload);

      if (!result?.ok) {
        setClientError(result?.message || "Failed to delete academic year.");
        return;
      }

      setRows((previous) =>
        previous.filter((item) => item.id !== asString(result.id)),
      );
      setClientSuccess(result.message || "Academic year deleted.");
    });
  };

  const handleSubmitValidate = (event) => {
    setClientSuccess("");
    const message = editingRow
      ? validateUpdateForm(formData)
      : validateCreateForm(formData);

    if (message) {
      event.preventDefault();
      setClientError(message);
      return;
    }

    setClientError("");
  };

  const tableActions = [
    { label: "Edit", onClick: openEdit },
    { label: "Delete", onClick: handleDelete },
  ];

  return (
    <div className="space-y-6 p-6">
      {loadError ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current Academic Year"
          value={current?.yearName || "-"}
        />
        <StatCard
          label="Submissions Open"
          value={formatDateLabel(current?.startDate)}
        />
        <StatCard
          label="Submissions Deadline"
          value={formatDateLabel(current?.closureDate)}
        />
        <StatCard
          label="Final Closure Date"
          value={formatDateLabel(current?.closureFinalDate)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="flex items-center gap-2 bg-[#f26b5b] text-white hover:bg-[#e55d4f]"
          onClick={openCreate}
        >
          <Plus size={18} />
          Create Academic Year
        </Button>
      </div>

      {clientSuccess ? (
        <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          {clientSuccess}
        </p>
      ) : null}

      <DataTable data={rows} columns={columns} pageSize={6} actions={tableActions} />

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingRow ? "Edit Academic Year" : "Create Academic Year"}
            </h2>

            <form
              action={editingRow ? updateFormAction : createFormAction}
              onSubmit={handleSubmitValidate}
              className="space-y-4"
            >
              {editingRow ? (
                <input type="hidden" name="id" value={formData.id} />
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="yearName">Academic Year</Label>
                <Input
                  id="yearName"
                  name="yearName"
                  placeholder="2024-2025"
                  value={formData.yearName}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      yearName: event.target.value,
                    }))
                  }
                  disabled={isPending || isDeletePending}
                />
              </div>

              {!editingRow ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          startDate: event.target.value,
                        }))
                      }
                      disabled={isPending || isDeletePending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          endDate: event.target.value,
                        }))
                      }
                      disabled={isPending || isDeletePending}
                    />
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="closureDate">Closure Date (1st Deadline)</Label>
                <Input
                  id="closureDate"
                  name="closureDate"
                  type="date"
                  value={formData.closureDate}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      closureDate: event.target.value,
                    }))
                  }
                  disabled={isPending || isDeletePending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closureFinalDate">
                  Final Closure Date (2nd Deadline)
                </Label>
                <Input
                  id="closureFinalDate"
                  name="closureFinalDate"
                  type="date"
                  value={formData.closureFinalDate}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      closureFinalDate: event.target.value,
                    }))
                  }
                  disabled={isPending || isDeletePending}
                />
              </div>

              {clientError ? (
                <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {clientError}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isPending || isDeletePending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isPending || isDeletePending}
                  className="bg-[#f26b5b] text-white hover:bg-[#e55d4f]"
                >
                  {isPending
                    ? editingRow
                      ? "Updating..."
                      : "Creating..."
                    : editingRow
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
