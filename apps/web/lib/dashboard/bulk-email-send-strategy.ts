import type { Student } from "@/types/dashboard";

export interface BulkSendDecision {
  mode: "create" | "reuse";
  requestId?: string;
  requestYear?: string;
}

export function resolveBulkSendDecision(params: { students: Student[]; templateId: string }): BulkSendDecision {
  const { students, templateId } = params;

  if (students.length === 0) {
    return { mode: "create" };
  }

  const first = students[0];

  if (
    !first.current_template_request_id ||
    !first.current_template_request_year ||
    first.current_template_id !== templateId
  ) {
    return { mode: "create" };
  }

  const allShareSameCurrentRequest = students.every(
    (student) =>
      student.current_template_id === templateId &&
      student.current_template_request_id === first.current_template_request_id &&
      student.current_template_request_year === first.current_template_request_year,
  );

  if (!allShareSameCurrentRequest) {
    return { mode: "create" };
  }

  return {
    mode: "reuse",
    requestId: first.current_template_request_id,
    requestYear: first.current_template_request_year,
  };
}
