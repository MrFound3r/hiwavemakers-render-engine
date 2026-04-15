import type { Student } from "@/types/dashboard";
import { resolveBulkSendDecision } from "./bulk-email-send-strategy";

export function getSingleEmailActionLabel(params: { student: Student; templateId: string }) {
  const { student, templateId } = params;

  const isSameCurrentTemplate =
    student.current_template_id === templateId &&
    !!student.current_template_request_id &&
    !!student.current_template_request_year;

  return isSameCurrentTemplate ? "Resend Email" : "Send Email";
}

export function getBulkEmailActionLabel(params: { students: Student[]; templateId: string; wholeClass?: boolean }) {
  const { students, templateId, wholeClass = false } = params;

  const decision = resolveBulkSendDecision({ students, templateId });
  const scope = wholeClass ? "Whole Class" : "Selected";

  return decision.mode === "reuse" ? `Resend ${scope}` : `Send ${scope}`;
}
