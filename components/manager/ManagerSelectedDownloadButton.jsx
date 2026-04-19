"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export default function ManagerSelectedDownloadButton({
  label = "Download",
  variant = "default",
  className,
}) {
  const [error, setError] = React.useState("");
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = React.useCallback(async () => {
    setError("");
    setIsDownloading(true);

    try {
      const response = await fetch("/api/manager/contributions/selected/download", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const payload = await response.json();
          setError(
            payload?.message || "Failed to download selected contributions.",
          );
        } else {
          const text = await response.text();
          setError(text || "Failed to download selected contributions.");
        }
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const fileNameMatch =
        disposition.match(/filename\*=UTF-8''([^;]+)/i) ||
        disposition.match(/filename=\"?([^\";]+)\"?/i);
      const rawFileName = fileNameMatch?.[1] || "selected-contributions";
      const fileName = decodeURIComponent(rawFileName);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download selected contributions.");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={isDownloading}
        onClick={() => {
          void handleDownload();
        }}
      >
        {isDownloading ? "Preparing download..." : label}
      </Button>
      {error ? (
        <p className="text-sm font-medium text-amber-700">{error}</p>
      ) : null}
    </div>
  );
}
