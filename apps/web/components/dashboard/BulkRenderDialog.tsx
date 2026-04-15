"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BulkRenderMode } from "@/hooks/useStudents";

interface BulkRenderDialogProps {
  open: boolean;
  title: string;
  description: string;
  scopeCount: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: BulkRenderMode) => Promise<void> | void;
}

export function BulkRenderDialog({
  open,
  title,
  description,
  scopeCount,
  onOpenChange,
  onConfirm,
}: BulkRenderDialogProps) {
  const handleConfirm = async (mode: BulkRenderMode) => {
    await onConfirm(mode);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {scopeCount} student{scopeCount === 1 ? "" : "s"} in scope
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={() => handleConfirm("missing-only")}>Only Missing Videos</Button>

          <Button
            variant="secondary"
            onClick={() => handleConfirm("rerender-all")}>
            Re-render All
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
