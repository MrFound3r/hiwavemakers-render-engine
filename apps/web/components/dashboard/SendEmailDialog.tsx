"use client";

import { useEffect, useMemo, useState } from "react";
import type { Student } from "@/types/dashboard";
import { sendStudentVideoEmail } from "@/lib/dashboard/email-templates";
import { getSingleEmailActionLabel } from "@/lib/dashboard/email-ui";
import { TemplateSelector } from "./TemplateSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface SendEmailDialogProps {
  open: boolean;
  student: Student | null;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

export function SendEmailDialog({ open, student, onOpenChange, onSent }: SendEmailDialogProps) {
  const [email, setEmail] = useState("");
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !student) return;

    setEmail(student.email ?? "");
    setTemplateId(student.current_template_id ?? DEFAULT_TEMPLATE_ID);
  }, [open, student]);

  const actionLabel = useMemo(() => {
    if (!student) return "Send Email";
    return getSingleEmailActionLabel({ student, templateId });
  }, [student, templateId]);

  const handleSend = async () => {
    if (!student) return;

    if (!email.trim()) {
      toast.error("Please provide an email address.");
      return;
    }

    if (!student.render_url || student.render_status !== "done") {
      toast.error("This student does not have a completed render yet.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await sendStudentVideoEmail({
        student,
        email: email.trim(),
        templateId,
      });

      const mode = response.data?.mode === "reuse" ? "resent" : "sent";

      toast.success(`Template email ${mode} for ${student.name}.`);

      await onSent?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send the template email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{actionLabel}</DialogTitle>
          <DialogDescription>
            {student ? `Send a template email for ${student.name}.` : "Send a template email."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipient Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              type="email"
            />
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
            disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
