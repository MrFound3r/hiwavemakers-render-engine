import type { Student } from "@/types/dashboard";
import { fetchLatestStudentTemplateHistory } from "./api";

export interface StudentSendDecision {
  mode: "create" | "reuse";
  requestId?: string;
  requestYear?: string;
}

export async function resolveStudentSendDecision(params: {
  student: Student;
  templateId: string;
}): Promise<StudentSendDecision> {
  const { student, templateId } = params;

  if (
    student.current_template_id === templateId &&
    student.current_template_request_id &&
    student.current_template_request_year
  ) {
    return {
      mode: "reuse",
      requestId: student.current_template_request_id,
      requestYear: student.current_template_request_year,
    };
  }

  const latestHistory = await fetchLatestStudentTemplateHistory({
    roomUuid: student.room_uuid,
    studentUuid: student.student_uuid,
    templateId,
  });

  if (latestHistory?.template_request_id && latestHistory?.template_request_year) {
    return {
      mode: "reuse",
      requestId: latestHistory.template_request_id,
      requestYear: latestHistory.template_request_year,
    };
  }

  return { mode: "create" };
}
