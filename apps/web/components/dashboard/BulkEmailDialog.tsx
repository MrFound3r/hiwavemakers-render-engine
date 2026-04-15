"use client";

import { useMemo, useState } from "react";
import type { Student } from "@/types/dashboard";
import { sendBulkStudentVideoEmails } from "@/lib/dashboard/email-templates";
import { getBulkEmailActionLabel } from "@/lib/dashboard/email-ui";
import { TemplateSelector } from "./TemplateSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TemplatePreviewPanel } from "./TemplatePreviewPanel";

const DEFAULT_TEMPLATE_ID = "template_style_hiwave_makers_1";

interface BulkEmailDialogProps {
  open: boolean;
  students: Student[];
  wholeClass?: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => Promise<void>;
}

export function BulkEmailDialog({ open, students, wholeClass = false, onOpenChange, onSent }: BulkEmailDialogProps) {
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleStudents = useMemo(
    () => students.filter((student) => !!student.email && !!student.render_url && student.render_status === "done"),
    [students],
  );

  const skippedCount = students.length - eligibleStudents.length;

  const actionLabel = useMemo(
    () =>
      getBulkEmailActionLabel({
        students: eligibleStudents,
        templateId,
        wholeClass,
      }),
    [eligibleStudents, templateId, wholeClass],
  );

  const scopeLabel = wholeClass ? "whole class" : "selected students";

  const handleSend = async () => {
    if (eligibleStudents.length === 0) {
      toast.error("No eligible students found for email sending.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await sendBulkStudentVideoEmails({
        students: eligibleStudents,
        templateId,
      });

      const mode = response.data?.mode === "reuse" ? "resent" : "sent";
      const sentCount = response.data?.emailTriggerSuccessCount ?? 0;
      const failedCount = response.data?.emailTriggerFailureCount ?? 0;

      await onSent?.();

      if (failedCount > 0) {
        toast.warning(`${sentCount} email${sentCount === 1 ? "" : "s"} ${mode}, ${failedCount} failed to trigger.`);
        return;
      }

      toast.success(`${sentCount} email${sentCount === 1 ? "" : "s"} ${mode} successfully.`);

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send bulk template emails.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{actionLabel}</DialogTitle>
          <DialogDescription>Review the template and send it to the {scopeLabel}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Total in scope</span>
              <span className="font-medium">{students.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Eligible to send</span>
              <span className="font-medium">{eligibleStudents.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Skipped</span>
              <span className="font-medium">{skippedCount}</span>
            </div>
          </div>

          <TemplateSelector
            value={templateId}
            onChange={setTemplateId}
          />

          <TemplatePreviewPanel templateId={templateId} />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSubmitting || eligibleStudents.length === 0}>
            {isSubmitting ? "Sending..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
