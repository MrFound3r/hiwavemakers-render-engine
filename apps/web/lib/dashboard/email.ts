// apps/web/lib/dashboard/email.ts

import type { Student } from "@/types/dashboard";
import { isRenderDone } from "./status";

export function canEmailStudent(student: Student) {
  return isRenderDone(student.render_status) && !!student.render_url && !!student.email;
}

export function getEmailableStudents(students: Student[]) {
  return students.filter(canEmailStudent);
}
