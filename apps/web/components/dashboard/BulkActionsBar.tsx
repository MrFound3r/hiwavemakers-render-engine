"use client";

import { Button } from "@/components/ui/button";
import { Mail, Play, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onRenderSelected: () => void | Promise<void>;
  onEmailSelected: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onRenderSelected,
  onEmailSelected,
}: BulkActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
      <div className="text-sm text-muted-foreground">
        {selectedCount > 0 ? `${selectedCount} selected` : "Select students to enable bulk actions"}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onClearSelection}
          disabled={selectedCount === 0}>
          <X className="mr-2 h-4 w-4" />
          Clear Selection
        </Button>

        <Button
          onClick={onRenderSelected}
          disabled={selectedCount === 0}>
          <Play className="mr-2 h-4 w-4" />
          Render Selected
        </Button>

        <Button
          variant="secondary"
          onClick={onEmailSelected}
          disabled={selectedCount === 0}>
          <Mail className="mr-2 h-4 w-4" />
          Email Selected
        </Button>
      </div>
    </div>
  );
}
