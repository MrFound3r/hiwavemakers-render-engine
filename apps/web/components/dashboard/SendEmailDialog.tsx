// apps/web/components/dashboard/SendEmailDialog.tsx
"use client";

import { useEffect, useState } from "react";
import type { Student } from "@/types/dashboard";
import { sendStudentVideoEmail } from "@/lib/dashboard/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SendEmailDialogProps {
  open: boolean;
  student: Student | null;
  onOpenChange: (open: boolean) => void;
}

export function SendEmailDialog({ open, student, onOpenChange }: SendEmailDialogProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setEmail(student?.email ?? "");
  }, [student]);

  const handleSend = async () => {
    if (!student) return;

    setIsSending(true);

    try {
      await sendStudentVideoEmail({ student, email });
      alert(`Email successfully queued for ${student.name}.`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Check console for details.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send video to student</DialogTitle>
          <DialogDescription>
            {student ? `Send the finalized video to ${student.name}.` : "Send finalized video."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label
            htmlFor="student-email"
            className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="student-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !email}>
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
