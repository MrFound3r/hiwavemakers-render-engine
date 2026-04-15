"use client";

import { Button } from "@/components/ui/button";
import { Mail, Play, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  emailableSelectedCount: number;
  isSendingBulkEmail: boolean;
  onClearSelection: () => void;
  onRenderSelected: () => void;
  onEmailSelected: () => void;
}

export function BulkActionsBar({
  selectedCount,
  emailableSelectedCount,
  isSendingBulkEmail,
  onClearSelection,
  onRenderSelected,
  onEmailSelected,
}: BulkActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
      <div className="text-sm text-muted-foreground">
        {selectedCount > 0
          ? `${selectedCount} selected • ${emailableSelectedCount} eligible for email`
          : "Select students to enable bulk actions"}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Selection
        </Button>

        <Button onClick={onRenderSelected} disabled={selectedCount === 0}>
          <Play className="mr-2 h-4 w-4" />
          Render Selected
        </Button>

        <Button
          variant="secondary"
          onClick={onEmailSelected}
          disabled={emailableSelectedCount === 0 || isSendingBulkEmail}
        >
          <Mail className="mr-2 h-4 w-4" />
          {isSendingBulkEmail ? "Sending..." : "Email Selected"}
        </Button>
      </div>
    </div>
  );
}