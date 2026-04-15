// apps/web/lib/dashboard/api.ts
import axios from "axios";
import { API_BASE_URL } from "../consts";
import type { Room, Student } from "@/types/dashboard";
import { buildRenderPayload } from "./render";

interface SendTemplateRecipientPayload {
  recipientId: string;
  videoUrl: string;
  template_thumbnail?: string;
  recipientData: {
    fullName: string;
    email: string;
  };
}

interface SendTemplatePayload {
  currentUserId: string;
  templateId: string;
  webServiceDomain: string;
  templateData: Record<string, unknown>;
  recipients: SendTemplateRecipientPayload[];
}

export async function fetchRooms(): Promise<Room[]> {
  const res = await axios.get(`${API_BASE_URL}/students/rooms`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchStudentsByRoom(roomUuid: string): Promise<Student[]> {
  const res = await axios.get(`${API_BASE_URL}/students/room/${roomUuid}`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function enqueueRenderForStudent(student: Student): Promise<string> {
  const renderResponse = await axios.post(`${API_BASE_URL}/render`, buildRenderPayload(student));

  const renderId = renderResponse.data?.[0]?.id;

  if (!renderId) {
    throw new Error("Render ID missing from render response.");
  }

  await axios.patch(`${API_BASE_URL}/students/${student.room_uuid}/${student.student_uuid}/render-id`, { renderId });

  return renderId;
}

const DEFAULT_TEMPLATE_THUMBNAIL = "https://thisvideosiforyou.com/images/static/thumbnails/hiwave-makers-thumbnail.jpg";

function resolveTemplateThumbnail(student: Student) {
  return student.render_thumbnail ?? DEFAULT_TEMPLATE_THUMBNAIL;
}

function buildEmailTemplateData(overrides?: Partial<ReturnType<typeof buildBaseEmailTemplateData>>) {
  return {
    ...buildBaseEmailTemplateData(),
    ...overrides,
  };
}

function buildBaseEmailTemplateData() {
  return {
    template_style: "template_style_hiwave_makers_1",
    template_logo: "https://thisvideosiforyou.com/images/static/hiwavemakers-horiz.png",
    template_thumbnail: DEFAULT_TEMPLATE_THUMBNAIL,
    template_favicon: "https://thisvideosiforyou.com/images/static/hiwave-favicon.png",
    template_headline: "We're So Proud of You, {{firstName}}",
    template_message:
      "{{firstName}}, watching you work through ideas, try again when something didn't work, and light up when it finally did has been amazing. Every project you built shows your creativity, patience, and how much you've grown. This video is a small glimpse of your effort, your curiosity, and the confidence you gained along the way—and we couldn't be more proud of you.",
    template_sub_message: "",
    call_to_action: "no",
    call_to_action_title: "",
    call_to_action_redirect_link: "",
  };
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

export async function sendStudentVideoEmail(params: { student: Student; email: string }) {
  const { student, email } = params;

  const payload: SendTemplatePayload = {
    currentUserId: "hiwave_makers",
    templateId: "template_style_hiwave_makers_1",
    webServiceDomain: "https://thisvideosiforyou.com",
    templateData: buildEmailTemplateData({
      template_thumbnail: resolveTemplateThumbnail(student),
    }),
    recipients: [buildEmailRecipient({ student, email })],
  };

  return axios.post(`${API_BASE_URL}/firebase/send-template`, payload);
}

export async function sendBulkStudentVideoEmails(students: Student[]) {
  const recipients = students.map((student) =>
    buildEmailRecipient({
      student,
      email: student.email!,
    }),
  );

  const payload: SendTemplatePayload = {
    currentUserId: "hiwave_makers",
    templateId: "template_style_hiwave_makers_1",
    webServiceDomain: "https://thisvideosiforyou.com",
    templateData: buildEmailTemplateData(),
    recipients,
  };

  return axios.post(`${API_BASE_URL}/firebase/send-template`, payload);
}
