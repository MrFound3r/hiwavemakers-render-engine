import axios from "axios";
import { API_BASE_URL } from "../consts";
import type { Room, Student } from "@/types/dashboard";
import { buildRenderPayload } from "./render";

export interface TemplateOption {
  id: string;
  label: string;
  previewUrl: string;
}

interface LatestTemplateHistory {
  id: number;
  room_uuid: string;
  student_uuid: string;
  template_id: string;
  template_request_id: string;
  template_request_year: string;
  template_path: string;
  created_at: string;
}

interface RenderQueueItem {
  id?: string;
}

export async function fetchRooms(): Promise<Room[]> {
  const res = await axios.get(`${API_BASE_URL}/students/rooms`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchStudentsByRoom(roomUuid: string): Promise<Student[]> {
  const res = await axios.get(`${API_BASE_URL}/students/room/${roomUuid}`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function enqueueRenderForStudents(students: Student[]): Promise<string[]> {
  if (students.length === 0) {
    return [];
  }

  const payload = students.flatMap((student) => buildRenderPayload(student));

  const renderResponse = await axios.post<RenderQueueItem[]>(`${API_BASE_URL}/render`, payload);

  const queuedRenders = Array.isArray(renderResponse.data) ? renderResponse.data : [];

  if (queuedRenders.length !== students.length) {
    throw new Error(
      `Unexpected render response length. Expected ${students.length}, received ${queuedRenders.length}.`,
    );
  }

  const renderIds = queuedRenders.map((item, index) => {
    const renderId = item?.id;

    if (!renderId) {
      throw new Error(`Render ID missing from render response at index ${index}.`);
    }

    return renderId;
  });

  await Promise.all(
    students.map((student, index) =>
      axios.patch(`${API_BASE_URL}/students/${student.room_uuid}/${student.student_uuid}/render-id`, {
        renderId: renderIds[index],
      }),
    ),
  );

  return renderIds;
}

export async function enqueueRenderForStudent(student: Student): Promise<string> {
  const [renderId] = await enqueueRenderForStudents([student]);

  if (!renderId) {
    throw new Error("Render ID missing from render response.");
  }

  return renderId;
}

export async function updateStudentCurrentTemplate(params: {
  roomUuid: string;
  studentUuid: string;
  templateId: string;
  templateRequestId: string;
  templateRequestYear: string;
  templatePath: string;
}) {
  const { roomUuid, studentUuid, ...body } = params;

  return axios.patch(`${API_BASE_URL}/students/${roomUuid}/${studentUuid}/current-template`, body);
}

export async function insertStudentTemplateHistory(params: {
  roomUuid: string;
  studentUuid: string;
  templateId: string;
  templateRequestId: string;
  templateRequestYear: string;
  templatePath: string;
}) {
  const { roomUuid, studentUuid, ...body } = params;

  return axios.post(`${API_BASE_URL}/students/${roomUuid}/${studentUuid}/template-history`, body);
}

export async function fetchLatestStudentTemplateHistory(params: {
  roomUuid: string;
  studentUuid: string;
  templateId: string;
}) {
  const { roomUuid, studentUuid, templateId } = params;

  const response = await axios.get<LatestTemplateHistory | null>(
    `${API_BASE_URL}/students/${roomUuid}/${studentUuid}/template-history/latest`,
    {
      params: { templateId },
    },
  );

  return response.data;
}
