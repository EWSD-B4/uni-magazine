"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { updateCoordinatorContributionDecisionAction } from "@/lib/actions/contribution.action";

function formatStatus(value) {
  const raw = String(value || "").trim();
  if (!raw) return "N/A";
  return raw
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function CoordinatorContributionDecisionButtons({
  contributionId,
  currentStatus,
  returnPath,
}) {
  const [actionState, formAction, isPending] = React.useActionState(
    updateCoordinatorContributionDecisionAction,
    {
      ok: false,
      message: "",
      decision: "",
    },
  );

  const statusLabel =
    actionState?.decision === "under_review"
      ? "Under Review"
      : actionState?.decision === "selected"
        ? "Selected"
        : actionState?.decision === "rejected"
          ? "Rejected"
          : formatStatus(currentStatus);

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Review Decision</p>
          <p className="text-xs text-slate-600">Current status: {statusLabel}</p>
          {actionState?.message ? (
            <p
              className={`mt-1 text-xs ${
                actionState.ok ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {actionState.message}
            </p>
          ) : null}
        </div>

        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="contributionId" value={contributionId} />
          <input type="hidden" name="returnPath" value={returnPath || ""} />
          <Button
            type="submit"
            name="decision"
            value="under_review"
            variant="outline"
            disabled={isPending}
          >
            Under Review
          </Button>
          <Button
            type="submit"
            name="decision"
            value="selected"
            disabled={isPending}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Selected
          </Button>
          <Button
            type="submit"
            name="decision"
            value="rejected"
            variant="destructive"
            disabled={isPending}
          >
            Rejected
          </Button>
        </form>
      </div>
    </div>
  );
}
