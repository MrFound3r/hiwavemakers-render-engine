import type { Student } from "@/types/dashboard";
import { insertStudentTemplateHistory, updateStudentCurrentTemplate } from "./api";
import { buildTemplateData } from "./template-registry";
import { resolveStudentSendDecision } from "./email-send-strategy";
import { resolveBulkSendDecision } from "./bulk-email-send-strategy";
import axios from "axios";
import { API_BASE_URL } from "../consts";

function resolveTemplateThumbnail(student: Student) {
  return (
    student.render_thumbnail ?? "https://thisvideosiforyou.com/images/static/thumbnails/hiwave-makers-thumbnail.jpg"
  );
}

function buildEmailRecipient(params: { student: Student; email: string }) {
  const { student, email } = params;

  return {
    recipientId: student.student_uuid,
    videoUrl: student.render_url!,
    thumbnailUrl: resolveTemplateThumbnail(student),
    recipientData: {
      fullName: student.name,
      email,
    },
  };
}

export async function sendStudentVideoEmail(params: { student: Student; email: string; templateId: string }) {
  const { student, email, templateId } = params;

  const decision = await resolveStudentSendDecision({ student, templateId });

  const payload = {
    mode: decision.mode,
    currentUserId: "hiwave_makers",
    templateId,
    webServiceDomain: "https://thisvideosiforyou.com",
    templateData: buildTemplateData({
      templateId,
      thumbnailUrl: resolveTemplateThumbnail(student),
    }),
    recipients: [buildEmailRecipient({ student, email })],
    requestId: decision.requestId,
    requestYear: decision.requestYear,
  };

  const response = await axios.post(`${API_BASE_URL}/firebase/send-template`, payload);
  console.log("🚀 ~ sendStudentVideoEmail ~ response:", response);

  const requestId: string | undefined = response.data?.requestId;
  const requestYear: string | undefined = response.data?.requestYear;
  const templatePath: string | undefined = response.data?.recipients?.[0]?.templatePath;

  if (requestId && requestYear && templatePath) {
    await updateStudentCurrentTemplate({
      roomUuid: student.room_uuid,
      studentUuid: student.student_uuid,
      templateId,
      templateRequestId: requestId,
      templateRequestYear: requestYear,
      templatePath,
    });

    if (decision.mode === "create") {
      await insertStudentTemplateHistory({
        roomUuid: student.room_uuid,
        studentUuid: student.student_uuid,
        templateId,
        templateRequestId: requestId,
        templateRequestYear: requestYear,
        templatePath,
      });
    }
  }

  return response;
}

export async function sendBulkStudentVideoEmails(params: { students: Student[]; templateId: string }) {
  const { students, templateId } = params;

  const decision = resolveBulkSendDecision({ students, templateId });

  const recipients = students.map((student) =>
    buildEmailRecipient({
      student,
      email: student.email!,
    }),
  );

  const payload = {
    mode: decision.mode,
    currentUserId: "hiwave_makers",
    templateId,
    webServiceDomain: "https://thisvideosiforyou.com",
    templateData: buildTemplateData({ templateId }),
    recipients,
    requestId: decision.requestId,
    requestYear: decision.requestYear,
  };

  const response = await axios.post(`${API_BASE_URL}/firebase/send-template`, payload);
  console.log("🚀 ~ sendBulkStudentVideoEmails ~ response:", response);

  const requestId: string | undefined = response.data?.requestId;
  const requestYear: string | undefined = response.data?.requestYear;
  const returnedRecipients: Array<{
    recipientId: string;
    templatePath: string;
  }> = response.data?.recipients ?? [];

  if (requestId && requestYear && returnedRecipients.length > 0) {
    const studentMap = new Map(students.map((student) => [student.student_uuid, student]));

    await Promise.all(
      returnedRecipients.map(async (recipient) => {
        const student = studentMap.get(recipient.recipientId);
        if (!student || !recipient.templatePath) return;

        await updateStudentCurrentTemplate({
          roomUuid: student.room_uuid,
          studentUuid: student.student_uuid,
          templateId,
          templateRequestId: requestId,
          templateRequestYear: requestYear,
          templatePath: recipient.templatePath,
        });

        if (decision.mode === "create") {
          await insertStudentTemplateHistory({
            roomUuid: student.room_uuid,
            studentUuid: student.student_uuid,
            templateId,
            templateRequestId: requestId,
            templateRequestYear: requestYear,
            templatePath: recipient.templatePath,
          });
        }
      }),
    );
  }

  return response;
}
