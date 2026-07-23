import { cn } from "@/lib/utils";
import type { ReviewStatus, Status } from "@/types";

const STATUS_STYLES: Record<Status | "reviewed" | "needs_review" | "approved" | "not_recommended" | "draft", string> = {
  active: "bg-success text-success-foreground",
  draft: "bg-warning text-warning-foreground",
  retired: "bg-muted text-muted-foreground",
  needs_review: "bg-warning text-warning-foreground",
  reviewed: "bg-info text-info-foreground",
  approved: "bg-success/70 text-success-foreground",
  not_recommended: "bg-destructive/20 text-destructive",
};

export function StatusBadge({ status }: { status: Status }) {
  const label = status === "active" ? "Active" : status === "draft" ? "Draft" : "Retired";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" ? "bg-success-foreground" : status === "draft" ? "bg-warning-foreground" : "bg-muted-foreground",
        )}
      />
      {label}
    </span>
  );
}

const REVIEW_LABEL: Record<ReviewStatus, string> = {
  draft: "Draft",
  needs_review: "Needs Review",
  reviewed: "Reviewed",
  approved: "Approved",
  not_recommended: "Not Recommended",
};

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {REVIEW_LABEL[status]}
    </span>
  );
}
