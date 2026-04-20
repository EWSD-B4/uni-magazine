"use client";

import * as React from "react";
import {
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  LayoutGrid,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONTRIBUTION_STATUS_OPTIONS } from "@/lib/helpers/contribution-status";
import { cn } from "@/lib/utils";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  {
    value: "All Statuses",
    label: "All Statuses",
    icon: LayoutGrid,
    iconColor: "text-white",
    count: null, // filled dynamically
  },
  ...CONTRIBUTION_STATUS_OPTIONS.map((status) => {
    const iconMap = {
      pending: Clock,
      under_review: Eye,
      submitted: CheckCircle2,
      flagged_plagiarism: AlertTriangle,
      rejected: XCircle,
    };

    const iconColorMap = {
      pending: "text-amber-700",
      under_review: "text-sky-700",
      submitted: "text-emerald-700",
      flagged_plagiarism: "text-rose-700",
      rejected: "text-red-700",
    };

    return {
      value: status.label,
      label: status.label,
      icon: iconMap[status.key] || LayoutGrid,
      iconColor: iconColorMap[status.key] || "text-slate-600",
      badgeClass: status.badgeClass,
    };
  }),
];

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * StatusFilterDropdown
 *
 * Props:
 *   data          – full rows array (used to compute per-status counts)
 *   statusKey     – key in each row that holds the status string (default: "statues")
 *   value         – currently selected status string
 *   onChange      – (statusString) => void
 */
export function StatusFilter({
  data = [],
  statusKey = "statues",
  value = "All Statuses",
  onChange,
}) {
  // Compute counts from data
  const counts = React.useMemo(() => {
    const map = { "All Statuses": data.length };
    data.forEach((row) => {
      const s = row[statusKey];
      if (s) map[s] = (map[s] ?? 0) + 1;
    });
    return map;
  }, [data, statusKey]);

  const active = STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0];

  return (
    <DropdownMenu>
      {/* ── Trigger ── */}
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold",
            "bg-[#F26454] text-white shadow-sm",
            "hover:bg-[#e0533f] active:bg-[#c94530]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26454]/60",
            "transition-colors duration-150 select-none cursor-pointer"
          )}
        >
          <active.icon className={cn("h-4 w-4", active.iconColor ?? "text-white")} />
          {active.label}
          <ChevronDown className="h-4 w-4 opacity-80" />
        </button>
      </DropdownMenuTrigger>

      {/* ── Menu ── */}
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
      >
        {STATUS_OPTIONS.map((option, idx) => {
          const Icon = option.icon;
          const count = counts[option.value] ?? 0;
          const isSelected = value === option.value;
          const isAll = option.value === "All Statuses";

          return (
            <React.Fragment key={option.value}>
              {/* Separator before first real status */}
              {idx === 1 && (
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
              )}

              <DropdownMenuItem
                onSelect={() => onChange?.(option.value)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm",
                  "focus:bg-slate-50 focus:text-slate-900",
                  isSelected && "bg-slate-50 font-semibold text-slate-900"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isAll ? "text-slate-400" : option.iconColor
                    )}
                  />
                  {option.label}
                </span>

                {/* Count badge */}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    isAll
                      ? "bg-slate-100 text-slate-500"
                      : option.badgeClass
                  )}
                >
                  {count}
                </span>
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
