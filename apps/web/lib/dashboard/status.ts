// apps/web/lib/dashboard/status.ts
export function normalizeRenderStatus(status: string | null | undefined) {
  return (status ?? "").toLowerCase().trim();
}

export function isRenderDone(status: string | null | undefined) {
  return normalizeRenderStatus(status) === "done";
}

export function isRenderFailed(status: string | null | undefined) {
  return normalizeRenderStatus(status) === "failed";
}

export function isRenderProcessing(status: string | null | undefined) {
  const normalized = normalizeRenderStatus(status);
  return normalized === "pending" || normalized === "processing";
}

export function canRetryRender(status: string | null | undefined) {
  return isRenderFailed(status);
}

export function getStatusLabel(status: string | null | undefined) {
  const normalized = normalizeRenderStatus(status);

  switch (normalized) {
    case "done":
      return "Done";
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    default:
      return "Not rendered";
  }
}

export function getStatusTone(status: string | null | undefined) {
  const normalized = normalizeRenderStatus(status);

  switch (normalized) {
    case "done":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "neutral";
  }
}
